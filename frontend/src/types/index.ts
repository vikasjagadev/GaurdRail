// ============================================================
// GuardRAIL – Core TypeScript Types
// ============================================================

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus =
  | 'detected'
  | 'analysing'
  | 'quarantined'
  | 'generating_fix'
  | 'validating'
  | 'validation_failed'
  | 'pr_created'
  | 'awaiting_approval'
  | 'approved'
  | 'rejected'
  | 'resolved'
  | 'manual_review';

export type VulnerabilityCategory =
  | 'exposed_secret'
  | 'public_s3'
  | 'iam_misconfiguration'
  | 'public_database'
  | 'missing_encryption'
  | 'network_exposure'
  | 'hardcoded_credential';

export type ActorType = 'human' | 'ai' | 'system';

export interface Incident {
  incidentId: string;
  title: string;
  category: VulnerabilityCategory;
  severity: Severity;
  repository: string;
  branch: string;
  commitSha: string;
  filePath: string;
  lineNumber: number;
  maskedEvidence: string;
  riskDescription: string;
  status: IncidentStatus;
  detectedAt: string;
  updatedAt: string;
  assignedReviewer?: string;
  affectedResource?: string;
}

export interface Remediation {
  remediationId: string;
  incidentId: string;
  summary: string;
  aiExplanation: string;
  riskDetail: string;
  recommendedAction: string;
  originalCode: string;
  patchedCode: string;
  validationCommands: string[];
  validationResults: ValidationResult[];
  pullRequestUrl?: string;
  pullRequestNumber?: number;
  confidence: number;
  createdAt: string;
}

export interface ValidationResult {
  check: string;
  status: 'pass' | 'fail' | 'warn' | 'running';
  message: string;
  duration?: number;
}

export interface QuarantineAction {
  actionId: string;
  incidentId: string;
  resourceArn: string;
  actionType: string;
  previousState: string;
  newState: string;
  reversible: boolean;
  rollbackStatus: 'not_started' | 'in_progress' | 'complete' | 'failed';
  rollbackInstructions: string;
  executedAt: string;
  iamRole: string;
  reason: string;
}

export interface Approval {
  approvalId: string;
  incidentId: string;
  reviewerId: string;
  reviewerName: string;
  decision: 'approved' | 'rejected' | 'changes_requested';
  reason?: string;
  timestamp: string;
}

export interface AuditEvent {
  eventId: string;
  incidentId?: string;
  actor: string;
  actorType: ActorType;
  action: string;
  result: 'success' | 'failure' | 'pending';
  affectedResource?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
  correlationId: string;
  sourceIp?: string;
}

export interface Repository {
  repoId: string;
  name: string;
  fullName: string;
  organization: string;
  defaultBranch: string;
  lastScan: string;
  openFindings: number;
  criticalFindings: number;
  securityScore: number;
  webhookStatus: 'active' | 'inactive' | 'error';
  autoQuarantine: boolean;
  requireHumanApproval: boolean;
  language: string;
  visibility: 'public' | 'private';
}

export interface Integration {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error' | 'configuring';
  lastCheck?: string;
  lastSuccess?: string;
  requestCount?: number;
  errorRate?: number;
  configFields: string[];
}

export interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  value: string | number | boolean | string[];
  type: 'select' | 'number' | 'boolean' | 'multiselect' | 'text';
  options?: string[];
  category: string;
  requiresConfirmation: boolean;
}

export interface DashboardStats {
  totalFindings: number;
  criticalVulnerabilities: number;
  resourcesQuarantined: number;
  aiPatchesGenerated: number;
  prAwaitingApproval: number;
  meanRemediationTime: string;
  resolvedIncidents: number;
  connectedRepositories: number;
}

export interface TimelineStep {
  step: number;
  title: string;
  description: string;
  status: 'complete' | 'active' | 'pending' | 'failed';
  timestamp?: string;
  actor?: string;
  actorType?: ActorType;
  metadata?: Record<string, unknown>;
}

export interface DemoState {
  isRunning: boolean;
  currentStep: number;
  totalSteps: number;
  isDemo: boolean;
  activeIncidentId: string | null;
}

export interface PullRequest {
  prId: string;
  incidentId: string;
  number: number;
  title: string;
  url: string;
  branch: string;
  targetBranch: string;
  repository: string;
  status: 'open' | 'merged' | 'closed' | 'draft';
  labels: string[];
  createdAt: string;
  severity: Severity;
  validationStatus: 'passed' | 'failed' | 'pending';
  approvalStatus: 'awaiting' | 'approved' | 'rejected';
}
