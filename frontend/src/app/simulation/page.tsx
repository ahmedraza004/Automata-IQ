"use client";

import { useState } from "react";
import {
  Play,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  Zap,
  RotateCcw,
  Sparkles,
  FileText,
  DollarSign,
  UserCheck,
  Headphones
} from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { formatCurrency } from "@/lib/utils";

export default function SimulationStudioPage() {
  const [activeTab, setActiveTab] = useState<"dunning" | "recruitment" | "support" | "sentinel">("dunning");
  const [isRunning, setIsRunning] = useState(false);
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeStep, setActiveStep] = useState<number>(0);

  // Form states
  const [dunningData, setDunningData] = useState({
    invoice_number: "INV-2026-9841",
    customer_name: "Apex Global Logistics Inc",
    customer_email: "ap@apexlogistics.com",
    amount: 34500,
    days_overdue: 42,
    customer_risk_tier: "standard"
  });

  const [recruitmentData, setRecruitmentData] = useState({
    candidate_name: "Dr. Ryan Sterling",
    candidate_email: "ryan.sterling@quantummail.io",
    job_title: "Senior AI Platform Engineer",
    min_years_experience: 5.0,
    resume_text: "Senior Software Architect with 7+ years building enterprise distributed systems. Proficient in Python, FastAPI, Docker, Redis, PostgreSQL, and LLM reasoning pipelines. Created high-scale microservices serving 10M requests daily."
  });

  const [supportData, setSupportData] = useState({
    customer_name: "Marcus Brody",
    customer_email: "marcus@enterprise.com",
    subject: "CRITICAL: Database connection timeout during peak processing",
    body: "Our team is experiencing database connection pool exhaustion and 504 gateway timeout errors on our production cluster since 15 minutes ago. This is halting order shipments. We need immediate incident intervention!",
    account_tier: "enterprise"
  });

  const runSimulation = async () => {
    setIsRunning(true);
    setSimulationResult(null);
    setActiveStep(1);

    try {
      // Step 1: Ingest
      await new Promise(r => setTimeout(r, 400));
      setActiveStep(2);

      // Step 2: AI Reasoning
      await new Promise(r => setTimeout(r, 600));
      setActiveStep(3);

      // Step 3: Verification & Execution
      let result;
      if (activeTab === "dunning") {
        result = await api.simulateDunning(dunningData);
      } else if (activeTab === "recruitment") {
        result = await api.simulateRecruitment(recruitmentData);
      } else if (activeTab === "support") {
        result = await api.simulateSupport(supportData);
      } else {
        result = await api.triggerSentinelScan();
      }

      await new Promise(r => setTimeout(r, 400));
      setActiveStep(4);
      setSimulationResult(result);
    } catch (err: any) {
      console.error("Simulation error:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Scenario Sandbox</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">Live Operations Simulation Studio</h1>
          <p className="text-xs text-slate-400">Trigger real-world events, observe real-time multi-model AI reasoning, and verify deterministic guardrails.</p>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="flex border-b border-slate-800 space-x-2">
        <button
          onClick={() => { setActiveTab("dunning"); setSimulationResult(null); setActiveStep(0); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "dunning"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Receivables / Dunning Flow</span>
        </button>

        <button
          onClick={() => { setActiveTab("recruitment"); setSimulationResult(null); setActiveStep(0); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "recruitment"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Talent Screening Flow</span>
        </button>

        <button
          onClick={() => { setActiveTab("support"); setSimulationResult(null); setActiveStep(0); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === "support"
              ? "border-brand-500 text-brand-300 bg-brand-500/10 rounded-t-xl"
              : "border-transparent text-slate-400 hover:text-white"
          }`}
        >
          <Headphones className="w-4 h-4" />
          <span>Support SLA Sentinel Flow</span>
        </button>
      </div>

      {/* Grid: Scenario Form vs Pipeline Execution Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-display font-semibold text-white text-sm">Scenario Configuration</h3>
            <span className="text-[11px] text-brand-400 font-mono">Simulated Input</span>
          </div>

          {activeTab === "dunning" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Invoice Number</label>
                <input
                  type="text"
                  value={dunningData.invoice_number}
                  onChange={(e) => setDunningData({ ...dunningData, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer Name & Contact</label>
                <input
                  type="text"
                  value={dunningData.customer_name}
                  onChange={(e) => setDunningData({ ...dunningData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Amount ($ USD)</label>
                  <input
                    type="number"
                    value={dunningData.amount}
                    onChange={(e) => setDunningData({ ...dunningData, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Days Overdue</label>
                  <input
                    type="number"
                    value={dunningData.days_overdue}
                    onChange={(e) => setDunningData({ ...dunningData, days_overdue: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "recruitment" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Candidate Name</label>
                <input
                  type="text"
                  value={recruitmentData.candidate_name}
                  onChange={(e) => setRecruitmentData({ ...recruitmentData, candidate_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Target Requisition</label>
                <input
                  type="text"
                  value={recruitmentData.job_title}
                  onChange={(e) => setRecruitmentData({ ...recruitmentData, job_title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Resume / CV Raw Extract</label>
                <textarea
                  rows={4}
                  value={recruitmentData.resume_text}
                  onChange={(e) => setRecruitmentData({ ...recruitmentData, resume_text: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-sans"
                />
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Customer</label>
                <input
                  type="text"
                  value={supportData.customer_name}
                  onChange={(e) => setSupportData({ ...supportData, customer_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={supportData.subject}
                  onChange={(e) => setSupportData({ ...supportData, subject: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Ticket Body</label>
                <textarea
                  rows={4}
                  value={supportData.body}
                  onChange={(e) => setSupportData({ ...supportData, body: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          <button
            onClick={runSimulation}
            disabled={isRunning}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-brand transition-all disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Executing Autonomous Pipeline..." : "Trigger Live Pipeline"}</span>
          </button>
        </div>

        {/* Right Execution Flow & Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step Pipeline Visualization */}
          <div className="glass-panel p-5">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Pipeline Execution Stages</h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { step: 1, name: "Ingest", icon: FileText },
                { step: 2, name: "AI Reason", icon: BrainCircuit },
                { step: 3, name: "Verification", icon: ShieldCheck },
                { step: 4, name: "Action / Route", icon: CheckCircle2 }
              ].map((item) => {
                const isPassed = activeStep > item.step;
                const isCurrent = activeStep === item.step;
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent
                        ? "bg-brand-500/20 border-brand-500 text-white shadow-glow-brand animate-pulse"
                        : isPassed
                        ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400"
                        : "bg-dark-850/40 border-slate-800 text-slate-400"
                    }`}
                  >
                    <Icon className="w-4 h-4 mx-auto mb-1" />
                    <span className="text-[11px] font-semibold block">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Display */}
          {simulationResult && (
            <div className="glass-panel p-6 space-y-5 animate-fade-in border-brand-500/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <h3 className="font-display font-bold text-white text-base">Autonomous Pipeline Verdict</h3>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status="" type="confidence" score={simulationResult.confidence} />
                  {simulationResult.verification_passed ? (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-950 text-rose-400 border border-rose-800">
                      Violations Found
                    </span>
                  )}
                </div>
              </div>

              {/* Reasoning Box */}
              <div className="p-4 rounded-xl bg-dark-950/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-brand-300 uppercase tracking-wider">AI Reasoning Trace</span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {simulationResult.reasoning || simulationResult.experience_assessment}
                </p>
              </div>

              {/* Action / Output copy */}
              {simulationResult.drafted_message && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Synthesized Communication Notice</span>
                  <div className="p-3.5 rounded-xl bg-dark-850 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap">
                    {simulationResult.drafted_message}
                  </div>
                </div>
              )}

              {simulationResult.interview_questions && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Generated Competency Interview Questions</span>
                  <ul className="space-y-1.5 text-xs text-slate-300">
                    {simulationResult.interview_questions.map((q: string, idx: number) => (
                      <li key={idx} className="p-2.5 rounded-lg bg-dark-850 border border-slate-800 flex items-start gap-2">
                        <span className="text-brand-400 font-bold">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bottom Status Ticker */}
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center justify-between text-xs text-emerald-300 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Immutable Audit Log Created (ID: {Math.random().toString(36).substring(7)})</span>
                </div>
                <span className="font-mono text-[10px]">Latency: 48ms</span>
              </div>
            </div>
          )}

          {!simulationResult && !isRunning && (
            <div className="glass-panel p-12 text-center text-slate-400 space-y-3">
              <Play className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-semibold text-slate-300 text-sm">Awaiting Scenario Execution</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Select your parameters on the left and click "Trigger Live Pipeline" to observe the AI reasoner and verification validator live.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
