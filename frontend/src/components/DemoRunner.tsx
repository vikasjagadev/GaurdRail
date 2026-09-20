// ============================================================
// GuardRAIL – Demo Workflow Runner Component
// ============================================================
import { useEffect, useRef } from 'react';
import {
  Play, Square, RotateCcw, GitCommit, ShieldCheck, ScanLine,
  AlertTriangle, Zap, Lock, Cpu, Code2, CheckCircle2, GitPullRequest,
  MessageSquare, Database, ChevronRight
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { DEMO_WORKFLOW_STEPS } from '../data/demoData';

const ICONS: Record<string, React.ElementType> = {
  'git-commit':       GitCommit,
  'shield-check':     ShieldCheck,
  'scan':             ScanLine,
  'alert-triangle':   AlertTriangle,
  'zap':              Zap,
  'lock':             Lock,
  'cpu':              Cpu,
  'code-2':           Code2,
  'check-circle':     CheckCircle2,
  'git-pull-request': GitPullRequest,
  'message-square':   MessageSquare,
  'database':         Database,
};

export function DemoRunner() {
  const {
    demo, demoStepsCompleted, demoLogs,
    startDemoWorkflow, stopDemoWorkflow, advanceDemoStep, addDemoLog, resetDemo,
    updateIncidentStatus,
  } = useAppStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logsRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [demoLogs]);

  // Run next step
  useEffect(() => {
    if (!demo.isRunning) return;
    const next = demoStepsCompleted.length;
    if (next >= DEMO_WORKFLOW_STEPS.length) {
      stopDemoWorkflow();
      return;
    }
    const step = DEMO_WORKFLOW_STEPS[next];
    timerRef.current = setTimeout(() => {
      advanceDemoStep(step.step);
      addDemoLog(`[STEP ${step.step}/${DEMO_WORKFLOW_STEPS.length}] ${step.title} — ${step.description}`);
      // Update incident status at key steps
      if (step.step === 4)  updateIncidentStatus('GR-2024-001', 'quarantined');
      if (step.step === 7)  updateIncidentStatus('GR-2024-001', 'generating_fix');
      if (step.step === 9)  updateIncidentStatus('GR-2024-001', 'validating');
      if (step.step === 10) updateIncidentStatus('GR-2024-001', 'pr_created');
      if (step.step === 11) updateIncidentStatus('GR-2024-001', 'awaiting_approval');
    }, step.delay);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [demo.isRunning, demoStepsCompleted.length]);

  const isDone = demoStepsCompleted.length === DEMO_WORKFLOW_STEPS.length;

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="demo-banner" style={{ fontSize: '0.7rem' }}>DEMO</span>
            Live Workflow Simulation
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>
            Simulates a complete S3 misconfiguration detection and remediation lifecycle
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!demo.isRunning && !isDone && (
            <button className="btn btn-primary" onClick={startDemoWorkflow} id="simulate-push-btn">
              <Play size={15} /> Simulate Vulnerable Push
            </button>
          )}
          {demo.isRunning && (
            <button className="btn btn-ghost" onClick={stopDemoWorkflow}>
              <Square size={15} /> Stop
            </button>
          )}
          {(isDone || demoStepsCompleted.length > 0) && (
            <button className="btn btn-ghost btn-sm" onClick={resetDemo}>
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {(demo.isRunning || isDone || demoStepsCompleted.length > 0) && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>
            <span>Progress</span>
            <span>{demoStepsCompleted.length}/{DEMO_WORKFLOW_STEPS.length} steps</span>
          </div>
          <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${(demoStepsCompleted.length / DEMO_WORKFLOW_STEPS.length) * 100}%`,
              background: isDone
                ? 'linear-gradient(90deg, #22c55e, #06b6d4)'
                : 'linear-gradient(90deg, #06b6d4, #8b5cf6)',
              borderRadius: 99,
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>
      )}

      {/* Steps grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 20 }}>
        {DEMO_WORKFLOW_STEPS.map(s => {
          const completed = demoStepsCompleted.includes(s.step);
          const active = demo.isRunning && demoStepsCompleted.length === s.step - 1;
          const Icon = ICONS[s.icon] ?? Zap;
          return (
            <div
              key={s.step}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                border: `1px solid ${completed ? 'var(--resolved-border)' : active ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                background: completed ? 'var(--resolved-bg)' : active ? 'var(--accent-dim)' : 'var(--bg-elevated)',
                transition: 'all 0.3s',
                opacity: !demo.isRunning && demoStepsCompleted.length === 0 ? 0.5 : 1,
              }}
              className={active ? 'animate-pulse-glow' : ''}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon size={14} color={completed ? 'var(--resolved)' : active ? 'var(--accent)' : 'var(--text-muted)'} />
                <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  STEP {s.step}
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: completed ? 'var(--resolved)' : active ? 'var(--accent)' : 'var(--text-secondary)', lineHeight: 1.3 }}>
                {s.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Log console */}
      {demoLogs.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8, letterSpacing: '0.05em' }}>
            EXECUTION LOG
          </div>
          <div
            ref={logsRef}
            className="code-block"
            style={{ maxHeight: 180, overflowY: 'auto', fontSize: '0.76rem', lineHeight: 1.6 }}
          >
            {demoLogs.map((log, i) => (
              <div key={i} style={{ color: i === demoLogs.length - 1 ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <span style={{ color: 'var(--text-muted)' }}>&gt; </span>{log}
                {i === demoLogs.length - 1 && demo.isRunning && (
                  <span className="animate-blink" style={{ color: 'var(--accent)' }}>█</span>
                )}
              </div>
            ))}
            {isDone && (
              <div style={{ color: 'var(--resolved)', marginTop: 4, fontWeight: 600 }}>
                <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 6 }} />
                Demo complete! Full lifecycle executed in {DEMO_WORKFLOW_STEPS.reduce((a, s) => a + s.delay, 0) / 1000}s
              </div>
            )}
          </div>
        </div>
      )}

      {/* Idle state */}
      {demoStepsCompleted.length === 0 && !demo.isRunning && (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '0.875rem', marginBottom: 12 }}>
            Click <strong style={{ color: 'var(--accent)' }}>Simulate Vulnerable Push</strong> to watch the complete remediation workflow
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, fontSize: '0.8rem', flexWrap: 'wrap' }}>
            {['GitHub Push', 'Scanner', 'AI Fix', 'Validation', 'PR', 'Slack Approval'].map((s, i, arr) => (
              <span key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: 'var(--bg-elevated)', padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border-subtle)' }}>{s}</span>
                {i < arr.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
