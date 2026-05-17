'use client'

import { useState, useEffect } from 'react'

interface BlogActionsProps {
  slug: string
  title: string
}

export default function BlogActions({ slug, title }: BlogActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [shareCount, setShareCount] = useState(0)
  const [shareFeedback, setShareFeedback] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEngagement()
    checkLiked()
  }, [slug])

  const checkLiked = () => {
    const stored = localStorage.getItem(`blog-liked-${slug}`)
    setLiked(stored === 'true')
  }

  const fetchEngagement = async () => {
    try {
      const res = await fetch(`/api/engagement?slug=${slug}`)
      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.likes)
        setShareCount(data.shares)
      }
    } catch {
      console.error('Failed to fetch engagement')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    try {
      const action = liked ? 'unlike' : 'like'
      const res = await fetch('/api/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action }),
      })

      if (res.ok) {
        const data = await res.json()
        setLikeCount(data.likes)
        setLiked(!liked)
        localStorage.setItem(`blog-liked-${slug}`, String(!liked))
      }
    } catch {
      console.error('Failed to update like')
    }
  }

  const handleShare = async () => {
    const url = window.location.href
    const text = `Check out: ${title}`

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        setShareFeedback('Shared!')
        incrementShare()
      } catch {
        return
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShareFeedback('Link copied!')
        incrementShare()
      } catch {
        setShareFeedback('Failed to copy')
      }
    }

    setTimeout(() => setShareFeedback(''), 2000)
  }

  const incrementShare = async () => {
    try {
      const res = await fetch('/api/engagement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, action: 'share' }),
      })

      if (res.ok) {
        const data = await res.json()
        setShareCount(data.shares)
      }
    } catch {
      console.error('Failed to update share')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
        <div className="h-9 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
        <div className="h-9 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-700">
      <button
        onClick={handleLike}
        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
          liked
            ? 'border-pink-300 dark:border-pink-700 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
            : 'border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 hover:border-pink-300 hover:text-pink-600 dark:hover:border-pink-700 dark:hover:text-pink-400'
        }`}
      >
        <svg
          className={`w-5 h-5 transition-transform ${liked ? 'scale-110 fill-current' : ''}`}
          fill={liked ? 'currentColor' : 'none'}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        <span>{likeCount}</span>
      </button>

      <div className="relative">
        <button
          onClick={handleShare}
          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 text-sm font-medium hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-700 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share
          {shareCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
              {shareCount}
            </span>
          )}
        </button>
        {shareFeedback && (
          <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs rounded-md bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 whitespace-nowrap">
            {shareFeedback}
          </span>
        )}
      </div>
    </div>
  )
}
