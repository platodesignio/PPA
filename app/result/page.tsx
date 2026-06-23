'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuditResult, loadAuditInput } from "@/lib/storage";
import ScoreTable from "@/components/ScoreTable";
import type { AuditResult, AuditInput } from "@/lib/types";

function totalColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 70) return "#3730a3";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

function DossierLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-gray-100">
      <span className="text-[10px] font-bold tabular-nums text-gray-200">{n}</span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300">{title}</span>
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input, setInput] = useState<AuditInput | null>(null);

  useEffect(() => {
    const r = loadAuditResult();
    const i = loadAuditInput();
    if (!r) { router.push("/audit"); return; }
    setResult(r);
    setInput(i);
  }, [router]);

  if (!result) return null;

  const color = totalColor(result.totalScore);
  const date = new Date(result.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* Dossier cover */}
      <div className="mb-10 pb-8 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-gray-300 mb-1">
              Proper Paper Audit
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">
              Report Dossier
            </p>
          </div>
          {result.auditSource && (
            <span
              className={`text-[10px] px-2 py-0.5 border tracking-wide ${
                result.auditSource === "real"
                  ? "border-accent/30 text-accent bg-accent/5"
                  : "border-gray-200 text-gray-400 bg-gray-50"
              }`}
            >
              {result.auditSource === "real" ? "Real audit · GPT-4o" : "Mock fallback"}
            </span>
          )}
        </div>

        {/* 01 Paper Target */}
        <div className="mb-4">
          <p className="text-[10px] font-bold text-gray-200 tracking-widest uppercase mb-1">01 · Paper Target</p>
          <h1 className="text-xl font-light text-gray-900 tracking-tight leading-snug">
            {input?.title || "Untitled Paper"}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {date} · {input?.targetMedium} · {input?.auditDepth}
          </p>
        </div>

        {/* 02 Scope and Methodological Notice */}
        <div className="border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-200 tracking-widest uppercase mb-2">
            02 · Scope and Methodological Notice
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            This report audits the submitted text, its concepts, their operational status, public risks,
            and revision conditions. It does not score the author. The audit evaluates
            texts, concepts, risks, and revision conditions — never the worth of the writer.
            Score is not judgment. It is an entry point for revision.
          </p>
          {input?.tone && (
            <p className="text-[10px] text-gray-300 mt-2">
              Audit tone: {input.tone} · Risk tolerance: {input.riskTolerance}
            </p>
          )}
        </div>

        {result.warnings && result.warnings.length > 0 && (
          <div className="mt-3 border border-amber-100 bg-amber-50 px-4 py-2 space-y-1">
            {result.warnings.map((w, i) => (
              <p key={i} className="text-xs text-amber-700">{w}</p>
            ))}
          </div>
        )}
      </div>

      {/* 03 Overall Paper Audit Judgment */}
      <section className="mb-10">
        <DossierLabel n="03" title="Overall Paper Audit Judgment" />
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 p-6 border border-gray-100">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-1">Total Audit Score</p>
              <p className="text-5xl font-extralight tabular-nums" style={{ color }}>{result.totalScore}</p>
              <p className="text-[10px] text-gray-300 mt-0.5">/100</p>
            </div>
            <div className="w-px h-14 bg-gray-100 hidden sm:block" />
            <div>
              <p className="text-xs font-semibold" style={{ color }}>{result.status}</p>
              <p className="text-xs text-gray-500 mt-1 max-w-xs italic">{result.diagnosis}</p>
            </div>
          </div>
          <div className="text-[10px] text-gray-300 italic text-right self-end">
            Score is not judgment.<br />It is an entry point for revision.
          </div>
        </div>
      </section>

      {/* 04–11 Score breakdown */}
      <section className="mb-10">
        <DossierLabel n="04–11" title="Conceptual Scores · Risk Indicators" />
        <ScoreTable generativeScores={result.generativeScores} riskScores={result.riskScores} />
      </section>

      {/* 12 Critical Diagnosis */}
      <section className="mb-10">
        <DossierLabel n="12" title="Critical Diagnosis" />
        <div className="border-l-2 border-accent pl-5 py-1">
          <p className="text-sm text-gray-600 leading-relaxed">{result.criticalDiagnosis}</p>
        </div>
      </section>

      {/* 13 Strongest contribution / Weakest point */}
      <div className="grid sm:grid-cols-2 gap-8 mb-10">
        <section>
          <DossierLabel n="13a" title="Strongest Contribution" />
          <p className="text-xs text-gray-600 leading-relaxed">{result.strongestContribution}</p>
        </section>
        <section>
          <DossierLabel n="13b" title="Weakest Conceptual Point" />
          <p className="text-xs text-gray-600 leading-relaxed">{result.weakestConceptualPoint}</p>
        </section>
      </div>

      {/* 14 Publication Risk */}
      <section className="mb-10">
        <DossierLabel n="14" title="Main Public Risks" />
        <ul className="space-y-2">
          {result.mainPublicRisks.map((risk, i) => (
            <li key={i} className="flex gap-3 text-xs text-gray-600 leading-relaxed">
              <span className="text-gray-200 shrink-0 font-bold mt-0.5">—</span>
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 15 Required Revisions */}
      <section className="mb-10">
        <DossierLabel n="15" title="Required Revisions" />
        <ol className="space-y-2">
          {result.requiredRevisions.map((rev, i) => (
            <li key={i} className="flex gap-3 text-xs text-gray-600 leading-relaxed">
              <span className="text-gray-300 shrink-0 font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{rev}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* 16 Final Publication Judgment */}
      <section className="mb-10">
        <DossierLabel n="16" title="Final Publication Judgment" />
        <div className="bg-gray-50 border border-gray-100 p-5">
          <p className="text-sm text-gray-700 leading-relaxed">{result.finalJudgment}</p>
        </div>
        <p className="text-[10px] text-gray-300 italic text-center mt-4">
          Score is not judgment. It is an entry point for revision.
        </p>
      </section>

      {/* Constitutional footer */}
      <div className="border-t border-gray-100 py-6 mb-8">
        <p className="text-[10px] text-gray-200 italic">
          No authors are scored. Proper Paper Audit audits texts, concepts, risks, and revision conditions — never the worth of the writer.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <Link
          href="/audit"
          className="px-5 py-2.5 bg-accent text-white text-xs tracking-wide uppercase hover:bg-indigo-700 transition-colors"
        >
          New Audit
        </Link>
        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs tracking-wide uppercase hover:border-gray-400 transition-colors"
        >
          Export Dossier
        </button>
        <button
          onClick={() => navigator.clipboard.writeText(result.criticalDiagnosis).then(() => alert("Copied to clipboard."))}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs tracking-wide uppercase hover:border-gray-400 transition-colors"
        >
          Copy Diagnosis
        </button>
      </div>
    </div>
  );
}
