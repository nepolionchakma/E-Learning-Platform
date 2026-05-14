'use client'

import { useState, useEffect, useRef } from 'react'
import { useToast } from './ToastContext'

export default function Accordion({
  title,
  topicSlug,
  stageIndex,
  defaultOpen = false,
  children
}: {
  title: string
  topicSlug: string
  stageIndex: number
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [completed, setCompleted] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)
  const observerReady = useRef(false)
  const { showToast } = useToast()
  const storageKey = `stage-${topicSlug}-${stageIndex}`

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored === 'completed') setCompleted(true)
  }, [storageKey])

  useEffect(() => {
    if (!open) {
      observerReady.current = false
      return
    }

    const timer = setTimeout(() => {
      observerReady.current = true
    }, 1500)

    return () => clearTimeout(timer)
  }, [open])

  useEffect(() => {
    if (!open || !sentinelRef.current) return
    const el = sentinelRef.current

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && observerReady.current && !completed) {
          setCompleted(true)
          localStorage.setItem(storageKey, 'completed')
          showToast(`${title} ✓ Completed`)
        }
      },
      { rootMargin: '0px 0px -80px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [open, completed, title, storageKey, showToast])

  const toggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next = !completed
    setCompleted(next)
    localStorage.setItem(storageKey, next ? 'completed' : '')
    showToast(`${title} ${next ? '✓' : '○'} ${next ? 'Completed' : 'Unmarked'}`)
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <span
            onClick={toggleComplete}
            className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer ${
              completed
                ? 'bg-green-500 border-green-500'
                : 'border-zinc-300 dark:border-zinc-600 hover:border-green-400'
            }`}
          >
            {completed && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
        </div>
        <svg
          className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          open ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-700">
          {children}
          <div ref={sentinelRef} className="h-1" />
        </div>
      </div>
    </div>
  )
}
