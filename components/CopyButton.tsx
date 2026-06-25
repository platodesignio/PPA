'use client';
import { useState } from "react";

type Props = {
  text: string;
  label?: string;
};

export default function CopyButton({ text, label = "Copy" }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="text-[10px] tracking-[0.15em] uppercase px-3 py-1.5 border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 transition-colors"
    >
      {copied ? "Copied" : label}
    </button>
  );
}
