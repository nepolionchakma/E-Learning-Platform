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

function CommandGroup({ cmd, topic }: { cmd: CommandRow; topic?: string }) {
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
        <TerminalBlock raw={cmd.code || ""} />
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
                  <TableRow key={ri} row={row} topic={topic} />
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
              <CommandGroup key={ci} cmd={cmd} topic={topicSlug} />
            ))}
          </div>
        </Accordion>
      ))}
      <ResourcesSection />
    </div>
  );
}

function TableRow({ row, topic }: { row: string[]; topic?: string }) {
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
            <div className="mx-3 mb-3 mt-1">
              <TerminalBlock raw={row[3]} />
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
