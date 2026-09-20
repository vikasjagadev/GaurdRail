// ============================================================
// GuardRAIL – Main Application Routes
// ============================================================
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';

import OverviewPage from './pages/OverviewPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import RepositoriesPage from './pages/RepositoriesPage';
import RemediationQueuePage from './pages/RemediationQueuePage';
import PullRequestsPage from './pages/PullRequestsPage';
import ApprovalsPage from './pages/ApprovalsPage';
import AuditLogsPage from './pages/AuditLogsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import SecurityPoliciesPage from './pages/SecurityPoliciesPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/repositories" element={<RepositoriesPage />} />
        <Route path="/remediation" element={<RemediationQueuePage />} />
        <Route path="/pull-requests" element={<PullRequestsPage />} />
        <Route path="/approvals" element={<ApprovalsPage />} />
        <Route path="/audit" element={<AuditLogsPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/policies" element={<SecurityPoliciesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
