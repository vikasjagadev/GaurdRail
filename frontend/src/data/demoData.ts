// ============================================================
// GuardRAIL – Realistic Demo Data
// ============================================================
import type {
  Incident, Remediation, QuarantineAction, Approval,
  AuditEvent, Repository, Integration, DashboardStats, PullRequest
} from '../types';

// ── Incidents ────────────────────────────────────────────────
export const DEMO_INCIDENTS: Incident[] = [
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
    assignedReviewer: 'sarah.chen@acme.corp',
    affectedResource: 'arn:aws:iam::123456789012:policy/DataPipelinePolicy',
  },
  {
    incidentId: 'GR-2024-004',
    title: 'RDS Database Publicly Accessible',
    category: 'public_database',
    severity: 'high',
    repository: 'acme-corp/infrastructure',
    branch: 'staging',
    commitSha: 'd5f3c8e',
    filePath: 'terraform/rds/database.tf',
    lineNumber: 21,
    maskedEvidence: 'publicly_accessible = true',
    riskDescription: 'A production RDS instance is configured to be publicly accessible, exposing the database endpoint to the internet.',
    status: 'generating_fix',
    detectedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    assignedReviewer: 'mike.torres@acme.corp',
    affectedResource: 'arn:aws:rds:us-east-1:123456789012:db:prod-postgres',
  },
  {
    incidentId: 'GR-2024-005',
    title: 'S3 Bucket Encryption Disabled',
    category: 'missing_encryption',
    severity: 'medium',
    repository: 'acme-corp/data-platform',
    branch: 'main',
    commitSha: 'e8b6d1f',
    filePath: 'infrastructure/storage.tf',
    lineNumber: 45,
    maskedEvidence: '# server_side_encryption_configuration not set',
    riskDescription: 'An S3 bucket storing sensitive analytics data does not have server-side encryption enabled, leaving data at rest unprotected.',
    status: 'resolved',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    assignedReviewer: 'sarah.chen@acme.corp',
    affectedResource: 'arn:aws:s3:::acme-analytics-raw-data',
  },
  {
    incidentId: 'GR-2024-006',
    title: 'Database Password in .env File',
    category: 'hardcoded_credential',
    severity: 'high',
    repository: 'acme-corp/backend-api',
    branch: 'develop',
    commitSha: 'f1c4a7d',
    filePath: '.env.staging',
    lineNumber: 12,
    maskedEvidence: 'DB_PASSWORD=*************',
    riskDescription: 'A production database password has been committed in a plaintext .env file. This credential must be rotated immediately.',
    status: 'detected',
    detectedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    affectedResource: 'acme-prod-postgres.cluster-xyz.us-east-1.rds.amazonaws.com',
  },
];

