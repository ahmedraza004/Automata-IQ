"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  GitBranch,
  BrainCircuit,
  AlertTriangle,
  Banknote,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  PlayCircle,
  Clock,
  Sparkles,
  Users
} from "lucide-react";
import { api } from "@/lib/api";
import { DashboardKPIs, AIDecision } from "@/types";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { PerformanceCharts } from "@/components/dashboard/PerformanceCharts";
import { LiveFeed } from "@/components/dashboard/LiveFeed";
import { formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [chartsData, setChartsData] = useState<any>(null);
  const [recentDecisions, setRecentDecisions] = useState<AIDecision[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [kpiRes, chartRes, decisionRes] = await Promise.all([
          api.getKPIs().catch(() => null),
          api.getChartsData().catch(() => null),
          api.getAIDecisions().catch(() => [])
        ]);
        setKpis(kpiRes);
        setChartsData(chartRes);
        setRecentDecisions(decisionRes);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner / Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-950/80 via-dark-900 to-dark-850 p-6 md:p-8 border border-brand-500/30 shadow-glass">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
              <span>Multi-Model AI Reasoning & Deterministic Verification</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white tracking-tight">
              Enterprise Operations Command Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Continuous monitoring across Receivables, Support SLAs, and Recruitment. Guardrails ensure 100% compliance while autonomous agents resolve high-confidence exceptions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/simulation"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-accent-violet hover:from-brand-500 hover:to-accent-violet/90 text-white text-sm font-semibold shadow-glow-brand transition-all duration-200"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Launch Live Simulator</span>
            </Link>
            <Link
              href="/workflows"
              className="px-4 py-2.5 rounded-xl bg-dark-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-sm font-medium transition-colors"
            >
              Workflow Pipelines
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <KpiCard
          title="Active Workflows"
          value={kpis?.active_workflows ?? 4}
          subValue="4 of 4 automated sentinels active"
          trend="+12% throughput"
          icon={GitBranch}
          variant="brand"
        />
        <KpiCard
          title="Autonomous Execution Rate"
          value={`${kpis?.autonomous_execution_rate ?? 91.2}%`}
          subValue={`${kpis?.auto_approved_decisions ?? 48} auto-executed, ${kpis?.human_reviewed_decisions ?? 12} reviewed`}
          trend="Score ≥95%"
          icon={BrainCircuit}
          variant="emerald"
        />
        <KpiCard
          title="Recovered Receivables"
          value={formatCurrency(kpis?.recovered_cash_value ?? 128400)}
          subValue={`Total Debt Managed: ${formatCurrency(kpis?.total_receivables_value ?? 293400)}`}
          trend="+34% MoM"
          icon={Banknote}
          variant="emerald"
        />
        <KpiCard
          title="Open SLA Escalations"
          value={kpis?.open_escalations ?? 3}
          subValue={`${kpis?.critical_escalations ?? 1} Critical Tier-2 SLA Breach`}
          trend="Avg SLA 98.2%"
          icon={AlertTriangle}
          variant={kpis?.critical_escalations ? "rose" : "amber"}
        />
      </div>

      {/* Performance Visualizations */}
      <PerformanceCharts data={chartsData} />

      {/* Real-Time Live Feed */}
      <LiveFeed initialDecisions={recentDecisions} />
    </div>
  );
}
