"use client";

import { useEffect, useState } from "react";
import {
  GitBranch,
  Play,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ArrowRight,
  Database,
  BrainCircuit,
  ShieldCheck,
  Send,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { Workflow, WorkflowExecution } from "@/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWf, setSelectedWf] = useState<Workflow | null>(null);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerSuccess, setTriggerSuccess] = useState(false);

  useEffect(() => {
    async function loadWorkflows() {
      try {
        const list = await api.getWorkflows();
        setWorkflows(list);
        if (list.length > 0) {
          setSelectedWf(list[0]);
          const execs = await api.getWorkflowExecutions(list[0].id).catch(() => []);
          setExecutions(execs);
        }
      } catch (err) {
        console.error("Failed to load workflows:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkflows();
  }, []);

  const handleSelectWorkflow = async (wf: Workflow) => {
    setSelectedWf(wf);
    try {
      const execs = await api.getWorkflowExecutions(wf.id).catch(() => []);
      setExecutions(execs);
    } catch {
      setExecutions([]);
    }
  };

  const handleRunWorkflow = async () => {
    if (!selectedWf) return;
    setTriggering(true);
    try {
      if (selectedWf.workflow_type === "dunning") {
        await api.simulateDunning({});
      } else if (selectedWf.workflow_type === "recruitment") {
        await api.simulateRecruitment({});
      } else if (selectedWf.workflow_type === "support") {
        await api.simulateSupport({});
      } else {
        await api.triggerSentinelScan();
      }
      setTriggerSuccess(true);
      setTimeout(() => setTriggerSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <GitBranch className="w-3.5 h-3.5" />
            <span>Autonomous Process Pipelines</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Workflow Studio & Sentinel Monitor</h1>
          <p className="text-xs text-slate-400">Inspect autonomous pipelines, step execution trees, and real-time execution logs.</p>
        </div>

        {selectedWf && (
          <button
            onClick={handleRunWorkflow}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider shadow-glow-brand transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${triggering ? "animate-spin" : ""}`} />
            <span>{triggering ? "Executing Pipeline..." : `Run ${selectedWf.name}`}</span>
          </button>
        )}
      </div>

      {triggerSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Workflow pipeline executed successfully and audit log committed!</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Workflows Catalog (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Active Automated Pipelines</h3>
          {workflows.map((wf) => {
            const isSelected = selectedWf?.id === wf.id;
            const successRate = Math.round((wf.success_runs / Math.max(wf.total_runs, 1)) * 100);
            return (
              <div
                key={wf.id}
                onClick={() => handleSelectWorkflow(wf)}
                className={`glass-card-interactive p-4 cursor-pointer transition-all ${
                  isSelected ? "border-brand-500/80 bg-brand-950/20 shadow-glow-brand" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                    {wf.name}
                  </span>
                  <StatusBadge status={wf.status} />
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {wf.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <span>{wf.total_runs.toLocaleString()} runs ({successRate}%)</span>
                  <span>{wf.cron_expression || "Event Triggered"}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Workflow Interactive Pipeline & Execution Logs (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {selectedWf ? (
            <>
              {/* Interactive Node Graph Pipeline */}
              <div className="glass-panel p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <h3 className="font-display font-bold text-white text-base">Visual Pipeline Architecture</h3>
                  </div>
                  <span className="text-xs text-brand-300 font-mono bg-brand-950 px-2 py-0.5 rounded border border-brand-800/60">
                    Engine: Hybrid AI + Sentinel
                  </span>
                </div>

                {/* Node Pipeline Flow */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                  <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-700 text-center">
                    <Database className="w-5 h-5 text-brand-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-white block">1. Ingest Data</span>
                    <span className="text-[10px] text-slate-400 font-mono">ERP / Webhook</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 mx-auto hidden md:block" />

                  <div className="p-3.5 rounded-xl bg-dark-950 border border-brand-500/60 text-center shadow-glow-brand">
                    <BrainCircuit className="w-5 h-5 text-accent-violet mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-white block">2. AI Reasoning</span>
                    <span className="text-[10px] text-brand-300 font-mono">Multi-Model LLM</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-600 mx-auto hidden md:block" />

                  <div className="p-3.5 rounded-xl bg-dark-950 border border-emerald-600/60 text-center shadow-glow-emerald">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                    <span className="text-[11px] font-bold text-white block">3. Verification</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Hard Guardrails</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60">
                    <span className="text-xs font-bold text-emerald-400 block mb-1">⚡ High Confidence (≥95%)</span>
                    <p className="text-[11px] text-slate-300">
                      Auto-executes action directly to ERP / Email / Jira without delay.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60">
                    <span className="text-xs font-bold text-amber-400 block mb-1">🛡️ Medium Confidence (80-94%)</span>
                    <p className="text-[11px] text-slate-300">
                      Routes interactive Block Kit card to Slack / Manager review triage queue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Execution Run History */}
              <div className="glass-panel p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-display font-bold text-white text-base">Execution History</h3>
                  <span className="text-xs text-slate-400">Showing last runs</span>
                </div>

                <div className="space-y-3">
                  {[
                    { id: "exec-9921", status: "completed", trigger: "Hourly Scheduled Sentinel", time: "12 mins ago", duration: "184ms", records: 3 },
                    { id: "exec-9920", status: "completed", trigger: "Webhook Ingestion", time: "1 hour ago", duration: "142ms", records: 1 },
                    { id: "exec-9919", status: "completed", trigger: "Scheduled Watcher", time: "2 hours ago", duration: "210ms", records: 5 },
                  ].map((exec) => (
                    <div key={exec.id} className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <div>
                          <span className="font-semibold text-white block">{exec.trigger}</span>
                          <span className="text-[11px] text-slate-400 font-mono">Run ID: {exec.id} • {exec.records} items processed</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 block font-semibold">{exec.duration}</span>
                        <span className="text-[10px] text-slate-400">{exec.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select a workflow pipeline on the left to inspect its nodes and history.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
