import type { AuditInput, AuditResult, ScoreItem } from "./types";

export async function runAudit(input: AuditInput): Promise<AuditResult> {
  const res = await fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Audit API error: ${res.status}`);
  const data = await res.json() as { result: AuditResult; source: string };
  return data.result;
}

function clamp(v: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, Math.round(v)));
}

export function runMockAudit(input: AuditInput): AuditResult {
  const isDeep = input.auditDepth === "Deep Theory Audit";
  const isJournal = input.targetMedium === "Journal";
  const isSocial = input.targetMedium === "X / Social Post";
  const isSharp = input.tone === "Sharp";
  const isLowRisk = input.riskTolerance === "Low";
  const hasText = !!(input.mainText || input.sectionText || input.abstract);

  // Base scores — adjusted by conditions
  const base = {
    conceptualPrecision: hasText ? 74 : 62,
    originality: 68,
    dialecticalStructure: isDeep ? 61 : 72,
    literatureContact: isJournal ? 55 : 70,
    aiSlopResistance: 78,
    freedomGeneration: 65,
    publicRiskControl: isLowRisk ? 80 : 70,
    publicationReadiness: isJournal ? 58 : 72,
  };

  const riskBase = {
    metaphysicalInflation: isDeep ? 42 : 28,
    totalExplanation: 35,
    pseudoScientific: 22,
    politicalMisreading: isSocial ? 58 : 30,
    biologicalEssentialism: 18,
    scorification: 40,
    managementApparatus: 32,
    publicControversy: isSocial ? 62 : 34,
  };

  // Slight randomisation (±5) to feel dynamic
  function jitter(v: number): number {
    return clamp(v + Math.floor(Math.random() * 11) - 5);
  }

  const generativeScores: ScoreItem[] = [
    {
      label: "Conceptual Precision",
      value: jitter(base.conceptualPrecision),
      description: "Central concepts are defined, bounded, and distinguished from metaphor and ontological claims.",
    },
    {
      label: "Originality",
      value: jitter(base.originality),
      description: "Genuine conceptual contribution beyond terminology, style, or recombination of existing ideas.",
    },
    {
      label: "Dialectical Structure",
      value: jitter(base.dialecticalStructure),
      description: isDeep
        ? "The paper shows tension between positions but does not yet complete a generative dialectical arc."
        : "The paper moves through problem, contradiction, and partial mediation with reasonable coherence.",
    },
    {
      label: "Literature Contact",
      value: jitter(base.literatureContact),
      description: isJournal
        ? "Engagement with existing scholarship is insufficient for journal submission. Key positions need direct engagement."
        : "Engagement with existing scholarship is adequate for the target medium.",
    },
    {
      label: "AI-Slop Resistance",
      value: jitter(base.aiSlopResistance),
      description: "Degree to which the paper resists fluent-but-empty formulations, undefined neologisms, and argumentative inflation.",
    },
    {
      label: "Freedom-Generation Direction",
      value: jitter(base.freedomGeneration),
      description: "Whether the paper opens possibilities for thought, re-entry, and difference-preservation rather than closing them.",
    },
    {
      label: "Public Risk Control",
      value: jitter(base.publicRiskControl),
      description: isLowRisk
        ? "Risk-sensitive framing is present but may over-hedge the central argument."
        : "Public misreading risks are partially addressed. Key vulnerability areas remain.",
    },
    {
      label: "Publication Readiness",
      value: jitter(base.publicationReadiness),
      description: isJournal
        ? "Not yet ready for peer review. Conceptual architecture and literature contact need strengthening."
        : "Suitable for the target medium after targeted revision.",
    },
  ];

  const riskScores: ScoreItem[] = [
    {
      label: "Metaphysical Inflation Risk",
      value: jitter(riskBase.metaphysicalInflation),
      description: "Risk that claims exceed what the argument structure can support.",
    },
    {
      label: "Total Explanation Risk",
      value: jitter(riskBase.totalExplanation),
      description: "Risk that the theory becomes a framework for explaining everything, losing analytical specificity.",
    },
    {
      label: "Pseudo-Scientific Risk",
      value: jitter(riskBase.pseudoScientific),
      description: "Risk that scientific-sounding language is used without methodological grounding.",
    },
    {
      label: "Political Misreading Risk",
      value: jitter(riskBase.politicalMisreading),
      description: isSocial
        ? "High exposure: the condensed format invites political misreading without contextual framing."
        : "Moderate exposure to politically-loaded interpretations that are not guarded against in the text.",
    },
    {
      label: "Biological Essentialism Risk",
      value: jitter(riskBase.biologicalEssentialism),
      description: "Risk that category claims could be read as essential or naturalistic claims about bodies or kinds.",
    },
    {
      label: "Scorification Risk",
      value: jitter(riskBase.scorification),
      description: "Risk that the paper's own audit or classification apparatus becomes a management tool.",
    },
    {
      label: "Management Apparatus Risk",
      value: jitter(riskBase.managementApparatus),
      description: "Risk that critical concepts are absorbed into administrative or managerial frameworks.",
    },
    {
      label: "Public Controversy Risk",
      value: jitter(riskBase.publicControversy),
      description: isSocial
        ? "Very high in this format. The argument requires contextual containment not present in the draft."
        : "Residual controversy exposure under adversarial reading conditions.",
    },
  ];

  const genAvg = generativeScores.reduce((s, x) => s + x.value, 0) / generativeScores.length;
  const riskAvg = riskScores.reduce((s, x) => s + x.value, 0) / riskScores.length;
  const totalScore = clamp(Math.round(genAvg * 0.75 + (100 - riskAvg) * 0.25));

  let status = "Requires Major Revision";
  if (totalScore >= 80) status = "Publishable with Minor Tightening";
  else if (totalScore >= 70) status = "Publishable after Conceptual Revision";
  else if (totalScore >= 60) status = "Requires Structural Revision";
  else if (totalScore >= 50) status = "Requires Major Revision";
  else status = "Not Yet Ready for Publication";

  const diagnosis = isSharp
    ? `High conceptual ambition, insufficient operational control. The paper claims more than its argument structure can carry.`
    : `This paper has genuine conceptual energy but oscillates between metaphor, ontological claim, and audit category. The architecture is present; the discipline is not yet.`;

  const criticalDiagnosis = isDeep
    ? `The paper's central concept currently serves three incompatible functions: as a metaphor, as an ontological claim, and as an audit category. These functions cannot be held simultaneously without collapsing the theory into either poetry or pseudo-science. The most urgent task is not to choose one function but to articulate the relationship between them as a theoretical position in its own right.`
    : `This paper has high conceptual energy, but the central concept currently oscillates between metaphor, ontology, and audit category. The strongest contribution is not a new metaphysics, but a new audit grammar — a framework for asking whether concepts survive use, critique, and public reason.`;

  const strongestContribution =
    `The strongest contribution is the attempt to evaluate writing not only by style or citation density, but by whether it generates operational concepts capable of surviving public reason. This is a genuine shift in the audit frame — from formal correctness to conceptual accountability.`;

  const weakestConceptualPoint = isDeep
    ? `The paper must sharply distinguish metaphorical language, ontological claims, and audit categories. Without this distinction, the theory risks becoming a total explanation that can validate anything. The concept of freedom-generation in particular needs operational limits: what would count as evidence that a paper does NOT generate freedom?`
    : `The paper must distinguish more sharply between metaphorical language, ontological claims, and audit categories. Without this distinction, the theory risks becoming a total explanation.`;

  const mainPublicRisks = [
    isSocial
      ? "The format compresses argument structure in ways that invite decontextualised misreading. A thread cannot carry the full dialectical load."
      : "The argument may be misread as producing a ranking of papers rather than a grammar for revision.",
    isJournal
      ? "Reviewers will expect systematic engagement with existing audit methodologies. The absence of this literature contact is currently the paper's most visible vulnerability."
      : "The theory may be applied as a management checklist, reversing its critical orientation.",
    "The concept of freedom-generation needs operational limits — without them, it risks functioning as an infinitely flexible virtue concept.",
    isLowRisk
      ? "The risk-cautious framing is present, but over-hedging may suppress the paper's actual claim."
      : "The paper's critique of scoring may itself become a scoring apparatus if not reflexively constrained.",
    "Biological or naturalistic readings are possible if the claims about bodies, cognition, or embodiment are not explicitly bounded.",
  ];

  const requiredRevisions = [
    "Define the central concept clearly within the first section — function, scope, and what it does NOT cover.",
    "Separate metaphor, ontological claim, and audit operation. Make the relationship between them explicit.",
    "Add a paragraph explicitly limiting the theory's explanatory scope. A theory that explains everything explains nothing.",
    `State that scores are entry points for revision, not final judgments. This is the constitutional constraint of the paper itself.`,
    isJournal
      ? "Add a systematic literature review section engaging directly with existing methodological approaches."
      : `Add publication-specific caveats appropriate for ${input.targetMedium}.`,
    "Provide at least one worked negative example: a case in which the audit returns a low score and the reason is clear.",
    "Guard against the scorification risk by including a self-critical section on the limits of audit-based approaches.",
  ];

  const finalJudgment = isJournal
    ? `Not yet ready for peer-reviewed journal submission. The conceptual architecture is promising, but literature contact and methodological clarification are insufficient for double-blind review. Estimated revision distance: two to three substantial drafts. Recommend submission to ${input.targetMedium === "Journal" ? "a working paper series or Zenodo" : input.targetMedium} as an intermediate step.`
    : `Publishable after targeted revision. The core argument is original and the audit grammar is genuinely useful. The primary obstacle is conceptual discipline, not intellectual ambition. Suitable for ${input.targetMedium} following the required revisions above.`;

  return {
    totalScore,
    status,
    diagnosis,
    generativeScores,
    riskScores,
    criticalDiagnosis,
    strongestContribution,
    weakestConceptualPoint,
    mainPublicRisks,
    requiredRevisions,
    finalJudgment,
    createdAt: new Date().toISOString(),
  };
}
