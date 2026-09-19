import { NextResponse } from 'next/server';
import { getStats } from '@/lib/tracker';

export async function GET(request) {
  // Simple "security" - require a ?key= query parameter to view stats
  // In a real app, use NextAuth or similar. For local testing, this is fine.
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');
  
  if (key !== 'admin123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const stats = getStats();
  return NextResponse.json(stats);
}
