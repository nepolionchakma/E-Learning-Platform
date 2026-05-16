import Link from 'next/link'
import { notFound } from 'next/navigation'
import { promises as fs } from 'fs'
import path from 'path'

interface Blog {
  slug: string
  title: string
  content: string
  author: string
  date: string
}

async function getBlogs(): Promise<Blog[]> {
  try {
    const raw = await fs.readFile(
      path.join(process.cwd(), 'src', 'data', 'blogs.json'),
      'utf-8',
    )
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const blogs = await getBlogs()
  const blog = blogs.find((b) => b.slug === slug)

  if (!blog) notFound()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/blogs"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Blogs
      </Link>

      <article>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {blog.title}
        </h1>
        <div className="flex items-center gap-3 mt-3 text-sm text-zinc-400">
          <span>By {blog.author}</span>
          <span>·</span>
          <span>{blog.date}</span>
        </div>
        <div className="mt-8 text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {blog.content}
        </div>
      </article>
    </div>
  )
}
