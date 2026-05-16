"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { search, type SearchEntry } from "@/lib/searchData"

export default function SearchBar({ wide }: { wide?: boolean }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchEntry[]>([])
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)
  const router = useRouter()

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  const handleSearch = useCallback((value: string) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setResults(search(value))
      setSelectedIdx(-1)
    }, 150)
  }, [])

  function handleChange(value: string) {
    setQuery(value)
    handleSearch(value)
  }

  function handleClear() {
    setQuery("")
    setResults([])
    setSelectedIdx(-1)
    inputRef.current?.focus()
  }

  function handleSelect(entry: SearchEntry) {
    setQuery("")
    setResults([])
    setFocused(false)
    router.push(`/${entry.topicSlug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!results.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIdx((prev) => (prev < results.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIdx((prev) => (prev > 0 ? prev - 1 : results.length - 1))
    } else if (e.key === "Enter" && selectedIdx >= 0) {
      e.preventDefault()
      handleSelect(results[selectedIdx])
    } else if (e.key === "Escape") {
      setFocused(false)
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const grouped = results.reduce<
    Record<string, { topic: SearchEntry; items: SearchEntry[] }>
  >((acc, entry) => {
    const key = entry.topicSlug
    if (!acc[key]) acc[key] = { topic: entry, items: [] }
    acc[key].items.push(entry)
    return acc
  }, {})

  const groupKeys = Object.keys(grouped)

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400 dark:text-zinc-500 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder="Search topics, commands, and concepts..."
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-10 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl border border-zinc-200 dark:border-zinc-700 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all text-sm"
          aria-label="Search topics and concepts"
          autoComplete="off"
          spellCheck={false}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {focused && query && (
        <div className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-96 overflow-y-auto ${
          wide
            ? "fixed left-1/2 -translate-x-1/2 top-16 w-[45vw] max-w-[50vw] min-w-[400px] z-[60]"
            : "absolute top-full mt-2 left-0 right-0 z-[60]"
        }`}>
          {groupKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-zinc-400 dark:text-zinc-500">
              <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs mt-0.5">Try a different search term</p>
            </div>
          ) : (
            <>
              <div className="px-4 py-2 text-xs font-medium text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800">
                {results.length} result{results.length !== 1 ? "s" : ""} found
              </div>
              {groupKeys.map((slug) => {
                const group = grouped[slug]
                return (
                  <div key={slug}>
                    <div className="px-4 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800/50">
                      <span>{group.topic.topicIcon}</span>
                      <span>{group.topic.topicTitle}</span>
                    </div>
                    {group.items.map((entry, i) => {
                      const globalIdx = results.indexOf(entry)
                      return (
                        <button
                          key={`${entry.topicSlug}-${entry.sectionTitle}-${entry.itemLabel}-${i}`}
                          onClick={() => handleSelect(entry)}
                          onMouseEnter={() => setSelectedIdx(globalIdx)}
                          className={`w-full text-left px-4 py-2.5 flex flex-col gap-0.5 transition-colors cursor-pointer ${
                            selectedIdx === globalIdx
                              ? "bg-indigo-50 dark:bg-indigo-950/50"
                              : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                            {entry.itemLabel}
                          </span>
                          <span className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                            {entry.sectionTitle}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}
    </div>
  )
}
