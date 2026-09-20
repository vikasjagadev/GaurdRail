// ============================================================
// GuardRAIL – Approval Centre Page
// ============================================================
import { useState } from 'react';
import { CheckSquare, Clock, ShieldAlert, ExternalLink, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { DEMO_REMEDIATIONS } from '../data/demoData';
import { SeverityBadge, StatusBadge, ConfirmDialog, SectionHeader, Textarea } from '../components/ui';
import { formatRelativeTime } from '../utils';

export default function ApprovalsPage() {
  const { incidents, approveIncident, rejectIncident } = useAppStore();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [reason, setReason] = useState('');

  const pending = incidents.filter(i => i.status === 'awaiting_approval' || i.status === 'pr_created');

  const doAction = () => {
    if (!selectedId || !action) return;
    if (action === 'approve') {
      approveIncident(selectedId, 'sarah.chen', 'Sarah Chen', reason || 'Approved after review');
    } else {
      if (!reason.trim()) { alert('Rejection reason is required'); return; }
      rejectIncident(selectedId, 'sarah.chen', 'Sarah Chen', reason);
    }
    setSelectedId(null);
    setAction(null);
    setReason('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }} className="animate-fade-in">
      <SectionHeader
        title="Approval Centre"
        subtitle={`${pending.length} patches awaiting human review`}
      />

      {pending.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <CheckSquare size={40} color="var(--resolved)" style={{ marginBottom: 16, opacity: 0.7 }} />
          <div style={{ fontWeight: 600, fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            All caught up!
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No patches awaiting approval</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {pending.map(inc => {
            const rem = DEMO_REMEDIATIONS.find(r => r.incidentId === inc.incidentId);
            const waitMins = Math.floor((Date.now() - new Date(inc.updatedAt).getTime()) / 60000);
            return (
              <div key={inc.incidentId} className="card" style={{ padding: 24, border: inc.severity === 'critical' ? '1px solid var(--critical-border)' : '1px solid var(--border-subtle)' }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 18 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                      <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{inc.incidentId}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)', marginBottom: 4 }}>{inc.title}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {inc.repository} · {inc.filePath}:{inc.lineNumber}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--medium)', fontSize: '0.82rem', flexShrink: 0 }}>
                    <Clock size={14} /> Waiting {waitMins}m
                  </div>
                </div>

                {/* Grid: metadata */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14, marginBottom: 18 }}>
                  {[
                    { label: 'AI Confidence', value: rem ? `${(rem.confidence * 100).toFixed(0)}%` : '—', good: (rem?.confidence ?? 0) > 0.85 },
                    { label: 'Validation', value: rem ? `${rem.validationResults.filter(v => v.status === 'pass').length}/${rem.validationResults.length} passed` : '—', good: true },
                    { label: 'Quarantine', value: 'Active', good: true },
                    { label: 'PR', value: rem?.pullRequestNumber ? `#${rem.pullRequestNumber}` : '—', good: !!rem?.pullRequestNumber },
                  ].map(({ label, value, good }) => (
                    <div key={label} style={{ padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: good ? 'var(--resolved)' : 'var(--critical)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Risk summary */}
                <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: 18 }}>
                  <ShieldAlert size={14} style={{ display: 'inline', marginRight: 6, color: 'var(--critical)' }} />
                  {inc.riskDescription}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => navigate(`/incidents/${inc.incidentId}`)}>
                    <ChevronRight size={14} /> View Full Details
                  </button>
                  {rem?.pullRequestUrl && (
                    <a href={rem.pullRequestUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                      <ExternalLink size={14} /> Open PR
                    </a>
                  )}
                  <div style={{ flex: 1 }} />
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => { setSelectedId(inc.incidentId); setAction('reject'); }}
                  >
                    Reject
                  </button>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => { setSelectedId(inc.incidentId); setAction('approve'); }}
                  >
                    Approve Patch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dialog */}
      {selectedId && action && (
        <ConfirmDialog
          title={action === 'approve' ? 'Approve Security Patch' : 'Reject Security Patch'}
          message={action === 'approve'
            ? `Approve and merge the AI-generated fix for ${selectedId}? The PR will be marked ready to merge.`
            : `Reject the patch for ${selectedId}. The resource will remain quarantined and the security team notified.`}
          confirmText={action === 'approve' ? 'Approve & Merge' : 'Reject Patch'}
          danger={action === 'reject'}
          onConfirm={doAction}
          onCancel={() => { setSelectedId(null); setAction(null); setReason(''); }}
        >
          <Textarea
            placeholder={action === 'approve' ? 'Approval notes (optional)…' : 'Rejection reason (required)…'}
            value={reason}
            onChange={e => setReason(e.target.value)}
            style={action === 'reject' && !reason ? { borderColor: 'var(--critical-border)' } : undefined}
          />
        </ConfirmDialog>
      )}
    </div>
  );
}
