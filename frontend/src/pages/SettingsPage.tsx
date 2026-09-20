// ============================================================
// GuardRAIL – Settings Page
// ============================================================
import { useState } from 'react';
import {
  Settings, Key, Globe, Shield, RefreshCw, Check, Copy, AlertCircle,
  Server, Database, Bell
} from 'lucide-react';
import { SectionHeader } from '../components/ui';
import { useAppStore } from '../store/appStore';

export default function SettingsPage() {
  const { isDemo } = useAppStore();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1000 }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SectionHeader
          title="System Settings"
          subtitle="Configure deployment parameters, webhooks, and agent environment"
        />

        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saved ? <Check size={16} /> : <Settings size={16} />}
          {saved ? 'Saved Successfully' : 'Save Changes'}
        </button>
      </div>

      {saved && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--resolved)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> Configuration updated successfully.
        </div>
      )}

      {/* Environment info */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Server size={18} color="var(--accent)" /> Deployment Runtime & Status
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operating Mode</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--accent)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
              {isDemo ? 'Demo Mode (Simulated AWS/Slack)' : 'Live AWS Connected'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target AWS Account</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
              123456789012 (us-east-1)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Bedrock Agent Version</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              v2.4.1 (Sonnet 3.5)
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: 12, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Audit Retention</div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
              365 Days (WORM Compliant)
            </div>
          </div>
        </div>
      </div>

      {/* Webhook & Callback URLs */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Globe size={18} color="var(--accent)" /> Webhook Endpoints
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              GitHub Push & Pull Request Webhook URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                readOnly
                value="https://guardrail.corp.internal/api/webhooks/github"
                style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none'
                }}
              />
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard('https://guardrail.corp.internal/api/webhooks/github', 'gh')}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {copiedKey === 'gh' ? <Check size={14} color="var(--resolved)" /> : <Copy size={14} />}
                {copiedKey === 'gh' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              Slack Interactive Approval Interactivity URL
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                readOnly
                value="https://guardrail.corp.internal/api/webhooks/slack/interactions"
                style={{
                  flex: 1,
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  padding: '8px 12px',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-mono)',
                  outline: 'none'
                }}
              />
              <button
                className="btn btn-secondary"
                onClick={() => copyToClipboard('https://guardrail.corp.internal/api/webhooks/slack/interactions', 'slack')}
                style={{ fontSize: '0.8rem', padding: '6px 14px' }}
              >
                {copiedKey === 'slack' ? <Check size={14} color="var(--resolved)" /> : <Copy size={14} />}
                {copiedKey === 'slack' ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Security Credentials (Masked) */}
      <div className="card" style={{ padding: 20 }}>
        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Key size={18} color="var(--accent)" /> Secrets & API Credentials (Masked)
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              GuardRAIL Automation Token
            </label>
            <input
              type="password"
              value="gr_live_sec_99182348912384719238"
              readOnly
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
              AWS IAM Role ARN
            </label>
            <input
              type="text"
              value="arn:aws:iam::123456789012:role/GuardRailRemediationExecutionRole"
              readOnly
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: '8px 12px',
                fontSize: '0.82rem',
                fontFamily: 'var(--font-mono)',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