// ── Remediations ─────────────────────────────────────────────
export const DEMO_REMEDIATIONS: Remediation[] = [
  {
    remediationId: 'REM-001',
    incidentId: 'GR-2024-001',
    summary: 'S3 bucket has public read ACL enabled, exposing all objects to the internet.',
    aiExplanation: 'The Terraform configuration sets `acl = "public-read"` on the S3 bucket, which grants read access to any anonymous user on the internet. This violates data security best practices and AWS security guidelines. The fix removes public ACL and enables Block Public Access at both the bucket and account level.',
    riskDetail: 'Anyone on the internet can enumerate and download all objects stored in this bucket without authentication. If sensitive data (PII, credentials, backups) is stored here, this constitutes a data breach.',
    recommendedAction: 'Enable S3 Block Public Access and remove the public-read ACL immediately.',
    originalCode: `resource "aws_s3_bucket" "data_bucket" {
  bucket = "acme-prod-data-bucket"
  acl    = "public-read"

  tags = {
    Name        = "acme-prod-data-bucket"
    Environment = "production"
  }
}`,
    patchedCode: `resource "aws_s3_bucket" "data_bucket" {
  bucket = "acme-prod-data-bucket"

  tags = {
    Name        = "acme-prod-data-bucket"
    Environment = "production"
  }
}

resource "aws_s3_bucket_acl" "data_bucket_acl" {
  bucket = aws_s3_bucket.data_bucket.id
  acl    = "private"
}

resource "aws_s3_bucket_public_access_block" "data_bucket_block" {
  bucket = aws_s3_bucket.data_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "data_bucket_sse" {
  bucket = aws_s3_bucket.data_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "aws:kms"
    }
    bucket_key_enabled = true
  }
}`,
    validationCommands: ['terraform fmt -check', 'terraform validate', 'checkov -f main.tf', 'gitleaks detect --source .'],
    validationResults: [
      { check: 'terraform fmt', status: 'pass', message: 'File is properly formatted', duration: 340 },
      { check: 'terraform validate', status: 'pass', message: 'Configuration is valid', duration: 1240 },
      { check: 'checkov scan', status: 'pass', message: '0 failed checks, 8 passed checks', duration: 3200 },
      { check: 'gitleaks scan', status: 'pass', message: 'No secrets detected in patch', duration: 890 },
    ],
    pullRequestUrl: 'https://github.com/acme-corp/infrastructure/pull/147',
    pullRequestNumber: 147,
    confidence: 0.97,
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
];

// ── Quarantine Actions ───────────────────────────────────────
export const DEMO_QUARANTINE_ACTIONS: QuarantineAction[] = [
  {
    actionId: 'QA-001',
    incidentId: 'GR-2024-001',
    resourceArn: 'arn:aws:s3:::acme-prod-data-bucket',
    actionType: 'block_s3_public_access',
    previousState: '{"BlockPublicAcls":false,"IgnorePublicAcls":false,"BlockPublicPolicy":false,"RestrictPublicBuckets":false}',
    newState: '{"BlockPublicAcls":true,"IgnorePublicAcls":true,"BlockPublicPolicy":true,"RestrictPublicBuckets":true}',
    reversible: true,
    rollbackStatus: 'not_started',
    rollbackInstructions: 'Run: aws s3api delete-public-access-block --bucket acme-prod-data-bucket',
    executedAt: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    iamRole: 'arn:aws:iam::123456789012:role/guardrail-quarantine-role',
    reason: 'Critical: S3 bucket publicly accessible. Immediate containment required.',
  },
  {
    actionId: 'QA-002',
    incidentId: 'GR-2024-002',
    resourceArn: 'arn:aws:iam::123456789012:user/dev-ci-user',
    actionType: 'disable_access_key',
    previousState: '{"Status":"Active","AccessKeyId":"AKIA************4XYZ"}',
    newState: '{"Status":"Inactive","AccessKeyId":"AKIA************4XYZ"}',
    reversible: true,
    rollbackStatus: 'not_started',
    rollbackInstructions: 'Run: aws iam update-access-key --access-key-id AKIA...4XYZ --status Active --user-name dev-ci-user',
    executedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    iamRole: 'arn:aws:iam::123456789012:role/guardrail-quarantine-role',
    reason: 'Critical: AWS access key committed to public repository. Key disabled immediately.',
  },
];

// ── Approvals ────────────────────────────────────────────────
export const DEMO_APPROVALS: Approval[] = [
  {
    approvalId: 'APR-001',
    incidentId: 'GR-2024-005',
    reviewerId: 'sarah.chen',
    reviewerName: 'Sarah Chen',
    decision: 'approved',
    reason: 'Fix looks correct. Added SSE-KMS encryption. Validation passed all checks.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];

// ── Audit Events ─────────────────────────────────────────────
export const DEMO_AUDIT_EVENTS: AuditEvent[] = [
  { eventId: 'EVT-001', incidentId: 'GR-2024-001', actor: 'guardrail-webhook-receiver', actorType: 'system', action: 'WEBHOOK_RECEIVED', result: 'success', affectedResource: 'acme-corp/infrastructure', timestamp: new Date(Date.now() - 1000 * 60 * 22).toISOString(), correlationId: 'corr-a3f8d2c', sourceIp: '192.30.252.1' },
  { eventId: 'EVT-002', incidentId: 'GR-2024-001', actor: 'guardrail-scanner', actorType: 'system', action: 'VULNERABILITY_DETECTED', result: 'success', affectedResource: 'terraform/s3/main.tf', metadata: { severity: 'critical', category: 'public_s3' }, timestamp: new Date(Date.now() - 1000 * 60 * 21).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-003', incidentId: 'GR-2024-001', actor: 'guardrail-quarantine', actorType: 'system', action: 'QUARANTINE_EXECUTED', result: 'success', affectedResource: 'arn:aws:s3:::acme-prod-data-bucket', metadata: { action: 'block_s3_public_access' }, timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-004', incidentId: 'GR-2024-001', actor: 'amazon-bedrock-claude-3-5', actorType: 'ai', action: 'PATCH_GENERATED', result: 'success', affectedResource: 'terraform/s3/main.tf', metadata: { confidence: 0.97, model: 'claude-3-5-sonnet' }, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-005', incidentId: 'GR-2024-001', actor: 'guardrail-validator', actorType: 'system', action: 'PATCH_VALIDATED', result: 'success', affectedResource: 'terraform/s3/main.tf', metadata: { checks: 4, passed: 4 }, timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-006', incidentId: 'GR-2024-001', actor: 'guardrail-github-integration', actorType: 'system', action: 'PULL_REQUEST_CREATED', result: 'success', affectedResource: 'github.com/acme-corp/infrastructure/pull/147', metadata: { branch: 'guardrail/fix-GR-2024-001', pr: 147 }, timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-007', incidentId: 'GR-2024-001', actor: 'guardrail-slack-integration', actorType: 'system', action: 'SLACK_APPROVAL_SENT', result: 'success', affectedResource: 'slack://channel/security-alerts', timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(), correlationId: 'corr-a3f8d2c' },
  { eventId: 'EVT-008', incidentId: 'GR-2024-002', actor: 'guardrail-scanner', actorType: 'system', action: 'VULNERABILITY_DETECTED', result: 'success', affectedResource: 'config/aws-config.js', metadata: { severity: 'critical', category: 'exposed_secret' }, timestamp: new Date(Date.now() - 1000 * 60 * 95).toISOString(), correlationId: 'corr-b7e1f9a' },
  { eventId: 'EVT-009', incidentId: 'GR-2024-002', actor: 'guardrail-quarantine', actorType: 'system', action: 'ACCESS_KEY_DISABLED', result: 'success', affectedResource: 'arn:aws:iam::123456789012:user/dev-ci-user', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), correlationId: 'corr-b7e1f9a' },
  { eventId: 'EVT-010', incidentId: 'GR-2024-005', actor: 'sarah.chen', actorType: 'human', action: 'PATCH_APPROVED', result: 'success', affectedResource: 'arn:aws:s3:::acme-analytics-raw-data', metadata: { prNumber: 142, reason: 'Fix looks correct' }, timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), correlationId: 'corr-e8b6d1f', sourceIp: '10.0.1.45' },
];

// ── Repositories ─────────────────────────────────────────────
export const DEMO_REPOSITORIES: Repository[] = [
  { repoId: 'repo-001', name: 'infrastructure', fullName: 'acme-corp/infrastructure', organization: 'acme-corp', defaultBranch: 'main', lastScan: new Date(Date.now() - 1000 * 60 * 5).toISOString(), openFindings: 3, criticalFindings: 1, securityScore: 62, webhookStatus: 'active', autoQuarantine: true, requireHumanApproval: true, language: 'HCL', visibility: 'private' },
  { repoId: 'repo-002', name: 'backend-api', fullName: 'acme-corp/backend-api', organization: 'acme-corp', defaultBranch: 'main', lastScan: new Date(Date.now() - 1000 * 60 * 15).toISOString(), openFindings: 2, criticalFindings: 1, securityScore: 71, webhookStatus: 'active', autoQuarantine: true, requireHumanApproval: true, language: 'Node.js', visibility: 'private' },
  { repoId: 'repo-003', name: 'data-platform', fullName: 'acme-corp/data-platform', organization: 'acme-corp', defaultBranch: 'main', lastScan: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), openFindings: 0, criticalFindings: 0, securityScore: 94, webhookStatus: 'active', autoQuarantine: false, requireHumanApproval: true, language: 'Python', visibility: 'private' },
  { repoId: 'repo-004', name: 'frontend-app', fullName: 'acme-corp/frontend-app', organization: 'acme-corp', defaultBranch: 'main', lastScan: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), openFindings: 0, criticalFindings: 0, securityScore: 89, webhookStatus: 'active', autoQuarantine: false, requireHumanApproval: false, language: 'TypeScript', visibility: 'private' },
];

