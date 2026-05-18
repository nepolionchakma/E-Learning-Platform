"use client";

import React, { useState } from "react";

export interface TerminalProps {
  command: string;
  output?: string;
  explanation?: string;
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

export default function TerminalBlock({ command, output, explanation }: TerminalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = command;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

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
        <button
          onClick={handleCopy}
          className="cursor-pointer p-1.5 rounded-md bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 text-zinc-500 hover:text-indigo-600 hover:border-indigo-400 transition-colors"
          title={copied ? "Copied!" : "Copy command"}
        >
          <CopyIcon copied={copied} />
        </button>
      </div>
      <div className="bg-zinc-900 p-3 sm:p-4 font-mono text-xs sm:text-sm">
        <div className="flex items-start gap-2">
          <span className="text-green-400 select-none flex-shrink-0">$</span>
          <code className="text-zinc-100 flex-1 break-all">{command}</code>
        </div>
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
