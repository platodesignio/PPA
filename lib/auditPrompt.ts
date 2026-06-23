import type { AuditInput } from "./types";

export const SYSTEM_PROMPT = `You are not a writing assistant. You are a conceptual audit engine.

Your function is to audit whether a paper, research essay, or theoretical text generates genuine thought — or merely arranges language.

You make the following distinctions in every audit:
- METAPHOR: figurative language that illustrates but does not operate analytically
- OPERATIONAL CONCEPT: a concept that produces distinctions, enables new questions, and survives use
- ONTOLOGICAL CLAIM: a claim about the nature of reality, requiring metaphysical grounding
- SCIENTIFIC CLAIM: an empirical claim requiring methodological and evidential grounding
- PUBLIC-RISK CLAIM: a claim with vulnerability to misreading, misuse, or political capture
- AUDIT CATEGORY: a criterion used within the paper's own evaluative framework

You never say only "good job" or "improve clarity." You provide precise conceptual diagnosis.

Constitutional constraint:
Score is not judgment. It is an entry point for revision. Every report must make this explicit.

You return ONLY valid JSON — no markdown, no prose outside the JSON object. Exactly one JSON object.`;

export function buildUserPrompt(input: AuditInput): string {
  const lines: string[] = [];

  lines.push(`=== AUDIT REQUEST ===`);
  lines.push(`Title: ${input.title}`);
  lines.push(`Mode: ${input.mode}`);
  lines.push(`Target Medium: ${input.targetMedium}`);
  lines.push(`Tone: ${input.tone}`);
  lines.push(`Risk Tolerance: ${input.riskTolerance}`);
  lines.push(`Audit Depth: ${input.auditDepth}`);
  lines.push(``);

  if (input.mode === "paste") {
    if (input.abstract) lines.push(`--- Abstract ---\n${input.abstract}\n`);
    if (input.outline) lines.push(`--- Outline ---\n${input.outline}\n`);
    if (input.mainText) lines.push(`--- Main Text ---\n${input.mainText}\n`);
  } else if (input.mode === "section") {
    if (input.sectionTitle) lines.push(`Section: ${input.sectionTitle}`);
    if (input.previousSectionSummary) lines.push(`\n--- Previous Section Summary ---\n${input.previousSectionSummary}\n`);
    if (input.sectionText) lines.push(`--- Section Text ---\n${input.sectionText}\n`);
    if (input.nextSectionAim) lines.push(`--- Next Section Aim ---\n${input.nextSectionAim}\n`);
  } else if (input.mode === "upload") {
    if (input.mainText) lines.push(`--- Extracted Text ---\n${input.mainText}\n`);
    else lines.push(`[No text extracted — use conceptual analysis based on title only]\n`);
  }

  lines.push(`=== AUDIT INSTRUCTIONS ===`);
  lines.push(`Audit Depth: ${input.auditDepth}`);

  if (input.auditDepth === "Deep Theory Audit") {
    lines.push(`This is a Deep Theory Audit. Apply maximum critical rigour. Examine:`);
    lines.push(`- Whether central concepts are OPERATIONAL or merely metaphorical`);
    lines.push(`- Whether ontological claims are grounded or inflated`);
    lines.push(`- Whether the dialectical arc is complete or merely gestured at`);
    lines.push(`- Whether the paper guards against becoming a total explanation`);
    lines.push(`- Whether the paper's own audit grammar could be captured by a management apparatus`);
  } else if (input.auditDepth === "Full Audit") {
    lines.push(`Conduct a full audit across all categories. Be specific. Provide conceptual diagnosis, not generic feedback.`);
  } else {
    lines.push(`Quick audit. Focus on the most critical conceptual issue and the highest publication risk.`);
  }

  if (input.targetMedium === "Journal") {
    lines.push(`\nTarget Medium is a peer-reviewed Journal. Literature contact and methodological rigour are mandatory criteria. Score accordingly.`);
  }
  if (input.targetMedium === "X / Social Post") {
    lines.push(`\nTarget Medium is X / Social Post. Assess decontextualisation risk, compression distortion, and political misreading risk at maximum sensitivity.`);
  }
  if (input.riskTolerance === "Low") {
    lines.push(`\nRisk Tolerance is Low. Prioritise conservative framing in required revisions.`);
  }
  if (input.tone === "Sharp") {
    lines.push(`\nTone is Sharp. Your diagnosis language may be more direct and precise.`);
  }

  lines.push(`\n=== REQUIRED OUTPUT ===`);
  lines.push(`Return ONLY the following JSON. No explanation. No markdown. No preamble. Exactly one JSON object.`);
  lines.push(`
{
  "totalScore": <integer 0-100>,
  "status": <string: one of "Publishable with Minor Tightening" | "Publishable after Conceptual Revision" | "Requires Structural Revision" | "Requires Major Revision" | "Not Yet Ready for Publication">,
  "diagnosis": <string: 1-2 sentences, precise, no generic praise>,
  "generativeScores": [
    { "label": "Conceptual Precision", "value": <0-100>, "description": <string: specific finding about THIS paper> },
    { "label": "Originality", "value": <0-100>, "description": <string> },
    { "label": "Dialectical Structure", "value": <0-100>, "description": <string> },
    { "label": "Literature Contact", "value": <0-100>, "description": <string> },
    { "label": "AI-Slop Resistance", "value": <0-100>, "description": <string> },
    { "label": "Freedom-Generation Direction", "value": <0-100>, "description": <string> },
    { "label": "Public Risk Control", "value": <0-100>, "description": <string> },
    { "label": "Publication Readiness", "value": <0-100>, "description": <string> }
  ],
  "riskScores": [
    { "label": "Metaphysical Inflation Risk", "value": <0-100>, "description": <string: higher = more risk> },
    { "label": "Total Explanation Risk", "value": <0-100>, "description": <string> },
    { "label": "Pseudo-Scientific Risk", "value": <0-100>, "description": <string> },
    { "label": "Political Misreading Risk", "value": <0-100>, "description": <string> },
    { "label": "Biological Essentialism Risk", "value": <0-100>, "description": <string> },
    { "label": "Scorification Risk", "value": <0-100>, "description": <string> },
    { "label": "Management Apparatus Risk", "value": <0-100>, "description": <string> },
    { "label": "Public Controversy Risk", "value": <0-100>, "description": <string> }
  ],
  "criticalDiagnosis": <string: 3-5 sentences, rigorous, identifies the central conceptual problem precisely>,
  "strongestContribution": <string: 2-3 sentences, what this paper genuinely contributes>,
  "weakestConceptualPoint": <string: 2-3 sentences, the single most serious conceptual failure>,
  "mainPublicRisks": [<string>, <string>, <string>, <string>],
  "requiredRevisions": [<string>, <string>, <string>, <string>, <string>],
  "finalJudgment": <string: 2-4 sentences, specific publication judgment with medium-specific caveat>
}`);

  return lines.join("\n");
}
