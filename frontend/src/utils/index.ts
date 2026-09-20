// ============================================================
// GuardRAIL – Utility Functions
// ============================================================
import type { Severity, IncidentStatus, VulnerabilityCategory } from '../types';

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

export function severityClass(s: Severity): string {
  return { critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low' }[s];
}

export function severityColor(s: Severity): string {
  return { critical: '#ef4444', high: '#f97316', medium: '#eab308', low: '#3b82f6' }[s];
}

export function statusLabel(s: IncidentStatus): string {
  const labels: Record<IncidentStatus, string> = {
    detected:          'Detected',
    analysing:         'Analysing',
    quarantined:       'Quarantined',
    generating_fix:    'Generating Fix',
    validating:        'Validating',
    validation_failed: 'Validation Failed',
    pr_created:        'PR Created',
    awaiting_approval: 'Awaiting Approval',
    approved:          'Approved',
    rejected:          'Rejected',
    resolved:          'Resolved',
    manual_review:     'Manual Review',
  };
  return labels[s] ?? s;
}

export function statusClass(s: IncidentStatus): string {
  const m: Record<IncidentStatus, string> = {
    detected:          'badge-accent',
    analysing:         'badge-purple',
    quarantined:       'badge-high',
    generating_fix:    'badge-purple',
    validating:        'badge-purple',
    validation_failed: 'badge-critical',
    pr_created:        'badge-accent',
    awaiting_approval: 'badge-medium',
    approved:          'badge-resolved',
    rejected:          'badge-critical',
    resolved:          'badge-resolved',
    manual_review:     'badge-high',
  };
  return m[s] ?? 'badge-accent';
}

export function categoryLabel(c: VulnerabilityCategory): string {
  const labels: Record<VulnerabilityCategory, string> = {
    exposed_secret:      'Exposed Secret',
    public_s3:           'Public S3 Bucket',
    iam_misconfiguration:'IAM Misconfiguration',
    public_database:     'Public Database',
    missing_encryption:  'Missing Encryption',
    network_exposure:    'Network Exposure',
    hardcoded_credential:'Hardcoded Credential',
  };
  return labels[c] ?? c;
}

export function scoreColor(score: number): string {
  if (score >= 85) return '#22c55e';
  if (score >= 65) return '#eab308';
  if (score >= 45) return '#f97316';
  return '#ef4444';
}

export function truncateSha(sha: string): string {
  return sha.slice(0, 7);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
