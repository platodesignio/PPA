'use client';
import { useState } from "react";
import type { DialecticAuditResult } from "@/lib/dialectic-types";

type Props = {
  onResult: (result: DialecticAuditResult) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
};

export default function DialecticForm({ onResult, onLoading, onError }: Props) {
  const [proposition, setProposition] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposition.trim()) {
      onError("命題を入力してください。");
      return;
    }
    onError(null);
    onLoading(true);
    try {
      const res = await fetch("/api/dialectic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposition: proposition.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        onError(data.error ?? "監査に失敗しました。");
        return;
      }
      onResult(data.result);
    } catch {
      onError("ネットワークエラーが発生しました。");
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={proposition}
        onChange={(e) => setProposition(e.target.value)}
        placeholder="監査したい命題・主張・投稿文・論考の要旨を入力してください"
        rows={6}
        className="w-full border border-gray-200 px-4 py-3 text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:border-gray-400 transition-colors leading-relaxed"
      />
      <button
        type="submit"
        className="px-6 py-2.5 bg-gray-900 text-white text-xs tracking-[0.1em] uppercase hover:bg-gray-700 transition-colors"
      >
        弁証済み命題を監査する
      </button>
    </form>
  );
}
