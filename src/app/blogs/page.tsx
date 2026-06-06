import type { Metadata } from 'next'
import Link from 'next/link'
import { promises as fs } from 'fs'
import path from 'path'
import site from '@/data/site.json'

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

export const metadata: Metadata = {
  title: 'Blogs',
  description: 'Read articles and tutorials about programming, DevOps, databases, and more.',
  openGraph: {
    title: 'Blogs - E-Learning Platform',
    description: 'Read articles and tutorials about programming, DevOps, databases, and more.',
    url: `${site.url}/blogs`,
  },
  twitter: {
    title: 'Blogs - E-Learning Platform',
    description: 'Read articles and tutorials about programming, DevOps, databases, and more.',
  },
}

export default async function BlogsPage() {
  const blogs = await getBlogs()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-4xl mb-2 block">📝</span>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Blogs
          </h1>
          <p className="text-zinc-500 mt-2">
            Read articles or share your own knowledge.
          </p>
        </div>
        <Link
          href="/blogs/new"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Write Blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-5xl block mb-4">📭</span>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
            No blogs yet
          </h2>
          <p className="text-zinc-500 mb-6">
            Be the first to write a blog post!
          </p>
          <Link
            href="/blogs/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Write the First Blog
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {blogs.map((blog) => (
            <Link
              key={blog.slug}
              href={`/blogs/${blog.slug}`}
              className="block p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {blog.title}
              </h2>
              <p className="text-sm text-zinc-500 mt-1 line-clamp-2">
                {blog.content}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs text-zinc-400">
                <span>By {blog.author}</span>
                <span>·</span>
                <span>{blog.date}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
