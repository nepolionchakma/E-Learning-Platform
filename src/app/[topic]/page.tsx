import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ContentRenderer from '@/components/ContentRenderer'
import topicsData from '@/data/topics.json'
import site from '@/data/site.json'
import { loadTopicData } from '@/lib/loadData'

export async function generateStaticParams() {
  return topicsData.map((t) => ({ topic: t.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }): Promise<Metadata> {
  const { topic } = await params
  const topicMeta = topicsData.find((t) => t.slug === topic)
  if (!topicMeta) return {}

  const canonicalUrl = `${site.url}/${topic}`

  return {
    title: `${topicMeta.title} - Learn ${topicMeta.title}`,
    description: topicMeta.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${topicMeta.title} - E-Learning Platform`,
      description: topicMeta.description,
      url: canonicalUrl,
    },
    twitter: {
      title: `${topicMeta.title} - E-Learning Platform`,
      description: topicMeta.description,
    },
  }
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const topicMeta = topicsData.find((t) => t.slug === topic)
  if (!topicMeta) notFound()

  const data = await loadTopicData(topic)
  if (!data) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">{topicMeta.icon}</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{data.title}</h1>
        <p className="text-zinc-500 mt-2">{data.description}</p>
      </div>
      <ContentRenderer data={data} topic={topic} />
    </div>
  )
}
