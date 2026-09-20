// ============================================================
// GuardRAIL – Integrations Page
// ============================================================
import { useState } from 'react';
import {
  Cpu, Shield, Key, GitBranch, Activity, MessageSquare,
  CheckCircle2, XCircle, RefreshCw, Settings, Clock
} from 'lucide-react';
import { DEMO_INTEGRATIONS } from '../data/demoData';
import { SectionHeader } from '../components/ui';
import { formatRelativeTime } from '../utils';
import type { Integration } from '../types';

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ElementType> = {
  github: GithubIcon,
  cpu: Cpu,
  shield: Shield,
  key: Key,
  'git-branch': GitBranch,
  activity: Activity,
  'message-square': MessageSquare,
};

function IntegrationCard({ integration }: { integration: Integration }) {
  const [testing, setTesting] = useState(false);
  const [tested, setTested] = useState(false);
  const Icon = ICON_MAP[integration.icon] ?? Shield;

  const testConnection = () => {
    setTesting(true);
    setTimeout(() => { setTesting(false); setTested(true); setTimeout(() => setTested(false), 3000); }, 1500);
  };

  const isConnected = integration.status === 'connected';

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: isConnected ? 'var(--accent-dim)' : 'var(--bg-elevated)',
          border: `1px solid ${isConnected ? 'var(--accent-border)' : 'var(--border-default)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={22} color={isConnected ? 'var(--accent)' : 'var(--text-muted)'} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{integration.displayName}</div>
            <span className={`badge ${isConnected ? 'badge-resolved' : 'badge-critical'}`} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {isConnected ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {integration.status}
            </span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{integration.description}</div>
        </div>
      </div>

      {/* Stats */}
      {isConnected && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Requests', value: integration.requestCount?.toLocaleString() ?? '—' },
            { label: 'Error Rate', value: integration.errorRate !== undefined ? `${(integration.errorRate * 100).toFixed(1)}%` : '—' },
            { label: 'Last Success', value: integration.lastSuccess ? formatRelativeTime(integration.lastSuccess) : '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ padding: '8px 12px', background: 'var(--bg-elevated)', borderRadius: 8 }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>{label}</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Config fields masked */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
        {integration.configFields.map(field => (
          <div key={field} style={{ padding: '4px 10px', background: 'var(--bg-elevated)', borderRadius: 6, border: '1px solid var(--border-subtle)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }}>
            <Key size={10} color="var(--text-muted)" />
            <span style={{ color: 'var(--text-muted)' }}>{field}: </span>
            <span style={{ color: isConnected ? 'var(--resolved)' : 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
              {isConnected ? '••••••••' : 'not set'}
            </span>
          </div>
        ))}
      </div>

      {/* Last check */}
      {integration.lastCheck && (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <Clock size={11} /> Last checked {formatRelativeTime(integration.lastCheck)}
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={testConnection} disabled={testing}>
          {testing ? <RefreshCw size={13} className="animate-spin-slow" /> : tested ? <CheckCircle2 size={13} color="var(--resolved)" /> : <RefreshCw size={13} />}
          {testing ? 'Testing…' : tested ? 'Connected!' : 'Test Connection'}
        </button>
        <button className="btn btn-ghost btn-sm"><Settings size={13} /> Configure</button>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }} className="animate-fade-in">
      <SectionHeader
        title="Integrations"
        subtitle="AWS services, GitHub, and Slack connections"
      />

      {/* Security notice */}
      <div style={{ padding: '12px 16px', background: 'var(--purple-dim)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--purple)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Shield size={14} />
        Credentials are stored in AWS Secrets Manager and never exposed in the frontend or logs.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 16 }}>
        {DEMO_INTEGRATIONS.map(integration => (
          <IntegrationCard key={integration.id} integration={integration} />
        ))}
      </div>
    </div>
  );
}
