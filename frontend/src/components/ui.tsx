// ============================================================
// GuardRAIL – Shared UI Components
// ============================================================
import { ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { Severity, IncidentStatus } from '../types';
import { severityClass, statusClass, statusLabel } from '../utils';

// ── SeverityBadge ────────────────────────────────────────────
export function SeverityBadge({ severity }: { severity: Severity }) {
  const icons: Record<Severity, string> = { critical: '●', high: '●', medium: '●', low: '●' };
  return (
    <span className={`badge ${severityClass(severity)}`}>
      {icons[severity]} {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

// ── StatusBadge ──────────────────────────────────────────────
export function StatusBadge({ status }: { status: IncidentStatus }) {
  return (
    <span className={`badge ${statusClass(status)}`} style={{ textTransform: 'none', fontSize: '0.73rem' }}>
      {statusLabel(status)}
    </span>
  );
}

// ── StatCard ─────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  color?: string;
  delta?: string;
  deltaUp?: boolean;
  gradient?: string;
}
export function StatCard({ title, value, subtitle, icon, color = 'var(--accent)', delta, deltaUp, gradient }: StatCardProps) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s', position: 'relative', overflow: 'hidden' }}>
      {gradient && (
        <div style={{ position: 'absolute', inset: 0, background: gradient, opacity: 0.04, pointerEvents: 'none' }} />
      )}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>{title}</div>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: `${color}18`, border: `1px solid ${color}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color, flexShrink: 0,
        }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: '1.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{value}</div>
        {subtitle && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 5 }}>{subtitle}</div>}
        {delta && (
          <div style={{ marginTop: 6 }}>
            <span className={deltaUp ? 'delta-up' : 'delta-down'}>
              {deltaUp ? '↑' : '↓'} {delta}
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 4 }}>vs last 7d</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ConfirmDialog ────────────────────────────────────────────
interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}
export function ConfirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger, onConfirm, onCancel, children }: ConfirmDialogProps) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
    }} onClick={onCancel}>
      <div
        className="card animate-slide-in"
        style={{ width: 440, padding: 28, maxWidth: '90vw' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: danger ? 'var(--critical-bg)' : 'var(--accent-dim)',
            border: `1px solid ${danger ? 'var(--critical-border)' : 'var(--accent-border)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? 'var(--critical)' : 'var(--accent)',
          }}>
            {danger ? <AlertTriangle size={20} /> : <Info size={20} />}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{message}</div>
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginLeft: 'auto', flexShrink: 0 }}>
            <X size={18} />
          </button>
        </div>
        {children && <div style={{ marginBottom: 16 }}>{children}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>{cancelText}</button>
          <button
            className={`btn btn-sm ${danger ? 'btn-danger' : 'btn-primary'}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────
export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
      <div style={{ marginBottom: 16, opacity: 0.4, display: 'flex', justifyContent: 'center' }}>{icon}</div>
      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.875rem' }}>{message}</div>
    </div>
  );
}

// ── LoadingSpinner ───────────────────────────────────────────
export function LoadingSpinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px solid var(--border-subtle)`,
      borderTopColor: 'var(--accent)',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}

// ── SuccessCheck ─────────────────────────────────────────────
export function SuccessCheck({ size = 18 }: { size?: number }) {
  return <CheckCircle2 size={size} color="var(--resolved)" />;
}

// ── SectionHeader ────────────────────────────────────────────
export function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h2>
        {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{subtitle}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>{actions}</div>}
    </div>
  );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider() { return <hr className="divider" />; }

// ── Textarea ─────────────────────────────────────────────────
export function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="input"
      style={{ resize: 'vertical', minHeight: 80, fontFamily: 'inherit', ...(props.style ?? {}) }}
    />
  );
}
