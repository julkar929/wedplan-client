export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function passwordIssues(pw: string): string[] {
  const issues: string[] = [];
  if (pw.length < 6) issues.push('At least 6 characters');
  if (!/[A-Z]/.test(pw)) issues.push('One uppercase letter');
  if (!/[a-z]/.test(pw)) issues.push('One lowercase letter');
  return issues;
}

/** Only same-site relative paths are honoured after sign-in (prevents open redirects). */
export function safeRedirect(target: string | null | undefined, fallback = '/dashboard'): string {
  if (!target || !target.startsWith('/') || target.startsWith('//') || target.includes('\\')) return fallback;
  return target;
}
