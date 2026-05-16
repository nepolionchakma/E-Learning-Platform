import { NextRequest } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const dataFile = path.join(process.cwd(), 'src', 'data', 'blogs.json')

interface Blog {
  slug: string
  title: string
  content: string
  author: string
  date: string
}

async function readBlogs(): Promise<Blog[]> {
  try {
    const raw = await fs.readFile(dataFile, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeBlogs(blogs: Blog[]) {
  await fs.writeFile(dataFile, JSON.stringify(blogs, null, 2), 'utf-8')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function GET() {
  const blogs = await readBlogs()
  return Response.json(blogs)
}

export async function POST(req: NextRequest) {
  const { title, content, author } = await req.json()

  if (!title || !content) {
    return Response.json({ error: 'Title and content are required' }, { status: 400 })
  }

  const blogs = await readBlogs()
  let slug = slugify(title)
  if (!slug) slug = 'post'

  let uniqueSlug = slug
  let counter = 1
  while (blogs.some((b) => b.slug === uniqueSlug)) {
    uniqueSlug = `${slug}-${counter++}`
  }

  const blog: Blog = {
    slug: uniqueSlug,
    title,
    content,
    author: author || 'Anonymous',
    date: new Date().toISOString().split('T')[0],
  }

  blogs.unshift(blog)
  await writeBlogs(blogs)

  return Response.json(blog, { status: 201 })
}
