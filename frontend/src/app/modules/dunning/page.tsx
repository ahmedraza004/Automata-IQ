"use client";

import { useEffect, useState } from "react";
import {
  Banknote,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  TrendingUp,
  DollarSign,
  FileText,
  Building,
  RefreshCw
} from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function DunningPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  useEffect(() => {
    async function loadInvoices() {
      try {
        const res = await api.getOdooInvoices();
        setInvoices(res.invoices || []);
        if (res.invoices && res.invoices.length > 0) {
          setSelectedInvoice(res.invoices[0]);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInvoices();
  }, []);

  const handleEvaluateDunning = async () => {
    if (!selectedInvoice) return;
    setEvaluating(true);
    try {
      const res = await api.simulateDunning(selectedInvoice);
      setEvaluationResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-2">
            <Banknote className="w-3.5 h-3.5" />
            <span>Accounts Receivable Intelligence</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Receivables & Dunning Automation</h1>
          <p className="text-xs text-slate-400">Aging debt monitoring, AI tailored recovery strategies, and automated settlement incentives.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-dark-850 border border-slate-700 text-xs">
            <span className="text-slate-400 block">Total Overdue Managed</span>
            <span className="font-bold text-white font-mono text-sm">{formatCurrency(100400)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Invoices list vs AI Dunning Evaluator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Invoices List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">Odoo Synced Invoices</h3>
          {invoices.map((inv) => {
            const isSelected = selectedInvoice?.invoice_number === inv.invoice_number;
            return (
              <div
                key={inv.invoice_number}
                onClick={() => { setSelectedInvoice(inv); setEvaluationResult(null); }}
                className={`glass-card-interactive p-4 cursor-pointer transition-all ${
                  isSelected ? "border-brand-500/80 bg-brand-950/20 shadow-glow-brand" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{inv.invoice_number}</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">{formatCurrency(inv.amount)}</span>
                </div>

                <div className="text-xs text-slate-300 mb-2">{inv.customer_name}</div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono border-t border-slate-800/80 pt-2">
                  <span className="text-rose-400 font-semibold">{inv.days_overdue} Days Overdue</span>
                  <span>Stage {inv.dunning_stage}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Invoice Details & AI Strategy (7 cols) */}
        <div className="lg:col-span-7">
          {selectedInvoice ? (
            <div className="glass-panel p-6 space-y-6">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">{selectedInvoice.customer_name}</h3>
                  <p className="text-xs text-slate-400 font-mono">Invoice: {selectedInvoice.invoice_number} • Amount: {formatCurrency(selectedInvoice.amount)}</p>
                </div>
                <button
                  onClick={handleEvaluateDunning}
                  disabled={evaluating}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-glow-brand disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${evaluating ? "animate-spin" : ""}`} />
                  <span>{evaluating ? "Analyzing Debt..." : "Evaluate AI Recovery Strategy"}</span>
                </button>
              </div>

              {evaluationResult && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Recommended Action</span>
                      <span className="text-xs font-bold text-white block">{evaluationResult.recommended_action}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                      <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Confidence Score</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono block">{evaluationResult.confidence}% (Auto-Approved)</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 space-y-2">
                    <span className="text-[11px] font-semibold text-brand-300 uppercase tracking-wider">AI Behavioral Reasoning</span>
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{evaluationResult.reasoning}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Drafted Dunning Communication</span>
                    <div className="p-4 rounded-xl bg-dark-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                      {evaluationResult.drafted_message}
                    </div>
                  </div>
                </div>
              )}

              {!evaluationResult && !evaluating && (
                <div className="p-8 rounded-xl bg-dark-950/40 border border-slate-800/80 text-center text-xs text-slate-400 space-y-2">
                  <Banknote className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>Click "Evaluate AI Recovery Strategy" to run aging risk calibration and generate tailored debtor communications.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400">
              Select an invoice on the left to evaluate recovery.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
