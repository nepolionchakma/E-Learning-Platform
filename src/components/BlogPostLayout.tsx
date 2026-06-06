"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import TerminalBlock from "@/components/TerminalBlock";
import BlogActions from "@/components/BlogActions";
import CommentSection from "@/components/CommentSection";

interface Section {
  id: string;
  title: string;
  description?: string;
  content?: string[];
  infoBox?: { type: string; content: string };
  cards?: { title: string; desc: string }[];
  image?: { src: string; alt: string };
  syntaxTerminal?: { command: string; explanation?: string };
  tables?: { headers: string[]; rows: string[][] };
  targets?: { headers: string[]; rows: string[][] };
  optionsTable?: { headers: string[]; rows: string[][] };
  criteriaTable?: { headers: string[]; rows: string[][] };
  summaryTable?: { headers: string[]; rows: string[][] };
  packetFlow?: string[];
  items?: any[];
  subsections?: any[];
}

interface BlogPostLayoutProps {
  data: {
    title: string;
    icon?: string;
    description: string;
    author: string;
    date: string;
    readTime: string;
    heroImage?: string;
    heroAlt?: string;
    sections: Section[];
  };
  slug: string;
  heroColor?: string;
}

function InfoBox({ type, content }: { type: string; content: string }) {
  const styles: Record<string, string> = {
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    warning:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    tip: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  };
  const icons: Record<string, string> = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
  };
  return (
    <div
      className={`my-4 p-4 rounded-lg border ${styles[type] || styles.info}`}
    >
      <span className="mr-2 text-sm">{icons[type] || icons.info}</span>
      <span className="text-sm">{content}</span>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 my-4">
      <table className="w-full text-xs sm:text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
            >
              {row.map((cell, ci) => (
                <td key={ci} className="p-3">
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

function ContentItem({ item, slug }: { item: any; slug?: string }) {
  if (item.code) {
    return (
      <div className="mb-4">
        {item.label && (
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wide">
            {item.label}
          </p>
        )}
        <TerminalBlock raw={item.code} />
      </div>
    );
  }
  if (item.text) {
    return (
      <div className="mb-4">
        {item.label && (
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">
            {item.label}
          </p>
        )}
        <div className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2">
          {typeof item.text === "string" ? (
            <p>{item.text}</p>
          ) : (
            item.text.map((line: string, idx: number) => (
              <p key={idx}>{line}</p>
            ))
          )}
        </div>
      </div>
    );
  }
  if (item.table) {
    return (
      <div className="mb-4 overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
        {item.label && (
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2 p-3">
            {item.label}
          </p>
        )}
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="bg-zinc-100 dark:bg-zinc-800">
              {item.table.headers.map((header: string, idx: number) => (
                <th
                  key={idx}
                  className="border border-zinc-200 dark:border-zinc-700 px-3 py-2 text-left font-semibold"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {item.table.rows.map((row: string[], ridx: number) => (
              <tr
                key={ridx}
                className="border-t border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {row.map((cell: string, cidx: number) => (
                  <td
                    key={cidx}
                    className="border border-zinc-200 dark:border-zinc-700 px-3 py-2"
                  >
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
}

function SectionRenderer({
  section,
  slug,
}: {
  section: Section;
  slug?: string;
}) {
  return (
    <section id={section.id} className="mb-8 sm:mb-12 scroll-mt-24">
      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3 sm:mb-4">
        {section.title}
      </h2>

      {section.content?.map((p, i) => (
        <p key={i} className="mb-4 text-sm sm:text-base">
          {p}
        </p>
      ))}

      {section.infoBox && (
        <InfoBox
          type={section.infoBox.type}
          content={section.infoBox.content}
        />
      )}

      {section.cards && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 mb-4">
          {section.cards.map((card, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1 text-sm sm:text-base">
                {card.title}
              </h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      )}

      {section.image && (
        <div className="mb-6 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <img
            src={section.image.src}
            alt={section.image.alt}
            className="w-full h-auto"
          />
        </div>
      )}

      {section.syntaxTerminal && (
        <TerminalBlock raw={section.syntaxTerminal.command} />
      )}

      {section.tables && (
        <DataTable
          headers={section.tables.headers}
          rows={section.tables.rows}
        />
      )}
      {section.targets && (
        <DataTable
          headers={section.targets.headers}
          rows={section.targets.rows}
        />
      )}
      {section.optionsTable && (
        <DataTable
          headers={section.optionsTable.headers}
          rows={section.optionsTable.rows}
        />
      )}
      {section.criteriaTable && (
        <DataTable
          headers={section.criteriaTable.headers}
          rows={section.criteriaTable.rows}
        />
      )}
      {section.summaryTable && (
        <DataTable
          headers={section.summaryTable.headers}
          rows={section.summaryTable.rows}
        />
      )}

      {section.packetFlow && (
        <TerminalBlock raw={section.packetFlow.join('\n')} />
      )}

      {section.items?.map((item, ii) => (
        <ContentItem key={ii} item={item} slug={slug} />
      ))}

      {section.subsections?.map((sub: any, ssi: number) => (
        <div key={ssi} className="mt-6 sm:mt-8 ml-0 sm:ml-2">
          {sub.title && (
            <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              {sub.title}
            </h3>
          )}

          {sub.content && (
            <p className="mb-3 text-sm sm:text-base">{sub.content}</p>
          )}

          {sub.terminals?.map((t: any, ti: number) => (
            <TerminalBlock
              key={ti}
              raw={[t.command, t.output].filter(Boolean).join("\n")}
            />
          ))}

          {sub.contentAfter && (
            <p className="mb-3 mt-4 text-sm sm:text-base">{sub.contentAfter}</p>
          )}

          {sub.terminalsAfter?.map((t: any, ti: number) => (
            <TerminalBlock
              key={ti}
              raw={[t.command, t.output].filter(Boolean).join("\n")}
            />
          ))}

          {sub.steps && (
            <ol className="list-decimal list-inside space-y-2 mb-4 text-sm sm:text-base">
              {sub.steps.map((step: string, sti: number) => (
                <li key={sti}>{step}</li>
              ))}
            </ol>
          )}

          {sub.items?.map((item: any, ii: number) => (
            <ContentItem key={ii} item={item} slug={slug} />
          ))}
        </div>
      ))}
    </section>
  );
}

export default function BlogPostLayout({
  data,
  slug,
  heroColor = "from-indigo-500 via-purple-500 to-pink-500",
}: BlogPostLayoutProps) {
  const [activeSection, setActiveSection] = useState(
    data.sections[0]?.id || "",
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [heroError, setHeroError] = useState(false);
  const siteUrl = "https://e-learning-platform-ribeng.vercel.app";

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -60% 0px" },
    );
    data.sections.forEach((section) => {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data.sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 96;
      window.scrollTo({ top: y, behavior: "smooth" });
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

      <div className="mb-8 sm:mb-10">
        {data.heroImage && !heroError ? (
          <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
            <img
              src={data.heroImage}
              alt={data.heroAlt || data.title}
              className="w-full h-auto"
              onError={() => setHeroError(true)}
            />
          </div>
        ) : (
          <div
            className={`mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-gradient-to-br ${heroColor} p-12 sm:p-16`}
          >
            <div className="flex items-center justify-center h-64 sm:h-80">
              <div className="text-center">
                {data.icon && (
                  <div className="text-6xl sm:text-7xl mb-4">{data.icon}</div>
                )}
                <p className="text-white text-lg sm:text-xl font-semibold">
                  {data.title.split(":")[0]}
                </p>
              </div>
            </div>
          </div>
        )}
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
                className={`cursor-pointer block w-full text-left py-1.5 text-sm transition-colors ${activeSection === section.id ? "text-indigo-600 dark:text-indigo-400 font-medium" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
              >
                {section.title}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-6 lg:gap-8">
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
                  className={`cursor-pointer block w-full text-left pl-3 sm:pl-4 py-1 sm:py-1.5 text-xs sm:text-sm border-l-2 -ml-[2px] transition-colors ${activeSection === section.id ? "border-indigo-500 text-indigo-600 dark:text-indigo-400 font-medium" : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"}`}
                >
                  {section.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <article className="flex-1 min-w-0 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {data.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} slug={slug} />
          ))}
          <BlogActions slug={slug} title={data.title} />
          <CommentSection slug={slug} />
        </article>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: data.title,
            description: data.description,
            author: { "@type": "Person", name: data.author },
            datePublished: data.date,
            publisher: {
              "@type": "Organization",
              name: "E-Learning Platform",
              logo: { "@type": "ImageObject", url: `${siteUrl}/icon.svg` },
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": `${siteUrl}/blogs/${slug}`,
            },
          }),
        }}
      />
    </div>
  );
}
