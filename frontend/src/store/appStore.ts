// ============================================================
// GuardRAIL – Global App Store (Zustand)
// ============================================================
import { create } from 'zustand';
import type { Incident, AuditEvent, Approval, DemoState } from '../types';
import {
  DEMO_INCIDENTS, DEMO_AUDIT_EVENTS, DEMO_APPROVALS, DEMO_WORKFLOW_STEPS
} from '../data/demoData';

interface AppState {
  // Mode
  isDemo: boolean;

  // Data
  incidents: Incident[];
  auditEvents: AuditEvent[];
  approvals: Approval[];

  // Demo
  demo: DemoState;
  demoStepsCompleted: number[];
  demoLogs: string[];

  // UI
  sidebarCollapsed: boolean;
  selectedIncidentId: string | null;
  notifications: Notification[];

  // Actions
  toggleSidebar: () => void;
  setSelectedIncident: (id: string | null) => void;
  updateIncidentStatus: (id: string, status: Incident['status']) => void;
  addAuditEvent: (event: AuditEvent) => void;
  addApproval: (approval: Approval) => void;
  approveIncident: (incidentId: string, reviewerId: string, reviewerName: string, reason: string) => void;
  rejectIncident: (incidentId: string, reviewerId: string, reviewerName: string, reason: string) => void;
  startDemoWorkflow: () => void;
  stopDemoWorkflow: () => void;
  advanceDemoStep: (step: number) => void;
  addDemoLog: (msg: string) => void;
  resetDemo: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  isDemo: true,

  incidents: DEMO_INCIDENTS,
  auditEvents: DEMO_AUDIT_EVENTS,
  approvals: DEMO_APPROVALS,

  demo: {
    isRunning: false,
    currentStep: 0,
    totalSteps: DEMO_WORKFLOW_STEPS.length,
    isDemo: true,
    activeIncidentId: 'GR-2024-001',
  },
  demoStepsCompleted: [],
  demoLogs: [],

  sidebarCollapsed: false,
  selectedIncidentId: null,
  notifications: [],

  toggleSidebar: () =>
    set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setSelectedIncident: (id) =>
    set({ selectedIncidentId: id }),

  updateIncidentStatus: (id, status) =>
    set(s => ({
      incidents: s.incidents.map(inc =>
        inc.incidentId === id
          ? { ...inc, status, updatedAt: new Date().toISOString() }
          : inc
      ),
    })),

  addAuditEvent: (event) =>
    set(s => ({ auditEvents: [event, ...s.auditEvents] })),

  addApproval: (approval) =>
    set(s => ({ approvals: [approval, ...s.approvals] })),

  approveIncident: (incidentId, reviewerId, reviewerName, reason) => {
    const { updateIncidentStatus, addAuditEvent, addApproval } = get();
    const approval: Approval = {
      approvalId: `APR-${Date.now()}`,
      incidentId,
      reviewerId,
      reviewerName,
      decision: 'approved',
      reason,
      timestamp: new Date().toISOString(),
    };
    addApproval(approval);
    updateIncidentStatus(incidentId, 'resolved');
    addAuditEvent({
      eventId: `EVT-${Date.now()}`,
      incidentId,
      actor: reviewerName,
      actorType: 'human',
      action: 'PATCH_APPROVED',
      result: 'success',
      metadata: { reason },
      timestamp: new Date().toISOString(),
      correlationId: `corr-${incidentId}`,
      sourceIp: '10.0.1.42',
    });
  },

  rejectIncident: (incidentId, reviewerId, reviewerName, reason) => {
    const { updateIncidentStatus, addAuditEvent, addApproval } = get();
    const approval: Approval = {
      approvalId: `APR-${Date.now()}`,
      incidentId,
      reviewerId,
      reviewerName,
      decision: 'rejected',
      reason,
      timestamp: new Date().toISOString(),
    };
    addApproval(approval);
    updateIncidentStatus(incidentId, 'rejected');
    addAuditEvent({
      eventId: `EVT-${Date.now()}`,
      incidentId,
      actor: reviewerName,
      actorType: 'human',
      action: 'PATCH_REJECTED',
      result: 'success',
      metadata: { reason },
      timestamp: new Date().toISOString(),
      correlationId: `corr-${incidentId}`,
      sourceIp: '10.0.1.42',
    });
  },

  startDemoWorkflow: () =>
    set(s => ({
      demo: { ...s.demo, isRunning: true, currentStep: 0 },
      demoStepsCompleted: [],
      demoLogs: [],
    })),

  stopDemoWorkflow: () =>
    set(s => ({ demo: { ...s.demo, isRunning: false } })),

  advanceDemoStep: (step) =>
    set(s => ({
      demo: { ...s.demo, currentStep: step },
      demoStepsCompleted: [...s.demoStepsCompleted, step],
    })),

  addDemoLog: (msg) =>
    set(s => ({ demoLogs: [...s.demoLogs, `[${new Date().toLocaleTimeString()}] ${msg}`] })),

  resetDemo: () =>
    set(s => ({
      demo: { ...s.demo, isRunning: false, currentStep: 0 },
      demoStepsCompleted: [],
      demoLogs: [],
      incidents: DEMO_INCIDENTS,
      auditEvents: DEMO_AUDIT_EVENTS,
    })),
}));
