export default function sitemap() {
  return [
    {
      url: 'https://ai-visibility.thehubcontent.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://ai-visibility.thehubcontent.com/glossary',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}
