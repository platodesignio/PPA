import { z } from "zod";

// ── Input schema ─────────────────────────────────────────────────────────────

export const AuditInputSchema = z.object({
  mode: z.enum(["upload", "paste", "section"]),
  title: z.string().min(1, "Title is required"),
  abstract: z.string().optional(),
  outline: z.string().optional(),
  mainText: z.string().optional(),
  sectionTitle: z.string().optional(),
  sectionText: z.string().optional(),
  previousSectionSummary: z.string().optional(),
  nextSectionAim: z.string().optional(),
  fileName: z.string().optional(),
  targetMedium: z.enum([
    "Zenodo", "Journal", "Research Essay", "Personal Website",
    "X / Social Post", "Book Chapter", "Private Draft",
  ]),
  tone: z.enum(["Academic", "Public", "Sharp", "Experimental"]),
  riskTolerance: z.enum(["Low", "Medium", "High"]),
  auditDepth: z.enum(["Quick Audit", "Full Audit", "Deep Theory Audit"]),
});

// ── Score item ────────────────────────────────────────────────────────────────

const ScoreItemSchema = z.object({
  label: z.string().min(1),
  value: z.number().min(0).max(100),
  description: z.string().min(1),
});

// ── Result schema — used to validate what the model returns ───────────────────

export const AuditResultSchema = z.object({
  totalScore: z.number().min(0).max(100),
  status: z.enum([
    "Publishable with Minor Tightening",
    "Publishable after Conceptual Revision",
    "Requires Structural Revision",
    "Requires Major Revision",
    "Not Yet Ready for Publication",
  ]),
  diagnosis: z.string().min(10),
  generativeScores: z.array(ScoreItemSchema).length(8),
  riskScores: z.array(ScoreItemSchema).length(8),
  criticalDiagnosis: z.string().min(20),
  strongestContribution: z.string().min(20),
  weakestConceptualPoint: z.string().min(20),
  mainPublicRisks: z.array(z.string().min(5)).min(1),
  requiredRevisions: z.array(z.string().min(5)).min(1),
  finalJudgment: z.string().min(20),
});

export type AuditInputParsed = z.infer<typeof AuditInputSchema>;
export type AuditResultParsed = z.infer<typeof AuditResultSchema>;
