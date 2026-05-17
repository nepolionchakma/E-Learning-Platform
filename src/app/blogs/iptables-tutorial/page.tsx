"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import tutorialData from "@/data/iptables-tutorial.json";
import BlogActions from "@/components/BlogActions";
import CommentSection from "@/components/CommentSection";

interface TerminalItem {
  command: string;
  output?: string;
  explanation?: string;
  desc?: string;
}

interface Subsection {
  title?: string;
  content?: string;
  terminals?: TerminalItem[];
  contentAfter?: string;
  terminalsAfter?: TerminalItem[];
  steps?: string[];
}

interface InfoBox {
  type: string;
  content: string;
}

interface Card {
  title: string;
  desc: string;
}

interface DataTable {
  headers: string[];
  rows: string[][];
}

interface Section {
  id: string;
  title: string;
  content?: string[];
  infoBox?: InfoBox;
  cards?: Card[];
  packetFlow?: string[];
  tables?: DataTable;
  targets?: DataTable;
  syntaxTerminal?: TerminalItem;
  optionsTable?: DataTable;
  criteriaTable?: DataTable;
  subsections?: Subsection[];
  summaryTable?: DataTable;
}

interface TutorialData {
  title: string;
  icon: string;
  description: string;
  author: string;
  date: string;
  readTime: string;
  sections: Section[];
}

const data = tutorialData as TutorialData;

const firstCol = [0];
const firstAndLastCol = [0, 2];
const secondCol = [1];

function CopyIcon({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg
        className="w-4 h-4 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    );
  }
  return (
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
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
    </svg>
  );
}

function TerminalBlock({ command, output, explanation }: TerminalItem) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-lg">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-200 dark:bg-zinc-800/60 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-zinc-500 dark:text-zinc-400 text-xs ml-2 font-mono">
            terminal
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="cursor-pointer p-1.5 rounded-md bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
          title={copied ? "Copied!" : "Copy command"}
        >
          <CopyIcon copied={copied} />
        </button>
      </div>
      <div className="bg-zinc-900 p-4 font-mono text-sm">
        <div className="flex items-start gap-2">
          <span className="text-green-400 select-none">$</span>
          <code className="text-zinc-100 flex-1 break-all">{command}</code>
        </div>
        {output && (
          <div className="mt-3 pt-3 border-t border-zinc-700 text-zinc-400 whitespace-pre-wrap">
            {output}
          </div>
        )}
      </div>
      {explanation && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-sm text-zinc-700 dark:text-zinc-300">
          {explanation}
        </div>
      )}
    </div>
  );
}

function InfoBox({
  children,
  type = "info",
}: {
  children: React.ReactNode;
  type?: "info" | "warning" | "tip";
}) {
  const styles = {
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    warning:
      "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    tip: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
  };

  const icons = {
    info: "ℹ️",
    warning: "⚠️",
    tip: "💡",
  };

  return (
    <div className={`my-4 p-4 rounded-lg border ${styles[type]}`}>
      <span className="mr-2">{icons[type]}</span>
      {children}
    </div>
  );
}

function DataTable({
  headers,
  rows,
  monoCols = [0],
}: {
  headers: string[];
  rows: string[][];
  monoCols?: number[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700 my-4">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-100 dark:bg-zinc-800">
            {headers.map((h, i) => (
              <th
                key={i}
                className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300"
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
                <td
                  key={ci}
                  className={`p-3 ${monoCols.includes(ci) ? "font-mono text-xs" : ""}`}
                >
                  {monoCols.includes(ci) && ci === 0 && (
                    <span className="text-green-600 dark:text-green-400 font-semibold">
                      {cell}
                    </span>
                  )}
                  {(!monoCols.includes(ci) || ci !== 0) && cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionRenderer({ section }: { section: Section }) {
  return (
    <section id={section.id} className="mb-12 scroll-mt-24">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
        {section.title}
      </h2>

      {section.content?.map((p, i) => (
        <p key={i} className="mb-4">
          {p}
        </p>
      ))}

      {section.cards && (
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          {section.cards.map((card, i) => (
            <div
              key={i}
              className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
            >
              <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
                {card.title}
              </h4>
              <p className="text-sm">{card.desc}</p>
            </div>
          ))}
        </div>
      )}

      {section.packetFlow && (
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 mb-4">
          <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Packet Flow
          </h4>
          <div className="text-sm space-y-1 font-mono">
            {section.packetFlow.map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>
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
          monoCols={firstCol}
        />
      )}

      {section.syntaxTerminal && (
        <TerminalBlock
          command={section.syntaxTerminal.command}
          explanation={section.syntaxTerminal.explanation}
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
          monoCols={firstAndLastCol}
        />
      )}

      {section.subsections?.map((sub, si) => (
        <div key={si}>
          {sub.title && (
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3 mt-6">
              {sub.title}
            </h3>
          )}
          {sub.content && <p className="mb-3">{sub.content}</p>}
          {sub.terminals?.map((t, ti) => (
            <TerminalBlock
              key={ti}
              command={t.command}
              output={t.output}
              explanation={t.explanation}
            />
          ))}
          {sub.contentAfter && <p className="mb-3 mt-4">{sub.contentAfter}</p>}
          {sub.terminalsAfter?.map((t, ti) => (
            <TerminalBlock
              key={ti}
              command={t.command}
              output={t.output}
              explanation={t.explanation}
            />
          ))}
          {sub.steps && (
            <ol className="list-decimal list-inside space-y-2 mb-4">
              {sub.steps.map((step, sti) => (
                <li key={sti}>{step}</li>
              ))}
            </ol>
          )}
        </div>
      ))}

      {section.summaryTable && (
        <DataTable
          headers={section.summaryTable.headers}
          rows={section.summaryTable.rows}
          monoCols={secondCol}
        />
      )}

      {section.infoBox && (
        <InfoBox type={section.infoBox.type as "info" | "warning" | "tip"}>
          {section.infoBox.content}
        </InfoBox>
      )}
    </section>
  );
}

export default function IptablesTutorialPage() {
  const [activeSection, setActiveSection] = useState(
    data.sections[0]?.id || "",
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
      { rootMargin: "-20% 0px -60% 0px" },
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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

      <div className="mb-10">
        <div className="mb-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
          <img
            src="/images/iptables-hero.svg"
            alt="iptables Linux firewall illustration showing INPUT, OUTPUT, and FORWARD chains with packet filtering"
            className="w-full h-auto"
          />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100">
          {data.title}
        </h1>
        <p className="text-zinc-500 mt-3 text-base sm:text-lg">
          {data.description}
        </p>
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-4 text-sm text-zinc-400">
          <span>By {data.author}</span>
          <span>·</span>
          <span>{data.date}</span>
          <span>·</span>
          <span>{data.readTime}</span>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Left Sidebar - Table of Contents */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide mb-3">
              Table of Contents
            </h3>
            <nav className="space-y-1 border-l-2 border-zinc-200 dark:border-zinc-700">
              {data.sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollTo(section.id)}
                  className={`cursor-pointer block w-full text-left pl-4 py-1.5 text-sm border-l-2 -ml-[2px] transition-colors ${
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

        {/* Mobile TOC Toggle */}
        <div className="lg:hidden w-full mb-6">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
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
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            Table of Contents
          </button>
          {mobileMenuOpen && (
            <div className="mt-3 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-1 max-h-80 overflow-y-auto">
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

        {/* Main Content */}
        <article className="flex-1 min-w-0 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          {data.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
          <BlogActions slug="iptables-tutorial" title={data.title} />
          <CommentSection slug="iptables-tutorial" />
        </article>
      </div>
    </div>
  );
}
