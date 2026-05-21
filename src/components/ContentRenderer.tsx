"use client";

import { useState } from "react";
import Accordion from "./Accordion";
import CopyButton from "./CopyButton";
import TerminalBlock from "@/components/TerminalBlock";
import site from "@/data/site.json";

interface CommandRow {
  name: string;
  rows?: string[][];
  type?: string;
  code?: string;
  details?: string;
}

interface Stage {
  title: string;
  commands: CommandRow[];
}

interface SectionItem {
  label?: string;
  code?: string;
  result?: string;
}

interface Section {
  title: string;
  type: string;
  items: SectionItem[];
}

interface TopicData {
  title: string;
  icon: string;
  description: string;
  stages?: Stage[];
  sections?: Section[];
}

export default function ContentRenderer({
  data,
  topic,
}: {
  data: TopicData;
  topic?: string;
}) {
  if (data.stages) return renderStages(data.stages, topic || "");
  if (data.sections) return renderSections(data.sections);
  return null;
}

function CommandGroup({ cmd }: { cmd: CommandRow }) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div>
      <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 mb-2 flex items-center gap-2">
        <span className="w-1 h-4 bg-orange-500 rounded-full inline-block" />
        {cmd.name}
        {cmd.details && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="ml-1 px-2 py-0.5 text-[10px] font-medium rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors cursor-pointer"
          >
            {showDetails ? 'Hide Details' : 'Details'}
          </button>
        )}
      </h4>
      {cmd.type === "codeblock" ? (
        <div className="relative group">
          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={cmd.code || ""} />
          </div>
          <pre className="text-sm bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto border border-zinc-700">{cmd.code}</pre>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-zinc-100 dark:bg-zinc-800">
                  <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Command</th>
                  <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Scenario</th>
                  <th className="p-3 text-left font-semibold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700">Explanation</th>
                  <th className="p-3 w-24 border-b border-zinc-200 dark:border-zinc-700" />
                </tr>
              </thead>
              <tbody className="text-zinc-600 dark:text-zinc-300">
                {cmd.rows?.map((row, ri) => (
                  <TableRow key={ri} row={row} />
                ))}
              </tbody>
            </table>
          </div>
          {showDetails && cmd.details && (
            <div className="mt-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {cmd.details}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function renderStages(stages: Stage[], topicSlug: string) {
  return (
    <div className="space-y-3">
      {stages.map((stage, si) => (
        <Accordion
          key={si}
          title={stage.title}
          topicSlug={topicSlug}
          stageIndex={si}
          defaultOpen={false}
        >
          <div className="space-y-5">
            {stage.commands.map((cmd, ci) => (
              <CommandGroup key={ci} cmd={cmd} />
            ))}
          </div>
        </Accordion>
      ))}
      <ResourcesSection />
    </div>
  );
}

function SectionBlock({
  lines,
  bg,
  textColor,
  copyContent,
}: {
  lines: string[];
  bg: string;
  textColor: string;
  copyContent: string;
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyContent)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = copyContent
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative">
      <div className={`px-3 py-1 ${bg} ${textColor} whitespace-pre-wrap`}>
        {lines.map((l, i) => (
          <div key={i}>{l || "\u00A0"}</div>
        ))}
      </div>
      <button
        onClick={handleCopy}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 shadow-sm cursor-pointer"
        title="Copy this block"
      >
        {copied ? (
          <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function stripPrompt(line: string): string {
  return line.replace(/^\S+@\S+[:~#\$] /, "").trim();
}

function renderTerminalSections(text: string) {
  const lines = text.split("\n");
  const blocks: { lines: string[]; bg: string; textColor: string; copy: string }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isPrompt = /^\S+@\S+[:~#\$]/.test(line);

    if (isPrompt) {
      blocks.push({
        lines: [line],
        bg: "bg-zinc-200 dark:bg-zinc-800/60",
        textColor: "text-green-600 dark:text-green-400",
        copy: stripPrompt(line)
      });
      continue;
    }

    if (line.startsWith("#!/") || line.startsWith("# ")) {
      blocks.push({
        lines: [line],
        bg: "bg-zinc-50 dark:bg-zinc-900",
        textColor: "text-zinc-700 dark:text-zinc-100",
        copy: line
      });
      continue;
    }

    if (blocks.length > 0 && !isPrompt) {
      const last = blocks[blocks.length - 1];
      if (last.bg === "bg-zinc-50 dark:bg-zinc-900" && !last.textColor.includes("green")) {
        last.lines.push(line);
      } else {
        blocks.push({
          lines: [line],
          bg: "bg-zinc-50 dark:bg-zinc-900",
          textColor: "text-zinc-500 dark:text-zinc-400",
          copy: ""
        });
      }
    } else {
      blocks.push({
        lines: [line],
        bg: "bg-zinc-50 dark:bg-zinc-900",
        textColor: "text-zinc-500 dark:text-zinc-400",
        copy: ""
      });
    }
  }

  return (
    <div className="space-y-0">
      {blocks.filter(b => b.lines.length > 0 || b.lines[0] !== "").map((block, i) => (
        <SectionBlock
          key={i}
          lines={block.lines}
          bg={block.bg}
          textColor={block.textColor}
          copyContent={block.copy}
        />
      ))}
    </div>
  );
}

function TableRow({ row }: { row: string[] }) {
  const [showResult, setShowResult] = useState(false);
  const hasResult = row[3] !== undefined;

  return (
    <>
      <tr className="border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
        <td className="p-3 font-mono text-xs text-zinc-800 dark:text-zinc-200">
          <code>{row[0]}</code>
        </td>
        <td className="p-3 text-xs">{row[1]}</td>
        <td className="p-3 text-xs text-zinc-500">{row[2]}</td>
        <td className="p-2">
          <div className="flex items-center gap-1">
            {hasResult && (
              <button
                onClick={() => setShowResult(!showResult)}
                className="p-1.5 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-green-600 hover:border-green-400 transition-colors cursor-pointer"
                title="Show example output"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            )}
            <CopyButton text={row[0]} />
          </div>
        </td>
      </tr>
      {showResult && hasResult && (
        <tr>
          <td colSpan={4} className="p-0">
            <div className="border-t-2 border-teal-400 dark:border-teal-500/60 mx-3" />
            <div className="bg-zinc-100 dark:bg-zinc-900 text-xs font-mono leading-relaxed mx-3 mb-3 mt-1 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-lg">
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-zinc-300 dark:border-zinc-700 bg-zinc-200 dark:bg-zinc-800/60">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] ml-2">
                  terminal output
                </span>
              </div>
              {renderTerminalSections(row[3])}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function renderSections(sections: Section[]) {
  return (
    <div className="space-y-6">
      {sections.map((section, si) => (
        <div
          key={si}
          className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden"
        >
          <div className="px-5 py-3 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
              {section.title}
            </h3>
          </div>
          <div className="px-5 py-4 bg-white dark:bg-zinc-900 space-y-4">
            {section.items.map((item, ii) => (
              <div key={ii}>
                {item.label && (
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wide">
                    {item.label}
                  </p>
                )}
                 {item.code && (
                   <TerminalBlock raw={item.code} />
                 )}
              </div>
            ))}
          </div>
        </div>
      ))}
      <ResourcesSection />
    </div>
  );
}

function ResourcesSection() {
  const r = site.resources;
  return (
    <div className="rounded-xl border border-orange-200 dark:border-orange-800 p-5 bg-orange-50 dark:bg-zinc-800">
      <h3 className="font-bold text-orange-600 dark:text-orange-400 mb-3">
        {r.heading}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-zinc-600 dark:text-zinc-300">
        {r.items.map((item, i) => (
          <div key={i}>
            <p className="font-medium mb-1">{item.title}</p>
            {item.type === "ordered" ? (
              <ol className="space-y-1 list-decimal list-inside">
                {item.entries.map((e, j) => (
                  <li key={j}>{e}</li>
                ))}
              </ol>
            ) : (
              <ul className="space-y-1 list-disc list-inside">
                {item.entries.map((e, j) => (
                  <li key={j}>{e}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
