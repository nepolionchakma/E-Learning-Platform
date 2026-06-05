"use client";

import TerminalBlock from "@/components/TerminalBlock";

interface Props {
  raw?: string | null;
}

// Lightweight wrapper so the Linux topic uses a dedicated component.
// This makes future linux-specific tweaks simple while reusing TerminalBlock's
// parsing and rendering logic.
export default function LinuxTerminal({ raw }: Props) {
  if (!raw) return null;
  return (
    <div className="mt-1">
      <TerminalBlock raw={raw} />
    </div>
  );
}
