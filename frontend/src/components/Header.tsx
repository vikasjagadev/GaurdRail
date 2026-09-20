// ============================================================
// GuardRAIL – Header
// ============================================================
import { useState } from 'react';
import { Search, Bell, ChevronDown, Menu, Zap, Wifi, WifiOff, User } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { useLocation } from 'react-router-dom';

const PAGE_TITLES: Record<string, string> = {
  '/':              'Overview',
  '/incidents':     'Live Incidents',
  '/repositories':  'Repositories',
  '/remediation':   'Remediation Queue',
  '/pull-requests': 'Pull Requests',
  '/approvals':     'Approval Centre',
  '/audit':         'Audit Logs',
  '/integrations':  'Integrations',
  '/policies':      'Security Policies',
  '/settings':      'Settings',
};

interface HeaderProps {
  onMobileMenuOpen: () => void;
}

export function Header({ onMobileMenuOpen }: HeaderProps) {
  const { isDemo } = useAppStore();
  const location = useLocation();
  const [env, setEnv] = useState('production');
  const [notifOpen, setNotifOpen] = useState(false);

  const title = PAGE_TITLES[location.pathname] ??
    (location.pathname.startsWith('/incidents/') ? 'Incident Details' : 'GuardRAIL');

  return (
    <header style={{
      height: 64,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '0 20px',
      flexShrink: 0,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>
      {/* Mobile menu */}
      <button
        onClick={onMobileMenuOpen}
        style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'none', padding: 4 }}
        className="lg:hidden !flex"
      >
        <Menu size={22} />
      </button>

      {/* Page title */}
      <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginRight: 8 }} className="hidden sm:block">
        {title}
      </div>

      {/* Search */}
      <div style={{ flex: 1, maxWidth: 400, position: 'relative' }} className="hidden md:block">
        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="input"
          style={{ paddingLeft: 34, paddingTop: 7, paddingBottom: 7 }}
          placeholder="Search incidents, repos, findings…"
        />
      </div>

      <div style={{ flex: 1 }} />

      {/* Environment selector */}
      <div style={{ position: 'relative' }} className="hidden sm:block">
        <select
          value={env}
          onChange={e => setEnv(e.target.value)}
          className="select"
          style={{ paddingTop: 6, paddingBottom: 6, paddingRight: 28, fontSize: '0.82rem' }}
        >
          <option value="production">Production</option>
          <option value="staging">Staging</option>
          <option value="development">Development</option>
        </select>
      </div>

      {/* Demo / Live badge */}
      <div className="demo-banner">
        {isDemo ? (
          <><WifiOff size={13} /> DEMO MODE</>
        ) : (
          <><Wifi size={13} style={{ color: 'var(--resolved)' }} /> LIVE</>
        )}
      </div>

      {/* System status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--resolved)', fontSize: '0.8rem', fontWeight: 500 }} className="hidden md:flex">
        <div className="status-dot status-dot-green" />
        Operational
      </div>

      {/* Notifications */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen(o => !o)}
          style={{
            background: 'none', border: '1px solid var(--border-default)',
            borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
            color: 'var(--text-secondary)', position: 'relative',
            display: 'flex', alignItems: 'center',
          }}
          className="hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)] transition-colors"
        >
          <Bell size={18} />
          <span style={{
            position: 'absolute', top: 3, right: 3,
            width: 8, height: 8, borderRadius: '50%',
            background: 'var(--critical)',
            boxShadow: '0 0 6px var(--critical)',
          }} />
        </button>
        {notifOpen && (
          <div style={{
            position: 'absolute', right: 0, top: 44,
            width: 320, background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: 12, padding: 8, zIndex: 100,
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          }} className="animate-slide-in">
            <div style={{ padding: '8px 12px 12px', fontSize: '0.85rem', fontWeight: 600, borderBottom: '1px solid var(--border-subtle)', marginBottom: 4, color: 'var(--text-primary)' }}>
              Notifications
            </div>
            {[
              { text: 'CRITICAL: Public S3 bucket detected in acme-corp/infrastructure', time: '22m ago', color: 'var(--critical)' },
              { text: 'Slack approval requested for GR-2024-001', time: '9m ago', color: 'var(--accent)' },
              { text: 'PR #147 created for GR-2024-001 fix', time: '10m ago', color: 'var(--resolved)' },
            ].map((n, i) => (
              <div key={i} style={{ padding: '10px 12px', borderRadius: 8, marginBottom: 2 }} className="hover:bg-[var(--bg-elevated)] cursor-pointer transition-colors">
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  <span style={{ color: n.color, fontWeight: 600 }}>● </span>{n.text}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <button style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
        borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
        color: 'var(--text-secondary)',
      }} className="hover:border-[var(--border-focus)] transition-colors">
        <div style={{
          width: 26, height: 26, borderRadius: '50%',
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <User size={14} color="#fff" />
        </div>
        <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary)' }} className="hidden sm:inline">
          Sarah Chen
        </span>
        <ChevronDown size={14} />
      </button>

      {/* Zap logo on mobile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} className="lg:hidden">
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap size={14} color="#fff" />
        </div>
      </div>
    </header>
  );
}