// ── Integrations ─────────────────────────────────────────────
export const DEMO_INTEGRATIONS: Integration[] = [
  { id: 'github', name: 'github', displayName: 'GitHub', description: 'Webhook receiver, branch creation, pull request automation', icon: 'github', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60 * 2).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60 * 5).toISOString(), requestCount: 1847, errorRate: 0.02, configFields: ['webhook_secret', 'app_id', 'private_key'] },
  { id: 'bedrock', name: 'bedrock', displayName: 'Amazon Bedrock', description: 'Claude 3.5 Sonnet for AI-powered secure code generation', icon: 'cpu', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60 * 10).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60 * 10).toISOString(), requestCount: 342, errorRate: 0.01, configFields: ['aws_region', 'model_id', 'max_tokens'] },
  { id: 'iam', name: 'iam', displayName: 'AWS IAM', description: 'Least-privilege roles for Lambda and quarantine execution', icon: 'shield', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60 * 1).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60 * 1).toISOString(), requestCount: 5291, errorRate: 0, configFields: ['role_arn', 'external_id'] },
  { id: 'secrets_manager', name: 'secrets_manager', displayName: 'AWS Secrets Manager', description: 'Secure credential storage and automatic rotation', icon: 'key', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60 * 3).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60 * 3).toISOString(), requestCount: 891, errorRate: 0, configFields: ['secret_arn', 'rotation_lambda'] },
  { id: 'eventbridge', name: 'eventbridge', displayName: 'Amazon EventBridge', description: 'Event routing between Lambda functions and services', icon: 'git-branch', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60).toISOString(), requestCount: 12847, errorRate: 0, configFields: ['bus_name', 'rule_prefix'] },
  { id: 'cloudwatch', name: 'cloudwatch', displayName: 'Amazon CloudWatch', description: 'Centralized logging, metrics, and alerting', icon: 'activity', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 30).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 30).toISOString(), requestCount: 48291, errorRate: 0, configFields: ['log_group', 'metric_namespace'] },
  { id: 'slack', name: 'slack', displayName: 'Slack', description: 'Security alert notifications and human approval workflow', icon: 'message-square', status: 'connected', lastCheck: new Date(Date.now() - 1000 * 60 * 9).toISOString(), lastSuccess: new Date(Date.now() - 1000 * 60 * 9).toISOString(), requestCount: 234, errorRate: 0, configFields: ['bot_token', 'signing_secret', 'approval_channel'] },
];

