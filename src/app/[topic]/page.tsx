import { notFound } from 'next/navigation'
import ContentRenderer from '@/components/ContentRenderer'
import topicsData from '@/data/topics.json'
import jsData from '@/data/javascript.json'
import tsData from '@/data/typescript.json'
import reactData from '@/data/react.json'
import rnData from '@/data/react-native.json'
import linuxData from '@/data/linux.json'
import devopsData from '@/data/devops.json'
import dbData from '@/data/database.json'
import mlData from '@/data/machine-learning.json'

const dataMap: Record<string, any> = {
  'javascript': jsData,
  'typescript': tsData,
  'react': reactData,
  'react-native': rnData,
  'linux': linuxData,
  'devops': devopsData,
  'database': dbData,
  'machine-learning': mlData,
}

export async function generateStaticParams() {
  return topicsData.map((t) => ({ topic: t.slug }))
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params
  const topicMeta = topicsData.find((t) => t.slug === topic)
  if (!topicMeta) notFound()

  const data = dataMap[topic]
  if (!data) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <span className="text-4xl mb-2 block">{topicMeta.icon}</span>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">{data.title}</h1>
        <p className="text-zinc-500 mt-2">{data.description}</p>
      </div>
      <ContentRenderer data={data} />
    </div>
  )
}
