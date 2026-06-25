'use client';
import type { DialecticAuditResult } from "@/lib/dialectic-types";
import CopyButton from "./CopyButton";

type Props = {
  result: DialecticAuditResult;
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="mt-1 h-0.5 bg-gray-100 rounded-full">
      <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: color }} />
    </div>
  );
}

function ScoreBlock({
  title,
  score,
  label,
  reason,
  color,
}: {
  title: string;
  score: number;
  label: string;
  reason: string;
  color: string;
}) {
  return (
    <div className="border border-gray-100 p-5">
      <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-2">{title}</p>
      <div className="flex items-baseline gap-3 mb-1">
        <span className="text-3xl font-extralight tabular-nums" style={{ color }}>{score}</span>
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <ScoreBar score={score} color={color} />
      <p className="text-xs text-gray-400 leading-relaxed mt-3">{reason}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-8 mt-8">
      <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-gray-300 mb-4">{title}</p>
      {children}
    </div>
  );
}

function StringList({ items }: { items: string[] }) {
  if (!items?.length) return <p className="text-xs text-gray-300 italic">—</p>;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-xs text-gray-500 leading-relaxed">
          <span className="text-gray-200 shrink-0">—</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function buildMarkdown(result: DialecticAuditResult): string {
  const lines: string[] = [];
  lines.push(`# Dialectic Audit Result\n`);
  lines.push(`## Summary\n${result.summary}\n`);
  lines.push(`## Central Claim\n${result.central_claim}\n`);
  lines.push(`## Already-Dialecticized Score\n${result.already_dialecticized_score.score}/100 — ${result.already_dialecticized_score.label}\n${result.already_dialecticized_score.reason}\n`);
  lines.push(`## Conceptual Novelty Score\n${result.conceptual_novelty_score.score}/100 — ${result.conceptual_novelty_score.label}\n${result.conceptual_novelty_score.reason}\n`);
  lines.push(`## Ideological Risk Score\n${result.ideological_risk_score.score}/100 — ${result.ideological_risk_score.label}\n${result.ideological_risk_score.reason}\n`);
  lines.push(`## Publication Judgment\n**${result.publication_judgment.status}**\n${result.publication_judgment.reason}\n`);
  lines.push(`## Final Audit Comment\n${result.final_audit_comment}\n`);
  return lines.join("\n");
}

export default function DialecticResult({ result }: Props) {
  const scoreColor = (score: number, invert = false) => {
    if (invert) return score > 60 ? "#dc2626" : score > 30 ? "#d97706" : "#16a34a";
    return score > 60 ? "#16a34a" : score > 30 ? "#d97706" : "#dc2626";
  };

  return (
    <div className="mt-12 space-y-0">
      {/* Header */}
      <div className="border border-gray-100 p-6 sm:p-8 mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-2">Dialectic Audit — Result</p>
            <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">{result.summary}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <CopyButton text={buildMarkdown(result)} label="Copy MD" />
            <CopyButton text={JSON.stringify(result, null, 2)} label="Copy JSON" />
          </div>
        </div>
      </div>

      {/* Scores */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <ScoreBlock
          title="Already-Dialecticized Score"
          score={result.already_dialecticized_score.score}
          label={result.already_dialecticized_score.label}
          reason={result.already_dialecticized_score.reason}
          color={scoreColor(result.already_dialecticized_score.score, true)}
        />
        <ScoreBlock
          title="Conceptual Novelty Score"
          score={result.conceptual_novelty_score.score}
          label={result.conceptual_novelty_score.label}
          reason={result.conceptual_novelty_score.reason}
          color={scoreColor(result.conceptual_novelty_score.score)}
        />
        <ScoreBlock
          title="Ideological Risk Score"
          score={result.ideological_risk_score.score}
          label={result.ideological_risk_score.label}
          reason={result.ideological_risk_score.reason}
          color={scoreColor(result.ideological_risk_score.score, true)}
        />
      </div>

      {/* Publication Judgment */}
      <div className="border border-gray-100 p-5 mb-8">
        <p className="text-[10px] tracking-[0.2em] uppercase text-gray-300 mb-2">Publication Judgment</p>
        <p className="text-sm font-medium text-gray-800 mb-2">{result.publication_judgment.status}</p>
        <p className="text-xs text-gray-400 leading-relaxed">{result.publication_judgment.reason}</p>
      </div>

      <Section title="Central Claim">
        <p className="text-sm text-gray-700 leading-relaxed">{result.central_claim}</p>
      </Section>

      <Section title="Implicit Assumptions">
        <StringList items={result.implicit_assumptions} />
      </Section>

      <Section title="Opposing Claims">
        <StringList items={result.opposing_claims} />
      </Section>

      <Section title="Justification Structure">
        <p className="text-xs text-gray-500 leading-relaxed">{result.justification_structure}</p>
      </Section>

      <Section title="Discourse Genre">
        <div className="flex flex-wrap gap-2">
          {result.discourse_genre?.map((g, i) => (
            <span key={i} className="text-[10px] tracking-wide uppercase px-2 py-1 border border-gray-100 text-gray-400">{g}</span>
          ))}
        </div>
      </Section>

      <Section title="Thought Genealogy">
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { label: "Related Thinkers", items: result.genealogy?.related_thinkers },
            { label: "Related Concepts", items: result.genealogy?.related_concepts },
            { label: "Related Schools", items: result.genealogy?.related_schools },
            { label: "Historical Debates", items: result.genealogy?.historical_debates },
            { label: "Prior Articulations", items: result.genealogy?.prior_articulations },
            { label: "Major Critics", items: result.genealogy?.major_critics },
          ].map(({ label, items }) => (
            <div key={label}>
              <p className="text-[10px] tracking-[0.15em] uppercase text-gray-300 mb-2">{label}</p>
              <StringList items={items ?? []} />
            </div>
          ))}
        </div>
      </Section>

      <Section title="Main Counterarguments">
        <StringList items={result.main_counterarguments} />
      </Section>

      {result.ideological_risk_score.risk_factors?.length > 0 && (
        <Section title="Ideological Risk Factors">
          <div className="flex flex-wrap gap-2">
            {result.ideological_risk_score.risk_factors.map((f, i) => (
              <span key={i} className="text-[10px] tracking-wide uppercase px-2 py-1 bg-red-50 border border-red-100 text-red-400">{f}</span>
            ))}
          </div>
        </Section>
      )}

      <Section title="Reconstruction — How to Strengthen the Proposition">
        <div className="space-y-4">
          {[
            { label: "Short Version", text: result.reconstruction?.short_version },
            { label: "Social Post Version", text: result.reconstruction?.social_post_version },
            { label: "Essay Intro Version", text: result.reconstruction?.essay_intro_version },
            { label: "Academic Claim Version", text: result.reconstruction?.academic_claim_version },
            { label: "Safer Critical Version", text: result.reconstruction?.safer_critical_version },
          ].map(({ label, text }) => (
            <div key={label} className="border-l border-gray-100 pl-4">
              <p className="text-[10px] tracking-[0.15em] uppercase text-gray-300 mb-1">{label}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{text || "—"}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Recommended Reading">
        <StringList items={result.recommended_reading} />
      </Section>

      <Section title="Final Audit Comment">
        <p className="text-xs text-gray-600 leading-relaxed border-l-2 border-gray-200 pl-4 italic">
          {result.final_audit_comment}
        </p>
      </Section>
    </div>
  );
}