// ── Pull Requests ────────────────────────────────────────────
export const DEMO_PULL_REQUESTS: PullRequest[] = [
  { prId: 'pr-001', incidentId: 'GR-2024-001', number: 147, title: '[GuardRAIL] Fix: Public S3 bucket - Enable Block Public Access (GR-2024-001)', url: 'https://github.com/acme-corp/infrastructure/pull/147', branch: 'guardrail/fix-GR-2024-001', targetBranch: 'main', repository: 'acme-corp/infrastructure', status: 'open', labels: ['security', 'guardrail-generated', 'critical'], createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), severity: 'critical', validationStatus: 'passed', approvalStatus: 'awaiting' },
  { prId: 'pr-002', incidentId: 'GR-2024-003', number: 143, title: '[GuardRAIL] Fix: IAM wildcard policy - Apply least privilege (GR-2024-003)', url: 'https://github.com/acme-corp/infrastructure/pull/143', branch: 'guardrail/fix-GR-2024-003', targetBranch: 'main', repository: 'acme-corp/infrastructure', status: 'open', labels: ['security', 'guardrail-generated', 'high'], createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), severity: 'high', validationStatus: 'passed', approvalStatus: 'awaiting' },
  { prId: 'pr-003', incidentId: 'GR-2024-005', number: 142, title: '[GuardRAIL] Fix: Enable SSE-KMS encryption on analytics bucket (GR-2024-005)', url: 'https://github.com/acme-corp/data-platform/pull/142', branch: 'guardrail/fix-GR-2024-005', targetBranch: 'main', repository: 'acme-corp/data-platform', status: 'merged', labels: ['security', 'guardrail-generated', 'medium'], createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(), severity: 'medium', validationStatus: 'passed', approvalStatus: 'approved' },
];

// ── Dashboard Stats ──────────────────────────────────────────
export const DEMO_STATS: DashboardStats = {
  totalFindings: 6,
  criticalVulnerabilities: 2,
  resourcesQuarantined: 2,
  aiPatchesGenerated: 3,
  prAwaitingApproval: 2,
  meanRemediationTime: '18m 42s',
  resolvedIncidents: 1,
  connectedRepositories: 4,
};

