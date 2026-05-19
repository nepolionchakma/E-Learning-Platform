"use client";

import { useState, useEffect } from "react";
import TerminalBlock from '@/components/TerminalBlock';
import Link from 'next/link';
import reactPostgresqlData from '@/data/react-postgresql-deployment.json';
import BlogActions from '@/components/BlogActions';
import CommentSection from '@/components/CommentSection';

interface Section {
  id: string;
  title: string;
  description?: string;
  items?: any[];
  subsections?: any[];
}

interface Data {
  title: string;
  icon: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  sections: Section[];
}

const data = reactPostgresqlData as Data;

export default function ReactPostgresqlDeploymentPage() {
  const [activeSection, setActiveSection] = useState(
    data.sections[0]?.id || ""
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    data.sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
      <Link
        href="/blogs"
        className="cursor-pointer inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-6 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Blogs
      </Link>

      {/* Hero Section */}
      <div className="mb-8 sm:mb-10">
        <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-12 sm:p-16">
          <div className="flex items-center justify-center h-64 sm:h-80">
            <div className="text-center">
              <div className="text-6xl sm:text-7xl mb-4">{data.icon}</div>
              <p className="text-white text-lg sm:text-xl font-semibold">
                React + PostgreSQL Deployment Guide
              </p>
            </div>
          </div>
        </div>
        
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight">
          {data.title}
        </h1>
        <p className="text-zinc-500 mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg">
          {data.description}
        </p>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 sm:mt-4 text-xs sm:text-sm text-zinc-400">
          <span>By {data.author}</span>
          <span>·</span>
          <span>{data.date}</span>
          <span>·</span>
          <span>{data.readTime}</span>
        </div>
      </div>

      {/* Mobile TOC Toggle */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="cursor-pointer w-full flex items-center justify-between px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Table of Contents
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${mobileMenuOpen ? "rotate-180" : ""}`}
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
        {mobileMenuOpen && (
          <div className="mt-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-1 max-h-72 overflow-y-auto">
            {data.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollTo(section.id)}
                className={`cursor-pointer block w-full text-left py-1.5 text-sm transition-colors ${
                  activeSection === section.id
                    ? "text-indigo-600 dark:text-indigo-400 font-medium"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 lg:gap-8">
        {/* Left Sidebar - Table of Contents */}
        <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
              Table of Contents
            </h3>
            <nav className="space-y-0.5 sm:space-y-1 border-l-2 border-zinc-200 dark:border-zinc-700">
              {data.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`cursor-pointer block w-full text-left pl-3 sm:pl-4 py-1 sm:py-1.5 text-xs sm:text-sm border-l-2 -ml-[2px] transition-colors ${
                    activeSection === section.id
                      ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium"
                      : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 min-w-0 text-zinc-700 dark:text-zinc-300 leading-relaxed">

          {/* Render sections */}
          {data.sections?.map((section: any, si: number) => (
            <section key={section.id} id={section.id} className="mb-8 sm:mb-12 scroll-mt-24">
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4">
                {section.title}
              </h2>

              {section.description && (
                <p className="mb-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">{section.description}</p>
              )}

              {/* Render items */}
              {section.items?.map((item: any, ii: number) => {
                // Handle code/terminal blocks
                if (item.code) {
                  const blocks: { command: string; output?: string }[] = [];
                  const lines = item.code.split(/\r?\n/);
                  const promptRe = /^\s*\S+@\S+[,:~#\$]\s*(.*)$/;
                  let current: { command: string; outputLines: string[] } | null = null;
                  for (const line of lines) {
                    const m = line.match(promptRe);
                    if (m) {
                      if (current) {
                        blocks.push({ command: current.command, output: current.outputLines.join('\n').trim() });
                      }
                      current = { command: m[1] || '', outputLines: [] };
                    } else {
                      if (current) {
                        current.outputLines.push(line);
                      } else {
                        if (blocks.length === 0) {
                          blocks.push({ command: line });
                        } else {
                          const last = blocks[blocks.length - 1];
                          last.output = (last.output ? last.output + '\n' : '') + line;
                        }
                      }
                    }
                  }
                  if (current) {
                    blocks.push({ command: current.command, output: current.outputLines.join('\n').trim() });
                  }

                  return (
                    <div key={ii} className="mb-4">
                      {item.label && (
                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                          {item.label}
                        </p>
                      )}
                      {item.description && (
                        <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                          {item.description}
                        </p>
                      )}
                      {blocks.map((b, bi) => (
                        <TerminalBlock key={bi} command={b.command} output={b.output} />
                      ))}
                    </div>
                  );
                }

                // Handle text content
                if (item.text) {
                  return (
                    <div key={ii} className="mb-4">
                      {item.label && (
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                          {item.label}
                        </p>
                      )}
                      <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
                        {typeof item.text === 'string' ? (
                          <p>{item.text}</p>
                        ) : Array.isArray(item.text) ? (
                          item.text.map((line: string, idx: number) => (
                            <p key={idx}>{line}</p>
                          ))
                        ) : null}
                      </div>
                    </div>
                  );
                }

                // Handle tables
                if (item.table) {
                  return (
                    <div key={ii} className="mb-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                      {item.label && (
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 p-3">
                          {item.label}
                        </p>
                      )}
                      <table className="w-full text-xs sm:text-sm">
                        <thead>
                          <tr className="bg-zinc-100 dark:bg-zinc-800">
                            {item.table.headers.map((header: string, idx: number) => (
                              <th key={idx} className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left font-semibold">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {item.table.rows.map((row: string[], ridx: number) => (
                            <tr key={ridx} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                              {row.map((cell: string, cidx: number) => (
                                <td key={cidx} className="border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                }

                return null;
              })}

              {/* Subsections */}
              {section.subsections?.map((subsection: any, ssi: number) => (
                <div key={ssi} className="mt-6 sm:mt-8">
                  <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
                    {subsection.title}
                  </h3>
                  {subsection.description && (
                    <p className="mb-4 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">{subsection.description}</p>
                  )}
                  <div className="space-y-4">
                    {subsection.items?.map((item: any, ii: number) => {
                      if (item.code) {
                        const blocks: { command: string; output?: string }[] = [];
                        const lines = item.code.split(/\r?\n/);
                        const promptRe = /^\s*\S+@\S+[,:~#\$]\s*(.*)$/;
                        let current: { command: string; outputLines: string[] } | null = null;
                        for (const line of lines) {
                          const m = line.match(promptRe);
                          if (m) {
                            if (current) {
                              blocks.push({ command: current.command, output: current.outputLines.join('\n').trim() });
                            }
                            current = { command: m[1] || '', outputLines: [] };
                          } else {
                            if (current) {
                              current.outputLines.push(line);
                            } else {
                              if (blocks.length === 0) {
                                blocks.push({ command: line });
                              } else {
                                const last = blocks[blocks.length - 1];
                                last.output = (last.output ? last.output + '\n' : '') + line;
                              }
                            }
                          }
                        }
                        if (current) {
                          blocks.push({ command: current.command, output: current.outputLines.join('\n').trim() });
                        }

                        return (
                          <div key={ii}>
                            {item.label && (
                              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
                                {item.label}
                              </p>
                            )}
                            {item.description && (
                              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                                {item.description}
                              </p>
                            )}
                            {blocks.map((b, bi) => (
                              <TerminalBlock key={bi} command={b.command} output={b.output} />
                            ))}
                          </div>
                        );
                      }

                      if (item.text) {
                        return (
                          <div key={ii}>
                            {item.label && (
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                                {item.label}
                              </p>
                            )}
                            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
                              {typeof item.text === 'string' ? (
                                <p>{item.text}</p>
                              ) : Array.isArray(item.text) ? (
                                item.text.map((line: string, idx: number) => (
                                  <p key={idx}>{line}</p>
                                ))
                              ) : null}
                            </div>
                          </div>
                        );
                      }

                      if (item.table) {
                        return (
                          <div key={ii} className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                            {item.label && (
                              <p className="text-xs sm:text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 p-3">
                                {item.label}
                              </p>
                            )}
                            <table className="w-full text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-zinc-100 dark:bg-zinc-800">
                                  {item.table.headers.map((header: string, idx: number) => (
                                    <th key={idx} className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left font-semibold">
                                      {header}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {item.table.rows.map((row: string[], ridx: number) => (
                                  <tr key={ridx} className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800">
                                    {row.map((cell: string, cidx: number) => (
                                      <td key={cidx} className="border border-zinc-200 dark:border-zinc-700 px-3 py-2">
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }

                      return null;
                    })}
                  </div>
                </div>
              ))}
            </section>
          ))}

          <BlogActions slug="react-postgresql-deployment" title={data.title} />
          <CommentSection slug="react-postgresql-deployment" />
        </article>
      </div>
    </div>
  );
}
