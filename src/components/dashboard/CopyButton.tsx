"use client";

import { useEffect, useState } from "react";

const COPIED_MS = 2000;

/** Copies `text` to the clipboard and confirms for two seconds. */
export function CopyButton({ text, label = "Copy", className }: { text: string; label?: string; className?: string }) {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (!isCopied) return;
    const id = setTimeout(() => setIsCopied(false), COPIED_MS);
    return () => clearTimeout(id);
  }, [isCopied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch {
      // Clipboard blocked: the text stays selectable next to the button.
    }
  };

  return (
    <button type="button" onClick={copy} className={className}>
      {isCopied ? "Copied" : label}
    </button>
  );
}
