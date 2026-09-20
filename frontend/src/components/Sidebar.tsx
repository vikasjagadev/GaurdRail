// ============================================================
// GuardRAIL – Sidebar Navigation
// ============================================================
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, AlertTriangle, GitBranch, Layers, GitPullRequest,
  CheckSquare, FileText, Plug, Shield, Settings, ChevronLeft, ChevronRight,
  Zap, X
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import clsx from 'clsx';

const NAV_ITEMS = [
  { to: '/',              icon: LayoutDashboard, label: 'Overview',          badge: null },
  { to: '/incidents',     icon: AlertTriangle,   label: 'Live Incidents',     badge: 5 },
  { to: '/repositories',  icon: GitBranch,       label: 'Repositories',       badge: null },
  { to: '/remediation',   icon: Layers,          label: 'Remediation Queue',  badge: 2 },
  { to: '/pull-requests', icon: GitPullRequest,  label: 'Pull Requests',      badge: 2 },
  { to: '/approvals',     icon: CheckSquare,     label: 'Approval Centre',    badge: 2 },
  { to: '/audit',         icon: FileText,        label: 'Audit Logs',         badge: null },
  { to: '/integrations',  icon: Plug,            label: 'Integrations',       badge: null },
  { to: '/policies',      icon: Shield,          label: 'Security Policies',  badge: null },
  { to: '/settings',      icon: Settings,        label: 'Settings',           badge: null },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        style={{
          width: sidebarCollapsed ? 64 : 240,
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          transition: 'width 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          zIndex: 50,
        }}
        className={clsx(
          'fixed inset-y-0 left-0 flex flex-col lg:static',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          'transition-transform lg:transition-none'
        )}
      >
        {/* Logo */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 64,
        }}>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Zap size={16} color="#fff" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Guard<span style={{ color: 'var(--accent)' }}>RAIL</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.08em' }}>
                  ZERO-TRUST ENGINE
                </div>
              </div>
            </div>
          )}
          {sidebarCollapsed && (
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto',
            }}>
              <Zap size={16} color="#fff" />
            </div>
          )}
          {/* Close on mobile */}
          {mobileOpen && (
            <button onClick={onMobileClose} style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }} className="lg:hidden">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: sidebarCollapsed ? '10px 16px' : '9px 12px 9px 16px',
                margin: '1px 6px',
                borderRadius: 8,
                textDecoration: 'none',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.875rem',
                transition: 'all 0.12s',
                justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
                position: 'relative',
              })}
              className={({ isActive }) =>
                clsx(!isActive && 'hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]')
              }
              title={sidebarCollapsed ? label : undefined}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  {!sidebarCollapsed && (
                    <>
                      <span style={{ flex: 1 }}>{label}</span>
                      {badge !== null && (
                        <span style={{
                          background: isActive ? 'var(--accent)' : 'var(--bg-elevated)',
                          color: isActive ? '#070b14' : 'var(--text-muted)',
                          fontSize: '0.7rem', fontWeight: 700,
                          padding: '1px 7px', borderRadius: 99, minWidth: 20, textAlign: 'center',
                        }}>
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          style={{
            margin: '8px',
            padding: '8px',
            borderRadius: 8,
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          className="hover:text-[var(--text-primary)] hover:border-[var(--border-default)] hidden lg:flex"
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </aside>
    </>
  );
}
