// ============================================================
// GuardRAIL – Backend API Mock Server
// ============================================================
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory state for mock operations
let incidents = [
  {
    incidentId: 'GR-2024-001',
    title: 'Publicly Accessible S3 Bucket',
    category: 'public_s3',
    severity: 'critical',
    repository: 'acme-corp/infrastructure',
    branch: 'main',
    commitSha: 'a3f8d2c',
    filePath: 'terraform/s3/main.tf',
    lineNumber: 14,
    maskedEvidence: 'acl = "public-read"',
    riskDescription: 'An S3 bucket is configured with public read access, exposing all stored objects to the internet without authentication.',
    status: 'awaiting_approval',
    detectedAt: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    assignedReviewer: 'sarah.chen@acme.corp',
    affectedResource: 'arn:aws:s3:::acme-prod-data-bucket',
  },
  {
    incidentId: 'GR-2024-002',
    title: 'AWS Access Key Committed to Repository',
    category: 'exposed_secret',
    severity: 'critical',
    repository: 'acme-corp/backend-api',
    branch: 'feature/payment-service',
    commitSha: 'b7e1f9a',
    filePath: 'config/aws-config.js',
    lineNumber: 8,
    maskedEvidence: 'AKIA************4XYZ',
    riskDescription: 'An active AWS access key has been committed to source control. Anyone with repository access can use this key to access AWS resources.',
    status: 'quarantined',
    detectedAt: new Date(Date.now() - 1000 * 60 * 95).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 88).toISOString(),
    assignedReviewer: 'james.wilson@acme.corp',
    affectedResource: 'arn:aws:iam::123456789012:user/dev-ci-user',
  },
  {
    incidentId: 'GR-2024-003',
    title: 'Overly Permissive IAM Policy (Wildcard Action)',
    category: 'iam_misconfiguration',
    severity: 'high',
    repository: 'acme-corp/infrastructure',
    branch: 'main',
    commitSha: 'c2a9e4b',
    filePath: 'terraform/iam/policies.tf',
    lineNumber: 32,
    maskedEvidence: '"Action": "*", "Resource": "*"',
    riskDescription: 'An IAM policy grants all actions on all resources, violating the principle of least privilege and enabling privilege escalation.',
    status: 'pr_created',
    detectedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    assignedReviewer: 'security-team@acme.corp',
    affectedResource: 'arn:aws:iam::123456789012:policy/AppExecutionPolicy',
  }
];

let auditEvents = [
  {
    eventId: 'EVT-001',
    incidentId: 'GR-2024-001',
    actor: 'github-webhook',
    actorType: 'system',
    action: 'VULNERABILITY_DETECTED',
    result: 'success',
    affectedResource: 'arn:aws:s3:::acme-prod-data-bucket',
    timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(),
    correlationId: 'corr-a3f8d2c-001',
  },
  {
    eventId: 'EVT-002',
    incidentId: 'GR-2024-001',
    actor: 'guardrail-quarantine-engine',
    actorType: 'system',
    action: 'QUARANTINE_APPLIED',
    result: 'success',
    affectedResource: 'arn:aws:s3:::acme-prod-data-bucket',
    timestamp: new Date(Date.now() - 1000 * 60 * 21).toISOString(),
    correlationId: 'corr-a3f8d2c-001',
  },
  {
    eventId: 'EVT-003',
    incidentId: 'GR-2024-001',
    actor: 'bedrock-claude-3-5',
    actorType: 'ai',
    action: 'REMEDIATION_GENERATED',
    result: 'success',
    affectedResource: 'arn:aws:s3:::acme-prod-data-bucket',
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    correlationId: 'corr-a3f8d2c-001',
  }
];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', version: '2.4.1', mode: 'demo' });
});

// Incidents API
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.get('/api/incidents/:id', (req, res) => {
  const inc = incidents.find(i => i.incidentId === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  res.json(inc);
});

app.post('/api/incidents/:id/quarantine', (req, res) => {
  const inc = incidents.find(i => i.incidentId === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });

  inc.status = 'quarantined';
  inc.updatedAt = new Date().toISOString();

  const event = {
    eventId: `EVT-${Date.now()}`,
    incidentId: inc.incidentId,
    actor: 'guardrail-operator',
    actorType: 'human',
    action: 'RESOURCE_QUARANTINED',
    result: 'success',
    affectedResource: inc.affectedResource,
    timestamp: new Date().toISOString(),
    correlationId: `corr-${Date.now()}`
  };
  auditEvents.unshift(event);

  res.json({ success: true, incident: inc, auditEvent: event });
});

app.post('/api/incidents/:id/approve', (req, res) => {
  const inc = incidents.find(i => i.incidentId === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });

  const { reviewer = 'security-engineer@acme.corp', reason = 'Approved in console' } = req.body;
  inc.status = 'resolved';
  inc.updatedAt = new Date().toISOString();

  const event = {
    eventId: `EVT-${Date.now()}`,
    incidentId: inc.incidentId,
    actor: reviewer,
    actorType: 'human',
    action: 'PATCH_APPROVED_AND_MERGED',
    result: 'success',
    metadata: { reason },
    affectedResource: inc.affectedResource,
    timestamp: new Date().toISOString(),
    correlationId: `corr-${Date.now()}`
  };
  auditEvents.unshift(event);

  res.json({ success: true, incident: inc, auditEvent: event });
});

app.post('/api/incidents/:id/reject', (req, res) => {
  const inc = incidents.find(i => i.incidentId === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });

  const { reviewer = 'security-engineer@acme.corp', reason = 'Rejected by reviewer' } = req.body;
  inc.status = 'rejected';
  inc.updatedAt = new Date().toISOString();

  const event = {
    eventId: `EVT-${Date.now()}`,
    incidentId: inc.incidentId,
    actor: reviewer,
    actorType: 'human',
    action: 'PATCH_REJECTED',
    result: 'success',
    metadata: { reason },
    affectedResource: inc.affectedResource,
    timestamp: new Date().toISOString(),
    correlationId: `corr-${Date.now()}`
  };
  auditEvents.unshift(event);

  res.json({ success: true, incident: inc, auditEvent: event });
});

// Audit events API
app.get('/api/audit', (req, res) => {
  res.json(auditEvents);
});

// Webhooks
app.post('/api/webhooks/github', (req, res) => {
  console.log('[Webhook] GitHub event received');
  res.json({ status: 'accepted', message: 'GitHub push webhook processed successfully' });
});

app.post('/api/webhooks/slack/interactions', (req, res) => {
  console.log('[Webhook] Slack interaction received');
  res.json({ status: 'ok', message: 'Interaction processed' });
});

app.listen(PORT, () => {
  console.log(`GuardRAIL Mock API Server listening on port ${PORT}`);
});
