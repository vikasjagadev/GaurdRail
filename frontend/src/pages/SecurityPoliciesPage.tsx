// ============================================================
// GuardRAIL – Security Policies Configuration Page
// ============================================================
import { useState } from 'react';
import {
  Shield, Check, AlertTriangle, Cpu, Lock, Bell, RefreshCw, Save
} from 'lucide-react';
import { SectionHeader } from '../components/ui';

interface PolicySetting {
  id: string;
  name: string;
  category: 'Enforcement' | 'AI Remediation' | 'Validation' | 'Notifications';
  description: string;
  value: boolean | string | number;
  type: 'toggle' | 'select' | 'input';
  options?: string[];
  warning?: string;
}

const DEFAULT_POLICIES: PolicySetting[] = [
  {
    id: 'auto_quarantine_critical',
    name: 'Autonomous Containment for Critical Assets',
    category: 'Enforcement',
    description: 'Instantly isolate exposed AWS resources (e.g. apply S3 Block Public Access, revoke compromised IAM keys) prior to human triage.',
    value: true,
    type: 'toggle',
    warning: 'Active: Critical security risks will be neutralized autonomously within seconds of detection.'
  },
  {
    id: 'human_in_loop_merge',
    name: 'Mandatory Human-in-the-Loop Approval',
    category: 'Enforcement',
    description: 'Enforces explicit reviewer sign-off in GuardRAIL or Slack before auto-generated pull requests can be merged into protected branches.',
    value: true,
    type: 'toggle'
  },
  {
    id: 'ai_model',
    name: 'Bedrock Remediation Model',
    category: 'AI Remediation',
    description: 'Select the foundation model deployed via Amazon Bedrock for generating least-privilege security patches.',
    value: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
    type: 'select',
    options: [
      'anthropic.claude-3-5-sonnet-20241022-v2:0',
      'anthropic.claude-3-opus-20240229-v1:0',
      'meta.llama3-3-70b-instruct-v1:0'
    ]
  },
  {
    id: 'ai_confidence_threshold',
    name: 'Minimum Confidence Score for Auto-PR',
    category: 'AI Remediation',
    description: 'Remediation patches scoring below this threshold will be flagged for manual engineer drafting instead of auto-creating a PR.',
    value: '90%',
    type: 'select',
    options: ['85%', '90%', '95%', '98%']
  },
  {
    id: 'mask_credentials',
    name: 'Zero-Leak Evidence Masking',
    category: 'Enforcement',
    description: 'Strictly redact secrets, API keys, and private credentials in UI timelines, audit logs, and notification payloads.',
    value: true,
    type: 'toggle'
  },
  {
    id: 'validation_checkov',
    name: 'IaC Security Validation (Checkov & TFSec)',
    category: 'Validation',
    description: 'Execute static analysis and compliance validation suites against generated Terraform patches before opening PRs.',
    value: true,
    type: 'toggle'
  },
  {
    id: 'slack_channel',
    name: 'Slack Triage Channel',
    category: 'Notifications',
    description: 'Destination Slack channel where interactive approval blocks and emergency containment alerts are dispatched.',
    value: '#security-alerts-live',
    type: 'input'
  }
];

export default function SecurityPoliciesPage() {
  const [policies, setPolicies] = useState<PolicySetting[]>(DEFAULT_POLICIES);
  const [saved, setSaved] = useState(false);

  const handleToggle = (id: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, value: !p.value } : p))
    );
    setSaved(false);
  };

  const handleChange = (id: string, val: string) => {
    setPolicies(prev =>
      prev.map(p => (p.id === id ? { ...p, value: val } : p))
    );
    setSaved(false);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const categories = Array.from(new Set(policies.map(p => p.category)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1100 }} className="animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <SectionHeader
          title="Security Policies & Guardrails"
          subtitle="Define autonomous containment boundaries and AI remediation guardrails"
        />

        <button
          className="btn btn-primary"
          onClick={handleSave}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Policies Enforced' : 'Save Policies'}
        </button>
      </div>

      {saved && (
        <div style={{ padding: '12px 16px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--resolved)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={16} /> Security policies successfully synchronized across all active event listeners.
        </div>
      )}

      {categories.map(cat => {
        const catPolicies = policies.filter(p => p.category === cat);
        return (
          <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {cat}
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              {catPolicies.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    padding: 20,
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 20,
                    borderBottom: idx < catPolicies.length - 1 ? '1px solid var(--border-subtle)' : 'none'
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4 }}>
                      {p.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: p.warning ? 8 : 0 }}>
                      {p.description}
                    </div>
                    {p.warning && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: 'var(--medium)', background: 'rgba(234, 179, 8, 0.1)', padding: '4px 10px', borderRadius: 4, width: 'fit-content' }}>
                        <AlertTriangle size={13} /> {p.warning}
                      </div>
                    )}
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    {p.type === 'toggle' && (
                      <button
                        type="button"
                        onClick={() => handleToggle(p.id)}
                        style={{
                          width: 46,
                          height: 24,
                          borderRadius: 12,
                          background: p.value ? 'var(--accent)' : 'var(--bg-surface)',
                          border: `1px solid ${p.value ? 'var(--accent)' : 'var(--border-subtle)'}`,
                          position: 'relative',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          outline: 'none'
                        }}
                      >
                        <span
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: '#fff',
                            position: 'absolute',
                            top: 2,
                            left: p.value ? 24 : 2,
                            transition: 'left 0.2s ease'
                          }}
                        />
                      </button>
                    )}

                    {p.type === 'select' && (
                      <select
                        value={String(p.value)}
                        onChange={e => handleChange(p.id, e.target.value)}
                        style={{
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 6,
                          padding: '6px 10px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        {p.options?.map(opt => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {p.type === 'input' && (
                      <input
                        type="text"
                        value={String(p.value)}
                        onChange={e => handleChange(p.id, e.target.value)}
                        style={{
                          background: 'var(--bg-card)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 6,
                          padding: '6px 12px',
                          fontSize: '0.82rem',
                          outline: 'none',
                          fontFamily: 'var(--font-mono)'
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
