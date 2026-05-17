'use client'

import { useState, useEffect } from 'react'
import Dialog from '@/components/Dialog'

interface CommentNode {
  id: string
  name: string
  text: string
  date: string
  replies: CommentNode[]
}

interface CommentSectionProps {
  slug: string
}

function ReplyForm({
  slug,
  parentId,
  onReplyPosted,
  onCancel,
}: {
  slug: string
  parentId: string
  onReplyPosted: () => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim() || !text.trim()) return

    setError('')
    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          action: 'reply',
          parentId,
          name: name.trim(),
          text: text.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to post reply')
        setSubmitting(false)
        return
      }

      setName('')
      setText('')
      onReplyPosted()
    } catch {
      setError('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 ml-3 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
      <div className="mb-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-sm"
        />
      </div>
      <div className="mb-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a reply..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-vertical text-sm"
        />
      </div>
      {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
      <div className="flex gap-2">
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="cursor-pointer px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Reply'}
        </button>
        <button
          onClick={onCancel}
          className="cursor-pointer px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function CommentItem({
  slug,
  comment,
  depth = 0,
  onDelete,
}: {
  slug: string
  comment: CommentNode
  depth?: number
  onDelete: (id: string) => void
}) {
  const [showReply, setShowReply] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const maxDepth = 5
  const canReply = depth < maxDepth

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleDeleteClick = () => {
    setDeleteTarget(comment.id)
  }

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      onDelete(deleteTarget)
      setDeleteTarget(null)
    }
  }

  return (
    <>
      <div className={`${depth > 0 ? 'ml-3 sm:ml-4 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-700' : ''}`}>
        <div className={`${depth > 0 ? 'py-3' : 'p-3 sm:p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0 flex-wrap">
              <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm truncate">{comment.name}</span>
              <span className="text-xs text-zinc-400 whitespace-nowrap">{formatDate(comment.date)}</span>
              {depth > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 whitespace-nowrap">
                  reply
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {comment.replies.length > 0 && (
                <button
                  onClick={() => setCollapsed(!collapsed)}
                  className="cursor-pointer p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                  title={collapsed ? 'Expand replies' : 'Collapse replies'}
                >
                  <svg
                    className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleDeleteClick}
                className="cursor-pointer p-1 rounded-md text-zinc-400 hover:text-red-500 transition-colors"
                title="Delete"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed break-words">{comment.text}</p>

          {canReply && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="cursor-pointer mt-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
            >
              {showReply ? 'Cancel' : 'Reply'}
            </button>
          )}

          {showReply && (
            <ReplyForm
              slug={slug}
              parentId={comment.id}
              onReplyPosted={() => {
                setShowReply(false)
                onDelete(comment.id)
              }}
              onCancel={() => setShowReply(false)}
            />
          )}
        </div>

        {!collapsed && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                slug={slug}
                comment={reply}
                depth={depth + 1}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete Comment"
        description="Are you sure you want to delete this comment? This action cannot be undone."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        variant="danger"
      />
    </>
  )
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const [comments, setComments] = useState<CommentNode[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [slug])

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        setComments(data.comments)
      }
    } catch {
      console.error('Failed to fetch comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !text.trim()) return

    setSubmitting(true)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'add', name: name.trim(), text: text.trim() }),
      })

      if (res.ok) {
        await fetchComments()
        setName('')
        setText('')
      }
    } catch {
      console.error('Failed to post comment')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'delete', commentId }),
      })

      if (res.ok) {
        await fetchComments()
      }
    } catch {
      console.error('Failed to delete')
    }
  }

  const totalComments = comments.reduce((sum, c) => sum + 1 + countReplies(c.replies), 0)

  function countReplies(replies: CommentNode[]): number {
    return replies.reduce((sum, r) => sum + 1 + countReplies(r.replies), 0)
  }

  return (
    <div className="mt-10 pt-8 border-t border-zinc-200 dark:border-zinc-700">
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
        Comments ({totalComments})
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 p-4 sm:p-5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
        <div className="mb-4">
          <label htmlFor="comment-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Name
          </label>
          <input
            id="comment-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="comment-text" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
            Comment
          </label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Share your thoughts..."
            required
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-vertical"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="cursor-pointer px-5 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </form>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-zinc-500 dark:text-zinc-400">Loading comments...</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-10">
          <span className="text-4xl block mb-3">💬</span>
          <p className="text-zinc-500 dark:text-zinc-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              slug={slug}
              comment={comment}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}