// ── Chart data ───────────────────────────────────────────────
export const SEVERITY_CHART_DATA = [
  { name: 'Critical', value: 2, fill: '#ef4444' },
  { name: 'High',     value: 3, fill: '#f97316' },
  { name: 'Medium',   value: 1, fill: '#eab308' },
  { name: 'Low',      value: 0, fill: '#3b82f6' },
];

export const TIMELINE_CHART_DATA = [
  { date: 'Sep 13', detected: 2, resolved: 2 },
  { date: 'Sep 14', detected: 1, resolved: 1 },
  { date: 'Sep 15', detected: 4, resolved: 3 },
  { date: 'Sep 16', detected: 0, resolved: 0 },
  { date: 'Sep 17', detected: 3, resolved: 2 },
  { date: 'Sep 18', detected: 2, resolved: 2 },
  { date: 'Sep 19', detected: 6, resolved: 1 },
];

export const CATEGORY_CHART_DATA = [
  { name: 'Exposed Secrets', count: 2, fill: '#ef4444' },
  { name: 'Public S3',       count: 1, fill: '#f97316' },
  { name: 'IAM Misconfig',   count: 1, fill: '#8b5cf6' },
  { name: 'Public DB',       count: 1, fill: '#06b6d4' },
  { name: 'No Encryption',   count: 1, fill: '#eab308' },
];

export const REMEDIATION_TIME_DATA = [
  { date: 'Sep 13', detect: 3.2,  remediate: 22.4 },
  { date: 'Sep 14', detect: 2.8,  remediate: 18.1 },
  { date: 'Sep 15', detect: 4.1,  remediate: 31.5 },
  { date: 'Sep 16', detect: 1.5,  remediate: 12.0 },
  { date: 'Sep 17', detect: 2.9,  remediate: 19.8 },
  { date: 'Sep 18', detect: 2.1,  remediate: 15.3 },
  { date: 'Sep 19', detect: 1.8,  remediate: 18.7 },
];

// ── Demo Workflow Steps ──────────────────────────────────────
export const DEMO_WORKFLOW_STEPS = [
  { step: 1,  title: 'GitHub Push Received',       description: 'Developer pushes insecure Terraform file to main branch', icon: 'git-commit',    delay: 800  },
  { step: 2,  title: 'Webhook Validated',           description: 'HMAC-SHA256 signature verified. Processing push event.', icon: 'shield-check',  delay: 600  },
  { step: 3,  title: 'File Scanner Running',        description: 'Scanning terraform/s3/main.tf for misconfigurations…',   icon: 'scan',          delay: 1400 },
  { step: 4,  title: 'Vulnerability Detected',      description: 'CRITICAL: S3 bucket acl="public-read" on line 14',      icon: 'alert-triangle', delay: 700 },
  { step: 5,  title: 'Risk Classified',             description: 'Severity: CRITICAL. Category: Public S3. Auto-quarantine triggered.', icon: 'zap', delay: 600 },
  { step: 6,  title: 'S3 Quarantine Executed',      description: 'Block Public Access enabled on arn:aws:s3:::acme-prod-data-bucket', icon: 'lock', delay: 1000 },
  { step: 7,  title: 'Bedrock Agent Invoked',       description: 'Claude 3.5 Sonnet generating secure Terraform patch…',  icon: 'cpu',           delay: 2200 },
  { step: 8,  title: 'Secure Patch Generated',      description: 'Added Block Public Access + private ACL + SSE-KMS. Confidence: 97%', icon: 'code-2', delay: 800 },
  { step: 9,  title: 'Patch Validation Running',    description: 'terraform fmt ✓  terraform validate ✓  checkov ✓  gitleaks ✓', icon: 'check-circle', delay: 1800 },
  { step: 10, title: 'GitHub PR Created',           description: 'guardrail/fix-GR-2024-001 → main. PR #147 opened with security labels.', icon: 'git-pull-request', delay: 900 },
  { step: 11, title: 'Slack Approval Sent',         description: 'Security alert posted to #security-alerts. Awaiting reviewer.', icon: 'message-square', delay: 700 },
  { step: 12, title: 'Audit Trail Recorded',        description: 'All 7 actions logged to CloudWatch + DynamoDB with correlation ID.', icon: 'database', delay: 500 },
];
