"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import topics from "@/data/topics.json";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "./SearchBar";

const practiceLinks = [
  { href: "/quizzes", label: "Quizzes", icon: "🧠" },
  { href: "/exercises", label: "Exercises", icon: "💻" },
  { href: "/bootcamp", label: "Bootcamp", icon: "🎓" },
];

const navLinks = [
  { href: "/blogs", label: "Blogs", icon: "📝" },
  { href: "/contact", label: "Contact", icon: "📬" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const topicsRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const topicsTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const practiceTimer = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (topicsRef.current && !topicsRef.current.contains(e.target as Node)) {
        setTopicsOpen(false);
      }
      if (
        practiceRef.current &&
        !practiceRef.current.contains(e.target as Node)
      ) {
        setPracticeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      if (topicsTimer.current) clearTimeout(topicsTimer.current);
      if (practiceTimer.current) clearTimeout(practiceTimer.current);
    };
  }, []);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const activeTopic = topics.find((t) => pathname === `/${t.slug}`);
  const activePractice = practiceLinks.find((l) => pathname.startsWith(l.href));

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl sm:text-2xl font-bold gradient-text">
              E-Learning
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            <Link
              href="/"
              className={`px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/")
                  ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              Home
            </Link>

            <div ref={topicsRef} className="relative">
              <button
                onClick={() => setTopicsOpen(!topicsOpen)}
                onMouseEnter={() => {
                  if (topicsTimer.current) clearTimeout(topicsTimer.current);
                  setTopicsOpen(true);
                }}
                onMouseLeave={() => {
                  topicsTimer.current = setTimeout(
                    () => setTopicsOpen(false),
                    150,
                  );
                }}
                className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeTopic
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {activeTopic ? activeTopic.title : "Topics"}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${topicsOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {topicsOpen && (
                <div
                  onMouseEnter={() => {
                    if (topicsTimer.current) clearTimeout(topicsTimer.current);
                  }}
                  onMouseLeave={() => setTopicsOpen(false)}
                  className="fixed top-full left-1/2 -translate-x-1/2 w-[80vw] max-w-4xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  <div className="p-2 grid grid-cols-10 gap-1">
                    {topics.map((t) => {
                      const topicActive = pathname === `/${t.slug}`;
                      return (
                        <Link
                          key={t.slug}
                          href={`/${t.slug}`}
                          onClick={() => setTopicsOpen(false)}
                          className={`flex flex-col items-center gap-1 px-2 py-3 rounded-lg text-xs font-medium transition-colors ${
                            topicActive
                              ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                              : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <span className="text-xl">{t.icon}</span>
                          <span className="text-center leading-tight">
                            {t.title}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div ref={practiceRef} className="relative">
              <button
                onClick={() => setPracticeOpen(!practiceOpen)}
                onMouseEnter={() => {
                  if (practiceTimer.current)
                    clearTimeout(practiceTimer.current);
                  setPracticeOpen(true);
                }}
                onMouseLeave={() => {
                  practiceTimer.current = setTimeout(
                    () => setPracticeOpen(false),
                    150,
                  );
                }}
                className={`flex items-center gap-1 px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activePractice
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                {activePractice ? activePractice.label : "Practice"}
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${practiceOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {practiceOpen && (
                <div
                  onMouseEnter={() => {
                    if (practiceTimer.current)
                      clearTimeout(practiceTimer.current);
                  }}
                  onMouseLeave={() => setPracticeOpen(false)}
                  className="absolute top-full left-0 mt-3.5 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-lg z-50 overflow-hidden"
                >
                  {practiceLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setPracticeOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                        isActive(link.href)
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                          : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      <span>{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="text-base">{link.icon}</span>
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden lg:block w-48 xl:w-64">
            <SearchBar wide />
          </div>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {menuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 max-h-[80vh] overflow-y-auto">
            <div className="px-4 py-3 space-y-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                🏠 Home
              </Link>

              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
              <p className="px-3 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Practice
              </p>

              {practiceLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}

              <div className="border-t border-zinc-100 dark:border-zinc-800 my-1" />
              <p className="px-3 py-1 text-xs font-medium text-zinc-400 uppercase tracking-wide">
                Topics
              </p>

              {topics.map((t) => (
                <Link
                  key={t.slug}
                  href={`/${t.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === `/${t.slug}`
                      ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100"
                      : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  }`}
                >
                  <span className="flex-shrink-0 text-base">{t.icon}</span>
                  <span>{t.title}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
