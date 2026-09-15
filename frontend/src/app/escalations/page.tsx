"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Send,
  UserCheck,
  RefreshCw,
  Search
} from "lucide-react";
import { api } from "@/lib/api";
import { Escalation } from "@/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function EscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const loadEscalations = async () => {
    try {
      const list = await api.getEscalations({
        priority: priorityFilter || undefined,
      });
      setEscalations(list);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadEscalations();
  }, [priorityFilter]);

  const handleTriggerSlaScan = async () => {
    setIsScanning(true);
    try {
      const res = await api.triggerSlaBreachCheck();
      setScanResult(`SLA Scan: ${res.escalations_promoted} escalations promoted to next tier, ${res.slack_notifications_sent} Slack alerts dispatched.`);
      setTimeout(() => setScanResult(null), 4000);
      await loadEscalations();
    } catch (err) {
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  const handleResolveEscalation = async (id: string) => {
    try {
      await api.updateEscalation(id, { status: "resolved", resolution_summary: "Resolved by operations officer." });
      await loadEscalations();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold mb-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Multi-Tier SLA Sentinel</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">SLA Escalation Command Center</h1>
          <p className="text-xs text-slate-400">Zero-miss escalation matrix. Automatic Tier 1 to Tier 3 promotion with Jira sync and Slack paging.</p>
        </div>

        <button
          onClick={handleTriggerSlaScan}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-brand-400" : ""}`} />
          <span>{isScanning ? "Evaluating SLAs..." : "Scan SLA Deadlines"}</span>
        </button>
      </div>

      {scanResult && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{scanResult}</span>
        </div>
      )}

      {/* Tier Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 border-l-4 border-l-amber-500">
          <span className="text-xs font-bold text-white block mb-1">Tier 1: Operations Triage</span>
          <p className="text-xs text-slate-400">Handled by duty operators within 60 minutes.</p>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-orange-500">
          <span className="text-xs font-bold text-white block mb-1">Tier 2: Management Escalation</span>
          <p className="text-xs text-slate-400">Auto-created Jira ticket & Slack alert if unaddressed.</p>
        </div>
        <div className="glass-panel p-4 border-l-4 border-l-rose-500">
          <span className="text-xs font-bold text-white block mb-1">Tier 3: Executive Intervention</span>
          <p className="text-xs text-slate-400">Direct page to VP of Operations for critical breaches.</p>
        </div>
      </div>

      {/* Escalations Table */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="font-display font-bold text-white text-base">Active Escalation Queue</h3>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="divide-y divide-slate-800">
          {escalations.map((esc) => (
            <div key={esc.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {esc.title}
                  </span>
                  <StatusBadge status={esc.priority} type="priority" />
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dark-850 text-slate-300 border border-slate-700">
                    Tier {esc.escalation_tier}
                  </span>
                  {esc.jira_issue_key && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1">
                      <span>JIRA: {esc.jira_issue_key}</span>
                      <ExternalLink className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                  {esc.description || "Escalation generated by Sentinel Watcher."}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono pt-1">
                  <span>Assigned: <strong className="text-slate-200">{esc.assigned_to || "Duty Queue"}</strong></span>
                  <span>Created: {formatDate(esc.created_at)}</span>
                  {esc.sla_deadline && <span>SLA Target: {formatDate(esc.sla_deadline)}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                {esc.status !== "resolved" ? (
                  <button
                    onClick={() => handleResolveEscalation(esc.id)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                ) : (
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-dark-850 text-emerald-400 border border-emerald-800/40">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))}

          {escalations.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No active SLA escalations pending. All operational queues compliant.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
