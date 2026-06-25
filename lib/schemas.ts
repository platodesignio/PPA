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

// ── Dialectic Audit schemas ───────────────────────────────────────────────────

const DialecticScoreResultSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string().min(1),
  reason: z.string().min(1),
});

const DialecticIdeologicalRiskSchema = z.object({
  score: z.number().min(0).max(100),
  label: z.string().min(1),
  risk_factors: z.array(z.string()).default([]),
  reason: z.string().min(1),
});

export const DialecticAuditResultSchema = z.object({
  summary: z.string().min(1),
  central_claim: z.string().min(1),
  implicit_assumptions: z.array(z.string()).default([]),
  opposing_claims: z.array(z.string()).default([]),
  justification_structure: z.string().default(""),
  discourse_genre: z.array(z.string()).default([]),
  genealogy: z.object({
    related_thinkers: z.array(z.string()).default([]),
    related_concepts: z.array(z.string()).default([]),
    related_schools: z.array(z.string()).default([]),
    historical_debates: z.array(z.string()).default([]),
    prior_articulations: z.array(z.string()).default([]),
    major_critics: z.array(z.string()).default([]),
  }).default({
    related_thinkers: [],
    related_concepts: [],
    related_schools: [],
    historical_debates: [],
    prior_articulations: [],
    major_critics: [],
  }),
  already_dialecticized_score: DialecticScoreResultSchema,
  conceptual_novelty_score: DialecticScoreResultSchema,
  ideological_risk_score: DialecticIdeologicalRiskSchema,
  publication_judgment: z.object({
    status: z.string().min(1),
    reason: z.string().min(1),
  }),
  main_counterarguments: z.array(z.string()).default([]),
  reconstruction: z.object({
    short_version: z.string().default(""),
    social_post_version: z.string().default(""),
    essay_intro_version: z.string().default(""),
    academic_claim_version: z.string().default(""),
    safer_critical_version: z.string().default(""),
  }).default({
    short_version: "",
    social_post_version: "",
    essay_intro_version: "",
    academic_claim_version: "",
    safer_critical_version: "",
  }),
  recommended_reading: z.array(z.string()).default([]),
  final_audit_comment: z.string().min(1),
});

export type DialecticAuditResultParsed = z.infer<typeof DialecticAuditResultSchema>;
