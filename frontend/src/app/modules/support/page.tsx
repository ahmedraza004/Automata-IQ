"use client";

import { useState } from "react";
import {
  Headphones,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Send,
  Clock,
  Zap
} from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/layout/StatusBadge";

export default function SupportPage() {
  const [ticketData, setTicketData] = useState({
    customer_name: "Elena Rostova",
    customer_email: "elena@apexlogistics.com",
    subject: "Payment API webhook failing with 500 error code",
    body: "Our ERP integration is failing to sync invoice payment confirmations. Webhook endpoints returning HTTP 500 since 30 mins ago. Need urgent assistance before daily accounting closing!",
    account_tier: "enterprise"
  });
  const [triaging, setTriaging] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleTriage = async () => {
    setTriaging(true);
    try {
      const res = await api.simulateSupport(ticketData);
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setTriaging(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold mb-2">
            <Headphones className="w-3.5 h-3.5" />
            <span>Omnichannel Support Automation</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Customer Support SLA Sentinel</h1>
          <p className="text-xs text-slate-400">Continuous sentiment analysis, automated Jira P1 incident creation, and verified draft responses.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Input Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-4 text-xs">
          <h3 className="font-display font-bold text-white text-sm pb-3 border-b border-slate-800">
            Incoming Ticket Intake
          </h3>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Customer Name & Email</label>
            <input
              type="text"
              value={ticketData.customer_name}
              onChange={(e) => setTicketData({ ...ticketData, customer_name: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Ticket Subject</label>
            <input
              type="text"
              value={ticketData.subject}
              onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Ticket Message Body</label>
            <textarea
              rows={5}
              value={ticketData.body}
              onChange={(e) => setTicketData({ ...ticketData, body: e.target.value })}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
            />
          </div>

          <button
            onClick={handleTriage}
            disabled={triaging}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-brand-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-brand transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${triaging ? "animate-spin" : ""}`} />
            <span>{triaging ? "Triaging Ticket..." : "Triage Ticket with AI Sentinel"}</span>
          </button>
        </div>

        {/* Right Output Panel (7 cols) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-panel p-6 space-y-6 animate-fade-in">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">{ticketData.subject}</h3>
                  <p className="text-xs text-slate-400 font-mono">From: {ticketData.customer_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={result.priority} type="priority" />
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-dark-850 text-slate-300 border border-slate-700 capitalize">
                    Sentiment: {result.sentiment}
                  </span>
                </div>
              </div>

              {/* Triage Metas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Incident Category</span>
                  <span className="text-xs font-bold text-white capitalize">{result.category}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-dark-950 border border-slate-800">
                  <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block mb-1">Jira Incident Escalation</span>
                  <span className="text-xs font-bold text-rose-400 font-mono">
                    {result.requires_jira_ticket ? "🚨 P1 Incident Created" : "Standard Queue"}
                  </span>
                </div>
              </div>

              {/* Drafted Reply */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified AI Suggested Resolution Reply</span>
                <div className="p-4 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                  {result.suggested_reply}
                </div>
              </div>

              {result.escalation_reason && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-xs text-rose-300">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{result.escalation_reason}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 space-y-2">
              <Headphones className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-semibold text-slate-300 text-sm">No Ticket Evaluated</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Submit an urgent support message on the left to evaluate sentiment, trigger Jira tickets, and draft verified replies.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
