import type { MetadataRoute } from 'next'
import { promises as fs } from 'fs'
import path from 'path'
import site from '@/data/site.json'
import topicsData from '@/data/topics.json'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: site.url, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${site.url}/blogs`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ]

  const topicPages: MetadataRoute.Sitemap = topicsData.map((t) => ({
    url: `${site.url}/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  let blogPages: MetadataRoute.Sitemap = []
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'src', 'data', 'blogs.json'),
      'utf-8',
    )
    const blogs = JSON.parse(raw)
    blogPages = blogs.map((b: { slug: string; date: string }) => ({
      url: `${site.url}/blogs/${b.slug}`,
      lastModified: new Date(b.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {}

  return [...staticPages, ...topicPages, ...blogPages]
}
