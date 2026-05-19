import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface CommentNode {
  id: string
  name: string
  text: string
  date: string
  replies: CommentNode[]
}

const dataDir = path.join(process.cwd(), 'src', 'data')

function getCommentsFile(slug: string): string {
  return path.join(dataDir, slug, 'comments.json')
}

async function ensureCommentsFile(slug: string) {
  const filePath = getCommentsFile(slug)
  try {
    await fs.access(filePath)
  } catch {
    await fs.writeFile(filePath, '[]', 'utf-8')
  }
}

async function readComments(slug: string): Promise<CommentNode[]> {
  await ensureCommentsFile(slug)
  const filePath = getCommentsFile(slug)
  const raw = await fs.readFile(filePath, 'utf-8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

async function writeComments(slug: string, comments: CommentNode[]) {
  const filePath = getCommentsFile(slug)
  await fs.writeFile(filePath, JSON.stringify(comments, null, 2), 'utf-8')
}

function findNode(nodes: CommentNode[], id: string): CommentNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    const found = findNode(node.replies, id)
    if (found) return found
  }
  return null
}

function addChildNode(nodes: CommentNode[], parentId: string, child: CommentNode): boolean {
  for (const node of nodes) {
    if (node.id === parentId) {
      node.replies.push(child)
      return true
    }
    if (addChildNode(node.replies, parentId, child)) return true
  }
  return false
}

function removeNode(nodes: CommentNode[], id: string): CommentNode[] {
  return nodes
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, replies: removeNode(n.replies, id) }))
}

function countAll(nodes: CommentNode[]): number {
  return nodes.reduce((sum, n) => sum + 1 + countAll(n.replies), 0)
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  if (!slug) {
    return Response.json({ error: 'Slug is required' }, { status: 400 })
  }

  const comments = await readComments(slug)
  return Response.json({ comments, total: countAll(comments) })
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

    await ensureCommentsFile(slug)
    const comments = await readComments(slug)

    if (action === 'add') {
      const { name, text } = body
      if (!name?.trim() || !text?.trim()) {
        return Response.json({ error: 'Name and text required' }, { status: 400 })
      }

      const newComment: CommentNode = {
        id: Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        date: new Date().toISOString(),
        replies: [],
      }

      comments.unshift(newComment)
      await writeComments(slug, comments)
      return Response.json(newComment, { status: 201 })
    }

    if (action === 'reply') {
      const { parentId, name, text } = body
      if (!parentId || !name?.trim() || !text?.trim()) {
        return Response.json({ error: 'Parent ID, name, and text required' }, { status: 400 })
      }

      const parent = findNode(comments, parentId)
      if (!parent) {
        return Response.json({ error: 'Parent not found' }, { status: 404 })
      }

      const newReply: CommentNode = {
        id: Date.now().toString(),
        name: name.trim(),
        text: text.trim(),
        date: new Date().toISOString(),
        replies: [],
      }

      parent.replies.push(newReply)
      await writeComments(slug, comments)
      return Response.json(newReply, { status: 201 })
    }

    if (action === 'delete') {
      const { commentId } = body
      if (!commentId) {
        return Response.json({ error: 'Comment ID required' }, { status: 400 })
      }

      const updated = removeNode(comments, commentId)
      await writeComments(slug, updated)
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Comments API error:', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
