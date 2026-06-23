import type { AuditInput, AuditResult } from "./types";

const INPUT_KEY = "ppa_audit_input";
const RESULT_KEY = "ppa_audit_result";

export function saveAuditInput(input: AuditInput): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INPUT_KEY, JSON.stringify(input));
}

export function loadAuditInput(): AuditInput | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(INPUT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuditInput; } catch { return null; }
}

export function saveAuditResult(result: AuditResult): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
}

export function loadAuditResult(): AuditResult | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try { return JSON.parse(raw) as AuditResult; } catch { return null; }
}
