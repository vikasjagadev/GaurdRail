// ============================================================
// GuardRAIL – Live Incidents Page
// ============================================================
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SeverityBadge, StatusBadge, SectionHeader } from '../components/ui';
import { formatRelativeTime, categoryLabel } from '../utils';
import type { Severity, IncidentStatus, VulnerabilityCategory } from '../types';

const SEVERITIES: Severity[] = ['critical', 'high', 'medium', 'low'];
const STATUSES: IncidentStatus[] = [
  'detected', 'analysing', 'quarantined', 'generating_fix', 'validating',
  'validation_failed', 'pr_created', 'awaiting_approval', 'approved', 'rejected', 'resolved', 'manual_review'
];
const CATEGORIES: VulnerabilityCategory[] = [
  'exposed_secret', 'public_s3', 'iam_misconfiguration', 'public_database',
  'missing_encryption', 'network_exposure', 'hardcoded_credential'
];

export default function IncidentsPage() {
  const { incidents } = useAppStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortKey, setSortKey] = useState<'detectedAt' | 'severity' | 'status'>('detectedAt');

  const filtered = useMemo(() => {
    const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    return incidents
      .filter(inc => {
        if (filterSeverity && inc.severity !== filterSeverity) return false;
        if (filterStatus && inc.status !== filterStatus) return false;
        if (filterCategory && inc.category !== filterCategory) return false;
        if (search) {
          const q = search.toLowerCase();
          return (
            inc.incidentId.toLowerCase().includes(q) ||
            inc.title.toLowerCase().includes(q) ||
            inc.repository.toLowerCase().includes(q) ||
            inc.filePath.toLowerCase().includes(q) ||
            (inc.assignedReviewer ?? '').toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortKey === 'severity') return (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9);
        if (sortKey === 'status') return a.status.localeCompare(b.status);
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });
  }, [incidents, search, filterSeverity, filterStatus, filterCategory, sortKey]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400 }} className="animate-fade-in">
      <SectionHeader
        title="Live Incidents"
        subtitle={`${filtered.length} of ${incidents.length} incidents`}
        actions={
          <button className="btn btn-ghost btn-sm">
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* Filters */}
      <div className="card" style={{ padding: 16, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={15} color="var(--text-muted)" />
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search incidents…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ flex: '0 0 140px' }} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
          <option value="">All Severities</option>
          {SEVERITIES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select className="select" style={{ flex: '0 0 170px' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="select" style={{ flex: '0 0 170px' }} value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{categoryLabel(c)}</option>)}
        </select>
        <select className="select" style={{ flex: '0 0 150px' }} value={sortKey} onChange={e => setSortKey(e.target.value as typeof sortKey)}>
          <option value="detectedAt">Sort: Newest</option>
          <option value="severity">Sort: Severity</option>
          <option value="status">Sort: Status</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Finding ID</th>
              <th>Severity</th>
              <th>Vulnerability</th>
              <th>Repository</th>
              <th>Affected Resource</th>
              <th>Detected</th>
              <th>Status</th>
              <th>Reviewer</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(inc => (
              <tr key={inc.incidentId} style={{ cursor: 'pointer' }} onClick={() => navigate(`/incidents/${inc.incidentId}`)}>
                <td>
                  <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{inc.incidentId}</span>
                </td>
                <td><SeverityBadge severity={inc.severity} /></td>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{inc.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{categoryLabel(inc.category)}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{inc.repository}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>
                    <span className="mono">{inc.filePath}:{inc.lineNumber}</span>
                  </div>
                </td>
                <td>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all' }}>
                    {inc.affectedResource ? inc.affectedResource.slice(-40) : '—'}
                  </div>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '0.82rem' }}>{formatRelativeTime(inc.detectedAt)}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(inc.detectedAt).toLocaleDateString()}
                  </div>
                </td>
                <td><StatusBadge status={inc.status} /></td>
                <td>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {inc.assignedReviewer ? inc.assignedReviewer.split('@')[0] : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/incidents/${inc.incidentId}`)}
                      title="View details"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      title="Open in GitHub"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  No incidents match the current filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
