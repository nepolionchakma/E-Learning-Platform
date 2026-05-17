import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface Engagement {
  slug: string
  likes: number
  shares: number
}

const dataDir = path.join(process.cwd(), 'src', 'data')

function getEngagementFile(slug: string): string {
  return path.join(dataDir, `engagement-${slug}.json`)
}

async function ensureEngagementFile(slug: string) {
  const filePath = getEngagementFile(slug)
  try {
    await fs.access(filePath)
  } catch {
    const initial: Engagement = { slug, likes: 0, shares: 0 }
    await fs.writeFile(filePath, JSON.stringify(initial, null, 2), 'utf-8')
  }
}

async function readEngagement(slug: string): Promise<Engagement> {
  await ensureEngagementFile(slug)
  const filePath = getEngagementFile(slug)
  const raw = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(raw)
}

async function writeEngagement(slug: string, data: Engagement) {
  const filePath = getEngagementFile(slug)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return Response.json({ error: 'Slug is required' }, { status: 400 })
  }

  const engagement = await readEngagement(slug)
  return Response.json(engagement)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { slug, action } = body

    if (!slug) {
      return Response.json({ error: 'Missing slug' }, { status: 400 })
    }

    if (!action) {
      return Response.json({ error: 'Missing action' }, { status: 400 })
    }

    await ensureEngagementFile(slug)
    const engagement = await readEngagement(slug)

    if (action === 'like') {
      engagement.likes += 1
      await writeEngagement(slug, engagement)
      return Response.json({ likes: engagement.likes })
    }

    if (action === 'unlike') {
      engagement.likes = Math.max(0, engagement.likes - 1)
      await writeEngagement(slug, engagement)
      return Response.json({ likes: engagement.likes })
    }

    if (action === 'share') {
      engagement.shares += 1
      await writeEngagement(slug, engagement)
      return Response.json({ shares: engagement.shares })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Engagement API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
