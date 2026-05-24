import type { AuditFormData, AuditResult } from "@/types/audit";

export const PENDING_AUDIT_KEY = "pending-audit";
export const CURRENT_AUDIT_RESULT_KEY = "current-audit-result";

function dbSavedKey(auditId: string): string {
  return `audit-db-saved-${auditId}`;
}

export function savePendingAudit(
  formData: AuditFormData,
  result: AuditResult,
): void {
  localStorage.setItem(PENDING_AUDIT_KEY, JSON.stringify(formData));
  sessionStorage.setItem(CURRENT_AUDIT_RESULT_KEY, JSON.stringify(result));
}

export function loadCurrentAuditResult(): AuditResult | null {
  const raw = sessionStorage.getItem(CURRENT_AUDIT_RESULT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuditResult;
  } catch {
    return null;
  }
}

export function cacheAuditResult(result: AuditResult): void {
  sessionStorage.setItem(CURRENT_AUDIT_RESULT_KEY, JSON.stringify(result));
}

export function isAuditPersisted(auditId: string): boolean {
  return sessionStorage.getItem(dbSavedKey(auditId)) === "1";
}

export function markAuditPersisted(auditId: string): void {
  sessionStorage.setItem(dbSavedKey(auditId), "1");
}
