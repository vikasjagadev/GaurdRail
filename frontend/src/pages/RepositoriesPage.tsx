// ============================================================
// GuardRAIL – Repositories Page
// ============================================================
import { useState } from 'react';
import { GitBranch, RefreshCw, Plus, ExternalLink, Shield, Wifi, AlertTriangle } from 'lucide-react';
import { DEMO_REPOSITORIES } from '../data/demoData';
import { SectionHeader } from '../components/ui';
import { scoreColor, formatRelativeTime } from '../utils';

export default function RepositoriesPage() {
  const [repos] = useState(DEMO_REPOSITORIES);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }} className="animate-fade-in">
      <SectionHeader
        title="Connected Repositories"
        subtitle={`${repos.length} repositories monitored`}
        actions={
          <button className="btn btn-primary btn-sm"><Plus size={14} /> Connect Repository</button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(520px, 1fr))', gap: 16 }}>
        {repos.map(repo => (
          <div key={repo.repoId} className="card" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <GitBranch size={20} color="var(--accent)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{repo.fullName}</div>
                  <span className={`badge ${repo.visibility === 'private' ? 'badge-accent' : 'badge-high'}`}>{repo.visibility}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {repo.language} · Default: <span className="mono">{repo.defaultBranch}</span> · Last scan: {formatRelativeTime(repo.lastScan)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <span className={`badge ${repo.webhookStatus === 'active' ? 'badge-resolved' : 'badge-critical'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Wifi size={10} /> {repo.webhookStatus}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
              <div style={{ textAlign: 'center', padding: '12px 8px', background: repo.openFindings > 0 ? 'var(--critical-bg)' : 'var(--bg-elevated)', borderRadius: 8, border: repo.openFindings > 0 ? '1px solid var(--critical-border)' : '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: repo.openFindings > 0 ? 'var(--critical)' : 'var(--text-primary)' }}>{repo.openFindings}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Open</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 8px', background: repo.criticalFindings > 0 ? 'var(--critical-bg)' : 'var(--bg-elevated)', borderRadius: 8, border: repo.criticalFindings > 0 ? '1px solid var(--critical-border)' : '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: repo.criticalFindings > 0 ? 'var(--critical)' : 'var(--text-primary)' }}>{repo.criticalFindings}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Critical</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px 8px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: scoreColor(repo.securityScore) }}>{repo.securityScore}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>Score</div>
              </div>
              <div style={{ padding: '12px 8px', background: 'var(--bg-elevated)', borderRadius: 8, border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ height: 4, width: 48, background: 'var(--bg-surface)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ width: `${repo.securityScore}%`, height: '100%', background: scoreColor(repo.securityScore), borderRadius: 99 }} />
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>Security</div>
              </div>
            </div>

            {/* Settings toggles */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: repo.autoQuarantine ? 'var(--resolved-bg)' : 'var(--bg-elevated)', border: `1px solid ${repo.autoQuarantine ? 'var(--resolved-border)' : 'var(--border-subtle)'}`, fontSize: '0.78rem', color: repo.autoQuarantine ? 'var(--resolved)' : 'var(--text-muted)' }}>
                <Shield size={12} /> Auto-Quarantine {repo.autoQuarantine ? 'ON' : 'OFF'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: repo.requireHumanApproval ? 'var(--accent-dim)' : 'var(--bg-elevated)', border: `1px solid ${repo.requireHumanApproval ? 'var(--accent-border)' : 'var(--border-subtle)'}`, fontSize: '0.78rem', color: repo.requireHumanApproval ? 'var(--accent)' : 'var(--text-muted)' }}>
                <AlertTriangle size={12} /> Human Approval {repo.requireHumanApproval ? 'ON' : 'OFF'}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-ghost btn-sm"><RefreshCw size={13} /> Scan Now</button>
              <button className="btn btn-ghost btn-sm"><ExternalLink size={13} /> Open in GitHub</button>
              <button className="btn btn-ghost btn-sm">Configure</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
