export type TargetMedium =
  | "Zenodo"
  | "Journal"
  | "Research Essay"
  | "Personal Website"
  | "X / Social Post"
  | "Book Chapter"
  | "Private Draft";

export type Tone = "Academic" | "Public" | "Sharp" | "Experimental";

export type RiskTolerance = "Low" | "Medium" | "High";

export type AuditDepth = "Quick Audit" | "Full Audit" | "Deep Theory Audit";

export interface AuditInput {
  mode: "upload" | "paste" | "section";
  title: string;
  abstract?: string;
  outline?: string;
  mainText?: string;
  sectionTitle?: string;
  sectionText?: string;
  previousSectionSummary?: string;
  nextSectionAim?: string;
  fileName?: string;
  targetMedium: TargetMedium;
  tone: Tone;
  riskTolerance: RiskTolerance;
  auditDepth: AuditDepth;
}

export interface ScoreItem {
  label: string;
  value: number;
  description: string;
}

export interface AuditResult {
  totalScore: number;
  status: string;
  diagnosis: string;
  generativeScores: ScoreItem[];
  riskScores: ScoreItem[];
  criticalDiagnosis: string;
  strongestContribution: string;
  weakestConceptualPoint: string;
  mainPublicRisks: string[];
  requiredRevisions: string[];
  finalJudgment: string;
  createdAt: string;
  auditSource?: "real" | "mock";
  warnings?: string[];
}
