"use client";

import React, { useState } from "react";

export interface TerminalProps {
  command?: string;
  output?: string;
  explanation?: string;
  raw?: string;
}

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

function StripedBlock({
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
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyContent);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = copyContent;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="group relative">
      <div className={`px-3 py-1 ${bg} ${textColor} whitespace-pre-wrap font-mono text-xs sm:text-sm`}>
        {lines.map((l, i) => (
          <div key={i}>{l || "\u00A0"}</div>
        ))}
      </div>
      {copyContent && (
        <button
          onClick={handleCopy}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 shadow-sm cursor-pointer"
          title={copied ? "Copied!" : "Copy command"}
        >
          <CopyIcon copied={copied} />
        </button>
      )}
    </div>
  );
}

function parseRawTerminal(text: string) {
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
        copy: line.replace(/^\S+@\S+[:~#\$] /, "").trim(),
      });
      continue;
    }

    if (line.startsWith("#!/") || line.startsWith("# ")) {
      blocks.push({
        lines: [line],
        bg: "bg-zinc-50 dark:bg-zinc-900",
        textColor: "text-zinc-700 dark:text-zinc-100",
        copy: line,
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
          copy: "",
        });
      }
    } else {
      blocks.push({
        lines: [line],
        bg: "bg-zinc-50 dark:bg-zinc-900",
        textColor: "text-zinc-500 dark:text-zinc-400",
        copy: "",
      });
    }
  }

  return blocks;
}

export default function TerminalBlock({ command, output, explanation, raw }: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = command || "";
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (raw) {
    const blocks = parseRawTerminal(raw);
    return (
      <div className="my-3 sm:my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-lg">
        <div className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-zinc-200 dark:bg-zinc-800/60 border-b border-zinc-300 dark:border-zinc-700">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs ml-2 font-mono">
            terminal
          </span>
        </div>
        <div className="bg-zinc-900 divide-y divide-zinc-800">
          {blocks.filter(b => b.lines.length > 0 || b.lines[0] !== "").map((block, i) => (
            <StripedBlock
              key={i}
              lines={block.lines}
              bg={block.bg}
              textColor={block.textColor}
              copyContent={block.copy}
            />
          ))}
        </div>
        {explanation && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            {explanation}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="my-3 sm:my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700 shadow-lg">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-zinc-200 dark:bg-zinc-800/60 border-b border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
          <span className="text-zinc-500 dark:text-zinc-400 text-[10px] sm:text-xs ml-2 font-mono">
            terminal
          </span>
        </div>
        {command && (
          <button
            onClick={handleCopy}
            className="cursor-pointer p-1.5 rounded-md bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
            title={copied ? "Copied!" : "Copy command"}
          >
            <CopyIcon copied={copied} />
          </button>
        )}
      </div>
      <div className="bg-zinc-900 p-3 sm:p-4 font-mono text-xs sm:text-sm">
        {command && (
          <div className="flex items-start gap-2">
            <span className="text-green-400 select-none flex-shrink-0">$</span>
            <code className="text-zinc-100 flex-1 break-all">{command}</code>
          </div>
        )}
        {output && (
          <div className="mt-3 pt-3 border-t border-zinc-700 text-zinc-400 whitespace-pre-wrap text-xs sm:text-sm overflow-x-auto">
            {output}
          </div>
        )}
      </div>
      {explanation && (
        <div className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-800 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
          {explanation}
        </div>
      )}
    </div>
  );
}
