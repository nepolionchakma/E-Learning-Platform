"use client";

import ContentRenderer from '@/components/ContentRenderer';
import TerminalBlock from '@/components/TerminalBlock';
import Link from 'next/link';
import firewallsData from '@/data/firewalls.json';
import BlogActions from '@/components/BlogActions';
import CommentSection from '@/components/CommentSection';

export default function FirewallsPage() {
  const data = (firewallsData as any) || {};

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
          {data.title}
        </h1>
        <div className="flex items-center gap-3 mt-3 text-sm text-zinc-400">
          <span>By {data.author}</span>
          <span>·</span>
          <span>{data.date}</span>
        </div>

        <div className="mt-8 text-zinc-700 dark:text-zinc-300 leading-relaxed">
          <p className="mb-6">{data.description}</p>
          {/* Render terminal-style sections using the reusable TerminalBlock component */}
          {data.sections?.map((section: any, si: number) => (
            <section key={si} className="mb-8">
              <h3 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100 mb-3">{section.title}</h3>
              <div className="space-y-4">
                {section.items?.map((item: any, ii: number) => {
                  // parse the item.code into one or more prompt/command blocks
                  const blocks: { command: string; output?: string }[] = [];
                  if (!item.code) return null;
                  const lines = item.code.split(/\r?\n/);
                  const promptRe = /^\s*\S+@\S+[,:~#\$]\s*(.*)$/;
                  let current: { command: string; outputLines: string[] } | null = null;
                  for (const line of lines) {
                    const m = line.match(promptRe);
                    if (m) {
                      // start new block with captured command (strip prompt)
                      if (current) {
                        blocks.push({ command: current.command, output: current.outputLines.join('\n').trim() });
                      }
                      current = { command: m[1] || '', outputLines: [] };
                    } else {
                      // non-prompt line -> part of output or standalone
                      if (current) {
                        current.outputLines.push(line);
                      } else {
                        // no prompt encountered yet; treat the whole line as a command if blocks empty
                        if (blocks.length === 0) {
                          blocks.push({ command: line });
                        } else {
                          // append to last block's output
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
                      {item.label && <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1 uppercase tracking-wide">{item.label}</p>}
                      {blocks.map((b, bi) => (
                        <TerminalBlock key={bi} command={b.command} output={b.output} />
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <BlogActions slug="firewalls" title={data.title} />
        <CommentSection slug="firewalls" />
      </article>
    </div>
  );
}
