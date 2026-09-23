import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Proxy (formerly middleware) – IP-based rate limiting for AI Visibility Checker
 *
 * Rules (per unique IP):
 *  - /api/audit     → 10 requests / 60 seconds
 *  - /api/discover  → 5  requests / 60 seconds
 *  - All other API  → 30 requests / 60 seconds
 *
 * Requires env vars: UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 * Falls back to pass-through when Redis is not configured (local dev).
 */

const isRedisConfigured =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

let auditLimiter, discoverLimiter, generalLimiter;

if (isRedisConfigured) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  auditLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '60 s'),
    analytics: true,
    prefix: 'rl:audit',
  });

  discoverLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    analytics: true,
    prefix: 'rl:discover',
  });

  generalLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    analytics: true,
    prefix: 'rl:general',
  });
}

function getIp(req) {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  // Only rate-limit API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // If Redis is not configured, skip rate limiting (safe for local dev)
  if (!isRedisConfigured) {
    return NextResponse.next();
  }

  const ip = getIp(req);
  let limiter, limitKey;

  if (pathname.startsWith('/api/audit')) {
    limiter = auditLimiter;
    limitKey = `audit:${ip}`;
  } else if (pathname.startsWith('/api/discover')) {
    limiter = discoverLimiter;
    limitKey = `discover:${ip}`;
  } else {
    limiter = generalLimiter;
    limitKey = `general:${ip}`;
  }

  try {
    const { success, limit, remaining, reset } = await limiter.limit(limitKey);

    const headers = {
      'X-RateLimit-Limit': String(limit),
      'X-RateLimit-Remaining': String(remaining),
      'X-RateLimit-Reset': String(reset),
    };

    if (!success) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000);
      return new NextResponse(
        JSON.stringify({
          error: 'Too Many Requests',
          message:
            'You have exceeded the usage limit. Please wait a moment before scanning again.',
          retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(retryAfter),
            ...headers,
          },
        }
      );
    }

    const response = NextResponse.next();
    Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (err) {
    // Fail open — never block real users due to Redis errors
    console.error('[proxy] Rate limit error:', err);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/api/:path*'],
};
