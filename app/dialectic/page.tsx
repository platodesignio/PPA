'use client';
import { useState } from "react";
import type { DialecticAuditResult } from "@/lib/dialectic-types";
import DialecticForm from "@/components/DialecticForm";
import DialecticResult from "@/components/DialecticResult";

export default function DialecticPage() {
  const [result, setResult] = useState<DialecticAuditResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">

      {/* Hero */}
      <section className="mb-12 border-b border-gray-100 pb-10">
        <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-accent mb-4">
          Dialectic Audit
        </p>
        <h1 className="text-2xl sm:text-3xl font-light text-gray-900 leading-tight tracking-tight mb-5">
          その命題は、本当に新しいのか。<br />
          <span className="text-gray-400">それとも、すでに弁証済みなのか。</span>
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
          Dialectic Audit は、入力された命題が思想史上どこに位置し、どの程度すでに弁証・反駁・整理されているかを監査するためのツールです。
          新規性のない言説を新思想として誤認することを防ぎ、既存の論争を踏まえたより強い命題へ再構成します。
        </p>
      </section>

      {/* Form */}
      <section className="mb-8">
        <DialecticForm
          onResult={(r) => { setResult(r); setError(null); }}
          onLoading={setLoading}
          onError={setError}
        />
      </section>

      {/* Loading */}
      {loading && (
        <div className="py-16 text-center">
          <p className="text-xs tracking-[0.2em] uppercase text-gray-300 animate-pulse">
            思想史・系譜・危険度を監査中…
          </p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="border border-red-100 px-5 py-4">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <DialecticResult result={result} />
      )}

    </div>
  );
}
