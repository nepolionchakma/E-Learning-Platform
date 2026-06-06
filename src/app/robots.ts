import type { MetadataRoute } from 'next'
import site from '@/data/site.json'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/blogs/new'],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  }
}
