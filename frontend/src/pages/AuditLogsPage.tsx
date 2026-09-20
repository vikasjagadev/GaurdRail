// ============================================================
// GuardRAIL – Audit Logs Page
// ============================================================
import { useState, useMemo } from 'react';
import { Search, Download, Filter, Database } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { SectionHeader } from '../components/ui';
import { formatTimestamp } from '../utils';

export default function AuditLogsPage() {
  const { auditEvents } = useAppStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterResult, setFilterResult] = useState('');

  const filtered = useMemo(() => auditEvents.filter(e => {
    if (filterType && e.actorType !== filterType) return false;
    if (filterResult && e.result !== filterResult) return false;
    if (search) {
      const q = search.toLowerCase();
      return e.action.toLowerCase().includes(q) || e.actor.toLowerCase().includes(q) || (e.incidentId ?? '').toLowerCase().includes(q);
    }
    return true;
  }), [auditEvents, search, filterType, filterResult]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1400 }} className="animate-fade-in">
      <SectionHeader
        title="Audit Logs"
        subtitle="Immutable record of all system actions"
        actions={
          <button className="btn btn-ghost btn-sm"><Download size={14} /> Export Report</button>
        }
      />

      {/* Info banner */}
      <div style={{ padding: '12px 16px', background: 'var(--accent-dim)', border: '1px solid var(--accent-border)', borderRadius: 10, fontSize: '0.82rem', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Database size={14} />
        All events are stored immutably in DynamoDB with CloudWatch replication. Deletion is not permitted.
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Filter size={15} color="var(--text-muted)" />
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search events…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ flex: '0 0 160px' }} value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Actor Types</option>
          <option value="human">Human</option>
          <option value="ai">AI</option>
          <option value="system">System</option>
        </select>
        <select className="select" style={{ flex: '0 0 140px' }} value={filterResult} onChange={e => setFilterResult(e.target.value)}>
          <option value="">All Results</option>
          <option value="success">Success</option>
          <option value="failure">Failure</option>
          <option value="pending">Pending</option>
        </select>
        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{filtered.length} events</div>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Event ID</th>
              <th>Incident</th>
              <th>Action</th>
              <th>Actor</th>
              <th>Actor Type</th>
              <th>Result</th>
              <th>Resource</th>
              <th>Correlation ID</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(evt => (
              <tr key={evt.eventId}>
                <td style={{ whiteSpace: 'nowrap', fontSize: '0.78rem' }}>{formatTimestamp(evt.timestamp)}</td>
                <td><code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{evt.eventId}</code></td>
                <td><code style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>{evt.incidentId ?? '—'}</code></td>
                <td><code style={{ fontSize: '0.78rem', color: 'var(--purple)' }}>{evt.action}</code></td>
                <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.actor}
                </td>
                <td>
                  <span className={`badge ${evt.actorType === 'human' ? 'badge-accent' : evt.actorType === 'ai' ? 'badge-purple' : 'badge-low'}`}>
                    {evt.actorType}
                  </span>
                </td>
                <td>
                  <span className={`badge ${evt.result === 'success' ? 'badge-resolved' : evt.result === 'failure' ? 'badge-critical' : 'badge-medium'}`}>
                    {evt.result}
                  </span>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {evt.affectedResource ?? '—'}
                </td>
                <td><code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{evt.correlationId}</code></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
