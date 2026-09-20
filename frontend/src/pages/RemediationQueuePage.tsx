// ============================================================
// GuardRAIL – Remediation Queue Page
// ============================================================
import { useNavigate } from 'react-router-dom';
import { Layers, Cpu, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { DEMO_REMEDIATIONS } from '../data/demoData';
import { SeverityBadge, StatusBadge, SectionHeader } from '../components/ui';
import { formatRelativeTime } from '../utils';

export default function RemediationQueuePage() {
  const { incidents } = useAppStore();
  const navigate = useNavigate();

  const queue = incidents.filter(i => ['generating_fix', 'validating', 'validation_failed', 'pr_created', 'awaiting_approval'].includes(i.status));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1100 }} className="animate-fade-in">
      <SectionHeader title="Remediation Queue" subtitle={`${queue.length} patches in progress`} />

      {queue.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <Layers size={40} color="var(--accent)" style={{ marginBottom: 16, opacity: 0.5 }} />
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Queue is empty</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No active remediation tasks</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {queue.map(inc => {
            const rem = DEMO_REMEDIATIONS.find(r => r.incidentId === inc.incidentId);
            return (
              <div
                key={inc.incidentId}
                className="card"
                style={{ padding: 20, cursor: 'pointer', transition: 'border-color 0.15s' }}
                onClick={() => navigate(`/incidents/${inc.incidentId}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Cpu size={18} color="var(--accent)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                      <SeverityBadge severity={inc.severity} />
                      <StatusBadge status={inc.status} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{inc.title}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      {inc.repository} · {inc.filePath}
                    </div>
                  </div>
                  {rem && (
                    <div style={{ display: 'flex', gap: 12, flexShrink: 0, flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: rem.confidence > 0.9 ? 'var(--resolved)' : 'var(--medium)' }}>
                          {(rem.confidence * 100).toFixed(0)}%
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>AI Confidence</div>
                      </div>
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--resolved)' }}>
                          {rem.validationResults.filter(v => v.status === 'pass').length}/{rem.validationResults.length}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Checks</div>
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Clock size={13} /> {formatRelativeTime(inc.updatedAt)}
                  </div>
                </div>

                {/* Validation mini-checks */}
                {rem && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                    {rem.validationResults.map(v => (
                      <div key={v.check} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '3px 10px', borderRadius: 99, background: v.status === 'pass' ? 'var(--resolved-bg)' : 'var(--critical-bg)', border: `1px solid ${v.status === 'pass' ? 'var(--resolved-border)' : 'var(--critical-border)'}`, color: v.status === 'pass' ? 'var(--resolved)' : 'var(--critical)' }}>
                        {v.status === 'pass' ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        {v.check}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
