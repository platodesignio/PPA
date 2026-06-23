'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loadAuditResult, loadAuditInput } from "@/lib/storage";
import type { AuditResult, AuditInput, ScoreItem } from "@/lib/types";

// ── helpers ──────────────────────────────────────────────────────────────────

function totalColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 70) return "#3730a3";
  if (score >= 60) return "#eab308";
  return "#ef4444";
}

/** Exact label match first, then case-insensitive substring fallback. */
function findScore(scores: ScoreItem[], label: string): ScoreItem | undefined {
  const exact = scores.find((s) => s.label === label);
  if (exact) return exact;
  const lower = label.toLowerCase();
  return scores.find((s) => s.label.toLowerCase().includes(lower));
}

const MISSING = "Not separately scored in this audit version.";

// ── sub-components ────────────────────────────────────────────────────────────

function DossierLabel({ n, title }: { n: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-gray-100">
      <span className="text-[10px] font-bold tabular-nums text-gray-200 shrink-0 w-6">{n}</span>
      <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-gray-300">{title}</span>
    </div>
  );
}

function ScoreLine({ item }: { item: ScoreItem }) {
  const color = totalColor(item.value);
  return (
    <div className="flex items-start gap-5 mb-3">
      <div className="shrink-0 text-right w-8">
        <p className="text-xl font-extralight tabular-nums" style={{ color }}>{item.value}</p>
        <p className="text-[9px] text-gray-200">/100</p>
      </div>
      <div className="flex-1">
        <p className="text-[10px] italic text-gray-300 mb-1">{item.label}</p>
        <div className="h-px bg-gray-100 mb-2">
          <div className="h-full" style={{ width: `${item.value}%`, backgroundColor: color }} />
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

function MissingScore() {
  return (
    <p className="text-xs text-gray-300 italic">{MISSING}</p>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<AuditResult | null>(null);
  const [input,  setInput]  = useState<AuditInput | null>(null);

  useEffect(() => {
    const r = loadAuditResult();
    const i = loadAuditInput();
    if (!r) { router.push("/audit"); return; }
    setResult(r);
    setInput(i);
  }, [router]);

  if (!result) return null;

  const color = totalColor(result.totalScore);
  const date  = new Date(result.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  const gs = result.generativeScores ?? [];
  const rs = result.riskScores ?? [];
  const all = [...gs, ...rs];

  // Pre-resolve all score lookups so each label is searched once
  const s04 = findScore(all, "Conceptual Precision");
  const s05 = findScore(all, "Originality");
  const s06 = findScore(all, "Dialectical Structure");
  const s07 = findScore(all, "Literature Contact");
  const s08 = findScore(all, "AI-Slop Resistance");
  // 09: Metaphor/Concept/Ontology — no fixed label, use narrative fallback
  const s10_risk   = findScore(rs, "Public Controversy Risk")
                  ?? findScore(rs, "Political Misreading Risk");
  const s10_gen    = findScore(gs, "Public Risk Control");
  const s11 = findScore(all, "Publication Readiness")
           ?? findScore(all, "Public Reason");
  const s12 = findScore(all, "Freedom-Generation Direction");
  const s13 = findScore(all, "Management Apparatus Risk");

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">

      {/* ── Dossier cover ── */}
      <div className="mb-10 pb-8 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-gray-300 mb-0.5">
              Proper Paper Audit
            </p>
            <p className="text-[10px] tracking-[0.2em] uppercase text-accent font-bold">
              Report Dossier
            </p>
          </div>
          {result.auditSource && (
            <span className={`text-[10px] px-2 py-0.5 border tracking-wide ${
              result.auditSource === "real"
                ? "border-accent/30 text-accent bg-accent/5"
                : "border-gray-200 text-gray-400 bg-gray-50"
            }`}>
              {result.auditSource === "real" ? "Real audit · GPT-4o" : "Mock fallback"}
            </span>
          )}
        </div>

        {/* 01 Paper Target */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-200 tracking-widest uppercase mb-1.5">01 · Paper Target</p>
          <h1 className="text-xl font-light text-gray-900 tracking-tight leading-snug">
            {input?.title || "Untitled Paper"}
          </h1>
          <p className="text-xs text-gray-300 mt-1">
            {date}
            {input?.targetMedium ? ` · ${input.targetMedium}` : ""}
            {input?.auditDepth   ? ` · ${input.auditDepth}`   : ""}
          </p>
        </div>

        {/* 02 Scope and Methodological Notice */}
        <div className="border border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-[10px] font-bold text-gray-200 tracking-widest uppercase mb-2">
            02 · Scope and Methodological Notice
          </p>
          <p className="text-[11px] text-gray-400 leading-relaxed">
            This report audits the submitted text, its concepts, their operational status, public risks,
            and revision conditions. It does not score the author.
            Score is not judgment. It is an entry point for revision.
          </p>
          {(input?.tone || input?.riskTolerance) && (
            <p className="text-[10px] text-gray-300 mt-2">
              {[input?.tone && `Audit tone: ${input.tone}`, input?.riskTolerance && `Risk tolerance: ${input.riskTolerance}`]
                .filter(Boolean).join(" · ")}
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
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 p-6 border border-gray-100 mb-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-1">Total Audit Score</p>
              <p className="text-5xl font-extralight tabular-nums" style={{ color }}>{result.totalScore}</p>
              <p className="text-[10px] text-gray-300 mt-0.5">/100</p>
            </div>
            <div className="w-px h-14 bg-gray-100 hidden sm:block" />
            <div>
              <p className="text-xs font-semibold mb-1" style={{ color }}>{result.status}</p>
              <p className="text-xs text-gray-500 italic max-w-xs">{result.diagnosis}</p>
            </div>
          </div>
          <p className="text-[10px] text-gray-200 italic text-right self-end">
            Score is not judgment.<br />It is an entry point for revision.
          </p>
        </div>
        {result.criticalDiagnosis && (
          <div className="border-l-2 border-accent/30 pl-4 mb-4">
            <p className="text-xs text-gray-600 leading-relaxed">{result.criticalDiagnosis}</p>
          </div>
        )}
      </section>

      <div className="border-t border-gray-50 mb-8" />

      {/* 04 Conceptual Precision */}
      <section className="mb-8">
        <DossierLabel n="04" title="Conceptual Precision" />
        {s04 ? <ScoreLine item={s04} /> : <MissingScore />}
      </section>

      {/* 05 Originality Diagnosis */}
      <section className="mb-8">
        <DossierLabel n="05" title="Originality Diagnosis" />
        {s05 ? <ScoreLine item={s05} /> : <MissingScore />}
        {result.strongestContribution && (
          <div className="mt-3 bg-gray-50 border border-gray-100 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-200 mb-1">Strongest Contribution</p>
            <p className="text-xs text-gray-500 leading-relaxed">{result.strongestContribution}</p>
          </div>
        )}
      </section>

      {/* 06 Dialectical Structure */}
      <section className="mb-8">
        <DossierLabel n="06" title="Dialectical Structure" />
        {s06 ? <ScoreLine item={s06} /> : <MissingScore />}
      </section>

      {/* 07 Literature Contact */}
      <section className="mb-8">
        <DossierLabel n="07" title="Literature Contact" />
        {s07 ? <ScoreLine item={s07} /> : <MissingScore />}
      </section>

      {/* 08 AI-Slop Resistance */}
      <section className="mb-8">
        <DossierLabel n="08" title="AI-Slop Resistance" />
        {s08 ? <ScoreLine item={s08} /> : <MissingScore />}
      </section>

      {/* 09 Metaphor / Concept / Ontology Separation */}
      <section className="mb-8">
        <DossierLabel n="09" title="Metaphor / Concept / Ontology Separation" />
        {result.weakestConceptualPoint
          ? (
            <>
              <div className="border-l-2 border-gray-100 pl-4 mb-2">
                <p className="text-xs text-gray-500 leading-relaxed">{result.weakestConceptualPoint}</p>
              </div>
              <p className="text-[10px] text-gray-200 italic">
                Derived from critical diagnosis. No dedicated score in this audit version.
              </p>
            </>
          )
          : <MissingScore />}
      </section>

      {/* 10 Publication Risk */}
      <section className="mb-8">
        <DossierLabel n="10" title="Publication Risk" />
        {s10_gen && <ScoreLine item={s10_gen} />}
        {s10_risk && <ScoreLine item={s10_risk} />}
        {!s10_gen && !s10_risk && <MissingScore />}
        {result.mainPublicRisks && result.mainPublicRisks.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {result.mainPublicRisks.map((risk, i) => (
              <li key={i} className="flex gap-3 text-xs text-gray-600 leading-relaxed">
                <span className="text-gray-200 shrink-0 font-bold">—</span>
                <span>{risk}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 11 Public Reason Durability */}
      <section className="mb-8">
        <DossierLabel n="11" title="Public Reason Durability" />
        {s11 ? <ScoreLine item={s11} /> : <MissingScore />}
      </section>

      {/* 12 Freedom-Generation Direction */}
      <section className="mb-8">
        <DossierLabel n="12" title="Freedom-Generation Direction" />
        {s12 ? <ScoreLine item={s12} /> : <MissingScore />}
      </section>

      {/* 13 Management Apparatus Risk */}
      <section className="mb-8">
        <DossierLabel n="13" title="Management Apparatus Risk" />
        {s13 ? <ScoreLine item={s13} /> : <MissingScore />}
      </section>

      <div className="border-t border-gray-50 mb-8" />

      {/* 14 Required Revisions */}
      <section className="mb-10">
        <DossierLabel n="14" title="Required Revisions" />
        <ol className="space-y-2 mb-4">
          {result.requiredRevisions.map((rev, i) => (
            <li key={i} className="flex gap-3 text-xs text-gray-600 leading-relaxed">
              <span className="text-gray-200 shrink-0 font-bold tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span>{rev}</span>
            </li>
          ))}
        </ol>
        {result.weakestConceptualPoint && (
          <div className="border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-200 mb-1">Weakest Conceptual Point</p>
            <p className="text-xs text-gray-500 leading-relaxed">{result.weakestConceptualPoint}</p>
          </div>
        )}
      </section>

      {/* 15 Final Publication Judgment */}
      <section className="mb-10">
        <DossierLabel n="15" title="Final Publication Judgment" />
        <div className="bg-gray-50 border border-gray-100 p-5">
          <p className="text-sm text-gray-700 leading-relaxed">{result.finalJudgment}</p>
        </div>
        <p className="text-[10px] text-gray-200 italic text-center mt-4">
          Score is not judgment. It is an entry point for revision.
        </p>
      </section>

      {/* Constitutional footer */}
      <div className="border-t border-gray-100 py-5 mb-8">
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
          onClick={() => navigator.clipboard.writeText(result.finalJudgment).then(() => alert("Copied."))}
          className="px-5 py-2.5 border border-gray-200 text-gray-600 text-xs tracking-wide uppercase hover:border-gray-400 transition-colors"
        >
          Copy Judgment
        </button>
      </div>
    </div>
  );
}
