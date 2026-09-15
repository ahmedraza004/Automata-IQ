"use client";

import { useEffect, useState } from "react";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Search,
  Filter,
  ArrowRight,
  Clock,
  Sparkles,
  MessageSquare,
  Check,
  X,
  ExternalLink
} from "lucide-react";
import { api } from "@/lib/api";
import { AIDecision } from "@/types";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<AIDecision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<AIDecision | null>(null);
  const [domainFilter, setDomainFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadDecisions = async () => {
    try {
      const list = await api.getAIDecisions({
        domain: domainFilter || undefined,
        status: statusFilter || undefined,
      });
      setDecisions(list);
      if (list.length > 0 && !selectedDecision) {
        setSelectedDecision(list[0]);
      }
    } catch (err) {
      console.error("Error loading decisions:", err);
    }
  };

  useEffect(() => {
    loadDecisions();
  }, [domainFilter, statusFilter]);

  const handleReview = async (action: "approve" | "reject" | "escalate") => {
    if (!selectedDecision) return;
    setIsProcessing(true);
    try {
      const updated = await api.reviewDecision(selectedDecision.id, action, reviewNotes);
      setSelectedDecision(updated);
      setActionSuccess(`Decision successfully ${action === "approve" ? "approved & dispatched" : action + "ed"}!`);
      setReviewNotes("");
      setTimeout(() => setActionSuccess(null), 3000);
      await loadDecisions();
    } catch (err) {
      console.error("Error reviewing decision:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Human-in-the-Loop Governance</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">AI Decision & Verification Center</h1>
          <p className="text-xs text-slate-400">Review AI reasoning traces, confidence score breakdowns, and deterministic safety checks before autonomous execution.</p>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-800/70 text-emerald-300 text-xs font-medium flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filters Bar */}
      <div className="glass-panel p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">Filter By:</span>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Domains</option>
            <option value="dunning">Receivables & Dunning</option>
            <option value="recruitment">Recruitment Screening</option>
            <option value="support">Customer Support SLA</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review (Action Required)</option>
            <option value="auto_approved">Auto-Approved (Autonomous)</option>
            <option value="approved_by_human">Human Approved</option>
            <option value="rejected_by_human">Rejected</option>
            <option value="escalated">Escalated</option>
          </select>
        </div>

        <span className="text-slate-400 font-mono text-[11px]">
          {decisions.length} Decisions Logged
        </span>
      </div>

      {/* Main Decision Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Decisions List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {decisions.map((dec) => {
            const isSelected = selectedDecision?.id === dec.id;
            return (
              <div
                key={dec.id}
                onClick={() => setSelectedDecision(dec)}
                className={`glass-card-interactive p-4 cursor-pointer transition-all ${
                  isSelected ? "border-brand-500/80 bg-brand-950/20 shadow-glow-brand" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white group-hover:text-brand-300 transition-colors">
                      {dec.domain.toUpperCase()}: {dec.entity_id || "Batch Decision"}
                    </span>
                  </div>
                  <StatusBadge status="" type="confidence" score={dec.confidence_score} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                  {dec.reasoning_summary || dec.ai_response?.recommended_action || "Decision evaluated."}
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <StatusBadge status={dec.status} />
                  <span>{formatDate(dec.created_at)}</span>
                </div>
              </div>
            );
          })}

          {decisions.length === 0 && (
            <div className="glass-panel p-8 text-center text-xs text-slate-400">
              No AI decisions match the selected filters.
            </div>
          )}
        </div>

        {/* Right Decision Detail & Approval Panel (7 cols) */}
        <div className="lg:col-span-7">
          {selectedDecision ? (
            <div className="glass-panel p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-bold text-white text-lg">
                      {selectedDecision.domain.toUpperCase()}: {selectedDecision.entity_id}
                    </h3>
                    <StatusBadge status={selectedDecision.status} />
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    Model: {selectedDecision.model_name} • Latency: {selectedDecision.latency_ms}ms
                  </p>
                </div>

                <div className="text-right">
                  <StatusBadge status="" type="confidence" score={selectedDecision.confidence_score} />
                </div>
              </div>

              {/* Deterministic Verification Layer Status */}
              <div className="p-4 rounded-xl bg-dark-950/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Deterministic Guardrails Evaluation</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    selectedDecision.verification_passed
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : "bg-rose-950 text-rose-400 border border-rose-800/60"
                  }`}>
                    {selectedDecision.verification_passed ? "All Rules Passed" : "Rule Violations Detected"}
                  </span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {selectedDecision.verification_details?.checks?.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-xs text-slate-300">
                      <span className="font-mono text-[11px] text-slate-400">✓ {c.rule}</span>
                      <span className="text-emerald-400 font-medium">Passed</span>
                    </div>
                  )) || (
                    <div className="text-xs text-slate-400 font-medium">Verified against enterprise safety policies.</div>
                  )}
                </div>
              </div>

              {/* Reasoning Trace */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-300">AI Reasoning Trace</span>
                <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans">
                  {selectedDecision.reasoning_summary || selectedDecision.ai_response?.reasoning || "Evaluation complete."}
                </div>
              </div>

              {/* Raw JSON Payload Inspector */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Structured Decision Payload</span>
                <pre className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-[11px] font-mono text-emerald-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedDecision.ai_response, null, 2)}
                </pre>
              </div>

              {/* Human-in-the-Loop Action Hub */}
              {selectedDecision.status === "pending_review" && (
                <div className="p-5 rounded-xl bg-brand-950/20 border border-brand-500/40 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-400" />
                    <span className="text-xs font-bold text-white">Human Approval Decision</span>
                  </div>

                  <input
                    type="text"
                    placeholder="Optional review feedback or audit note..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-brand-500"
                  />

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleReview("approve")}
                      disabled={isProcessing}
                      className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow-emerald transition-all disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>

                    <button
                      onClick={() => handleReview("reject")}
                      disabled={isProcessing}
                      className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-glow-rose transition-all disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject</span>
                    </button>

                    <button
                      onClick={() => handleReview("escalate")}
                      disabled={isProcessing}
                      className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Escalate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select an AI decision to inspect the reasoning trace.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
