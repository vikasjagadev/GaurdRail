// ============================================================
// GuardRAIL – Incident Detail Page
// ============================================================
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Lock, Cpu, CheckCircle2, GitPullRequest,
  MessageSquare, Database, Eye, RefreshCw, Download, ShieldAlert,
  Clock, GitCommit, FileCode, User, ExternalLink, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { DEMO_REMEDIATIONS, DEMO_QUARANTINE_ACTIONS } from '../data/demoData';
import { SeverityBadge, StatusBadge, ConfirmDialog, SectionHeader, Textarea } from '../components/ui';
import { formatTimestamp, formatRelativeTime, categoryLabel, statusLabel } from '../utils';

type TimelineStepStatus = 'complete' | 'active' | 'pending' | 'failed';

interface Step {
  icon: React.ElementType;
  title: string;
  desc: string;
  status: TimelineStepStatus;
  time?: string;
  actor?: string;
}

export default function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incidents, auditEvents, approvals, approveIncident, rejectIncident } = useAppStore();

  const incident = incidents.find(i => i.incidentId === id);
  const remediation = DEMO_REMEDIATIONS.find(r => r.incidentId === id);
  const quarantine = DEMO_QUARANTINE_ACTIONS.find(q => q.incidentId === id);
  const incidentApprovals = approvals.filter(a => a.incidentId === id);
  const incidentAudit = auditEvents.filter(e => e.incidentId === id);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [diffExpanded, setDiffExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'audit'>('overview');

  if (!incident) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <AlertTriangle size={40} color="var(--critical)" style={{ marginBottom: 16 }} />
        <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>Incident not found</div>
        <button className="btn btn-ghost" style={{ marginTop: 16 }} onClick={() => navigate('/incidents')}>
          <ArrowLeft size={15} /> Back to Incidents
        </button>
      </div>
    );
  }

  // Derive timeline steps from status
  const getStepStatus = (step: string): TimelineStepStatus => {
    const order = ['detected', 'analysing', 'quarantined', 'generating_fix', 'validating', 'pr_created', 'awaiting_approval', 'approved', 'resolved'];
    const currentIdx = order.indexOf(incident.status);
    const stepIdx = order.indexOf(step);
    if (incident.status === 'validation_failed' && step === 'validating') return 'failed';
    if (incident.status === 'rejected' && step === 'approved') return 'failed';
    if (stepIdx < currentIdx) return 'complete';
    if (stepIdx === currentIdx) return 'active';
    return 'pending';
  };

  const TIMELINE_STEPS: Step[] = [
    { icon: AlertTriangle, title: 'Vulnerability Detected', desc: `Detected in ${incident.filePath} on line ${incident.lineNumber}`, status: 'complete', time: incident.detectedAt, actor: 'GuardRAIL Scanner' },
    { icon: Eye, title: 'Risk Analysis', desc: `Classified as ${incident.severity.toUpperCase()} — ${categoryLabel(incident.category)}`, status: getStepStatus('analysing'), time: incident.detectedAt, actor: 'Risk Classifier' },
    { icon: Lock, title: 'Resource Quarantined', desc: quarantine ? quarantine.actionType.replace(/_/g, ' ') : 'Containment action applied', status: quarantine ? 'complete' : getStepStatus('quarantined'), time: quarantine?.executedAt, actor: 'Quarantine Manager' },
    { icon: Cpu, title: 'AI Patch Generated', desc: remediation ? `Confidence: ${(remediation.confidence * 100).toFixed(0)}% — Amazon Bedrock Claude 3.5` : 'Bedrock generating fix…', status: remediation ? 'complete' : getStepStatus('generating_fix'), time: remediation?.createdAt, actor: 'Amazon Bedrock' },
    { icon: CheckCircle2, title: 'Patch Validated', desc: remediation ? `${remediation.validationResults.filter(v => v.status === 'pass').length}/${remediation.validationResults.length} checks passed` : 'Running validation checks…', status: remediation ? 'complete' : getStepStatus('validating'), actor: 'Patch Validator' },
    { icon: GitPullRequest, title: 'Pull Request Created', desc: remediation?.pullRequestUrl ? `PR #${remediation.pullRequestNumber} on ${incident.repository}` : 'PR creation pending', status: remediation?.pullRequestUrl ? 'complete' : getStepStatus('pr_created'), actor: 'GitHub Integration' },
    { icon: MessageSquare, title: 'Slack Approval Sent', desc: 'Security team notified via Slack', status: getStepStatus('awaiting_approval'), actor: 'Slack Integration' },
    { icon: CheckCircle2, title: 'Resolution', desc: incident.status === 'resolved' ? 'Patch approved and applied' : incident.status === 'rejected' ? 'Patch rejected — manual review required' : 'Awaiting reviewer decision', status: incident.status === 'resolved' ? 'complete' : incident.status === 'rejected' ? 'failed' : 'pending', actor: incident.assignedReviewer },
  ];

  const stepDotClass = (s: TimelineStepStatus) => ({
    complete: 'timeline-dot timeline-dot-complete',
    active: 'timeline-dot timeline-dot-active animate-pulse-glow',
    pending: 'timeline-dot timeline-dot-pending',
    failed: 'timeline-dot timeline-dot-failed',
  }[s]);

  return (
    <div style={{ maxWidth: 1200, display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">
      {/* Back + header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/incidents')}>
          <ArrowLeft size={15} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
            <SeverityBadge severity={incident.severity} />
            <StatusBadge status={incident.status} />
            <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{incident.incidentId}</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>{incident.title}</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button className="btn btn-ghost btn-sm"><RefreshCw size={14} /> Regenerate Fix</button>
          <button className="btn btn-ghost btn-sm"><Download size={14} /> Report</button>
          {incident.status === 'awaiting_approval' && (
            <>
              <button className="btn btn-danger btn-sm" onClick={() => setShowReject(true)}>Reject</button>
              <button className="btn btn-success btn-sm" onClick={() => setShowApprove(true)}>Approve</button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 0 }}>
        {(['overview', 'code', 'audit'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '10px 20px', fontSize: '0.875rem', fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
              marginBottom: -1, transition: 'all 0.15s',
            }}
          >
            {tab === 'overview' ? 'Overview' : tab === 'code' ? 'Code Diff' : 'Audit Trail'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          {/* Left: timeline + details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Remediation timeline */}
            <div className="card" style={{ padding: 24 }}>
              <SectionHeader title="Remediation Timeline" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {TIMELINE_STEPS.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} style={{ display: 'flex', gap: 14, paddingBottom: i < TIMELINE_STEPS.length - 1 ? 20 : 0, position: 'relative' }}>
                      {i < TIMELINE_STEPS.length - 1 && (
                        <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 2, background: step.status === 'complete' ? 'var(--resolved-border)' : 'var(--border-subtle)' }} />
                      )}
                      <div className={stepDotClass(step.status)}>
                        <Icon size={14} />
                      </div>
                      <div style={{ flex: 1, paddingTop: 6 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: step.status === 'pending' ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: 3 }}>
                          {step.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                        {step.time && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                            {formatTimestamp(step.time)} · {step.actor}
                          </div>
                        )}
                        {!step.time && step.actor && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{step.actor}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quarantine action */}
            {quarantine && (
              <div className="card" style={{ padding: 20, border: '1px solid var(--high-border)' }}>
                <SectionHeader title="Quarantine Action" subtitle="Reversible containment applied automatically" />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    ['Action Type', quarantine.actionType.replace(/_/g, ' ').toUpperCase()],
                    ['Status', 'ACTIVE'],
                    ['Reversible', quarantine.reversible ? 'Yes' : 'No'],
                    ['Executed', formatRelativeTime(quarantine.executedAt)],
                    ['IAM Role', quarantine.iamRole.split('/').pop() ?? ''],
                    ['Resource', quarantine.resourceArn.split(':').pop() ?? ''],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', marginBottom: 3 }}>{k}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, padding: 12, background: 'var(--bg-elevated)', borderRadius: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <strong style={{ color: 'var(--text-secondary)' }}>Rollback:</strong> {quarantine.rollbackInstructions}
                </div>
              </div>
            )}

            {/* AI explanation */}
            {remediation && (
              <div className="card" style={{ padding: 20, border: '1px solid var(--accent-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Cpu size={14} color="var(--accent)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>Bedrock AI Analysis</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Claude 3.5 Sonnet · Confidence: {(remediation.confidence * 100).toFixed(0)}%</div>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <div style={{ height: 6, width: 80, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${remediation.confidence * 100}%`, height: '100%', background: remediation.confidence > 0.85 ? 'var(--resolved)' : 'var(--medium)', borderRadius: 99 }} />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'right', marginTop: 2 }}>{(remediation.confidence * 100).toFixed(0)}% confidence</div>
                  </div>
                </div>
                <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
                  {remediation.aiExplanation}
                </p>
              </div>
            )}

            {/* Validation results */}
            {remediation && (
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="Validation Results" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {remediation.validationResults.map((v, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 14px', borderRadius: 8,
                      background: v.status === 'pass' ? 'var(--resolved-bg)' : v.status === 'fail' ? 'var(--critical-bg)' : 'var(--bg-elevated)',
                      border: `1px solid ${v.status === 'pass' ? 'var(--resolved-border)' : v.status === 'fail' ? 'var(--critical-border)' : 'var(--border-subtle)'}`,
                    }}>
                      <CheckCircle2 size={16} color={v.status === 'pass' ? 'var(--resolved)' : 'var(--critical)'} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)' }}>{v.check}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{v.message}</div>
                      </div>
                      {v.duration && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{v.duration}ms</div>}
                      <span className={`badge ${v.status === 'pass' ? 'badge-resolved' : 'badge-critical'}`}>{v.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Approval history */}
            {incidentApprovals.length > 0 && (
              <div className="card" style={{ padding: 20 }}>
                <SectionHeader title="Approval History" />
                {incidentApprovals.map(a => (
                  <div key={a.approvalId} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: a.decision === 'approved' ? 'var(--resolved-bg)' : 'var(--critical-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} color={a.decision === 'approved' ? 'var(--resolved)' : 'var(--critical)'} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {a.reviewerName}
                        <span className={`badge ${a.decision === 'approved' ? 'badge-resolved' : 'badge-critical'}`} style={{ marginLeft: 8 }}>
                          {a.decision}
                        </span>
                      </div>
                      {a.reason && <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: 4 }}>{a.reason}</div>}
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{formatTimestamp(a.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Metadata sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Incident info */}
            <div className="card" style={{ padding: 20 }}>
              <SectionHeader title="Incident Details" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {[
                  { icon: <GitCommit size={14} />, label: 'Commit', value: incident.commitSha },
                  { icon: <FileCode size={14} />, label: 'File', value: `${incident.filePath}:${incident.lineNumber}` },
                  { icon: <ShieldAlert size={14} />, label: 'Category', value: categoryLabel(incident.category) },
                  { icon: <Clock size={14} />, label: 'Detected', value: formatRelativeTime(incident.detectedAt) },
                  { icon: <User size={14} />, label: 'Reviewer', value: incident.assignedReviewer?.split('@')[0] ?? 'Unassigned' },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display: 'flex', gap: 10 }}>
                    <div style={{ color: 'var(--text-muted)', flexShrink: 0, paddingTop: 2 }}>{icon}</div>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Evidence */}
            <div className="card" style={{ padding: 20, border: '1px solid var(--critical-border)' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>MASKED EVIDENCE</div>
              <code style={{ display: 'block', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem', color: 'var(--critical)', background: 'var(--critical-bg)', padding: '10px 14px', borderRadius: 8, wordBreak: 'break-all' }}>
                {incident.maskedEvidence}
              </code>
              <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {incident.riskDescription}
              </p>
            </div>

            {/* PR link */}
            {remediation?.pullRequestUrl && (
              <div className="card" style={{ padding: 20, border: '1px solid var(--resolved-border)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: 10 }}>PULL REQUEST</div>
                <a
                  href={remediation.pullRequestUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent)', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}
                >
                  <GitPullRequest size={16} />
                  PR #{remediation.pullRequestNumber}
                  <ExternalLink size={13} />
                </a>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6 }}>guardrail/fix-{incident.incidentId} → main</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'code' && remediation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Code Diff — {incident.filePath}</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setDiffExpanded(e => !e)}>
              {diffExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {diffExpanded ? 'Collapse' : 'Expand'}
            </button>
          </div>

          {diffExpanded && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--critical)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'var(--critical-bg)', padding: '2px 8px', borderRadius: 4 }}>BEFORE</span> Insecure Code
                </div>
                <div className="code-block" style={{ borderColor: 'var(--critical-border)' }}>
                  {remediation.originalCode.split('\n').map((line, i) => (
                    <span key={i} className="line-del">{`  ${line}\n`}</span>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--resolved)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ background: 'var(--resolved-bg)', padding: '2px 8px', borderRadius: 4 }}>AFTER</span> Secure Patch
                </div>
                <div className="code-block" style={{ borderColor: 'var(--resolved-border)' }}>
                  {remediation.patchedCode.split('\n').map((line, i) => (
                    <span key={i} className="line-add">{`  ${line}\n`}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 10, letterSpacing: '0.04em' }}>AI GENERATED — REQUIRES HUMAN REVIEW BEFORE MERGE</div>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {remediation.aiExplanation}
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {remediation.validationCommands.map(cmd => (
                <code key={cmd} style={{ background: 'var(--bg-elevated)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 6, fontSize: '0.78rem', border: '1px solid var(--border-subtle)' }}>
                  {cmd}
                </code>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Actor</th>
                <th>Type</th>
                <th>Result</th>
                <th>Resource</th>
              </tr>
            </thead>
            <tbody>
              {incidentAudit.map(evt => (
                <tr key={evt.eventId}>
                  <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{formatTimestamp(evt.timestamp)}</td>
                  <td>
                    <code style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{evt.action}</code>
                  </td>
                  <td style={{ fontSize: '0.82rem' }}>{evt.actor.split('-').slice(0, 3).join(' ')}</td>
                  <td>
                    <span className={`badge ${evt.actorType === 'human' ? 'badge-accent' : evt.actorType === 'ai' ? 'badge-purple' : 'badge-low'}`}>
                      {evt.actorType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${evt.result === 'success' ? 'badge-resolved' : 'badge-critical'}`}>{evt.result}</span>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {evt.affectedResource ?? '—'}
                  </td>
                </tr>
              ))}
              {incidentAudit.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No audit events yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve dialog */}
      {showApprove && (
        <ConfirmDialog
          title="Approve Security Patch"
          message={`You are approving the AI-generated fix for ${incident.incidentId}. This will merge PR #${remediation?.pullRequestNumber} into the main branch.`}
          confirmText="Approve & Merge"
          onConfirm={() => {
            approveIncident(incident.incidentId, 'sarah.chen', 'Sarah Chen', reason || 'Patch reviewed and approved');
            setShowApprove(false);
            setReason('');
          }}
          onCancel={() => { setShowApprove(false); setReason(''); }}
        >
          <Textarea placeholder="Add approval notes (optional)…" value={reason} onChange={e => setReason(e.target.value)} />
        </ConfirmDialog>
      )}

      {/* Reject dialog */}
      {showReject && (
        <ConfirmDialog
          title="Reject Security Patch"
          message={`You are rejecting the AI-generated fix for ${incident.incidentId}. The resource will remain quarantined and the security team will be notified.`}
          confirmText="Reject Patch"
          danger
          onConfirm={() => {
            if (!reason.trim()) { alert('Please provide a rejection reason.'); return; }
            rejectIncident(incident.incidentId, 'sarah.chen', 'Sarah Chen', reason);
            setShowReject(false);
            setReason('');
          }}
          onCancel={() => { setShowReject(false); setReason(''); }}
        >
          <Textarea placeholder="Rejection reason (required)…" value={reason} onChange={e => setReason(e.target.value)} style={{ borderColor: reason ? undefined : 'var(--critical-border)' }} />
        </ConfirmDialog>
      )}
    </div>
  );
}
