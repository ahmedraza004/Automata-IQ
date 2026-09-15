"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BrainCircuit,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Zap,
  RefreshCw
} from "lucide-react";
import { wsClient } from "@/lib/websocket";
import { StatusBadge } from "@/components/layout/StatusBadge";
import { AIDecision } from "@/types";
import { formatDate } from "@/lib/utils";

interface LiveFeedProps {
  initialDecisions: AIDecision[];
}

export function LiveFeed({ initialDecisions }: LiveFeedProps) {
  const [decisions, setDecisions] = useState<AIDecision[]>(initialDecisions);
  const [livePulse, setLivePulse] = useState(false);

  useEffect(() => {
    const unsubscribe = wsClient.subscribe((eventData) => {
      setLivePulse(true);
      setTimeout(() => setLivePulse(false), 2000);

      // If new decision received, prepend to feed
      if (eventData?.event?.startsWith("SIMULATION_") || eventData?.decision_id) {
        // Refresh local items
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="glass-panel p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Zap className={`w-4 h-4 ${livePulse ? "animate-bounce text-emerald-400" : ""}`} />
          </div>
          <div>
            <h3 className="font-display font-bold text-white text-base">Real-Time Decision Intelligence Stream</h3>
            <p className="text-xs text-slate-400">Continuous AI evaluation, guardrail verification & action queue</p>
          </div>
        </div>

        <Link
          href="/decisions"
          className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors group"
        >
          <span>View All Decisions</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="divide-y divide-slate-800/80">
        {decisions.slice(0, 5).map((dec) => (
          <div key={dec.id} className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-dark-850 border border-slate-700/80 mt-0.5">
                <BrainCircuit className="w-4 h-4 text-brand-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-white group-hover:text-brand-300 transition-colors">
                    {dec.domain.toUpperCase()}: {dec.entity_id || "Autonomous Batch"}
                  </span>
                  <StatusBadge status={dec.status} />
                  <StatusBadge status="" type="confidence" score={dec.confidence_score} />
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl line-clamp-1 font-normal">
                  {dec.reasoning_summary || dec.ai_response?.recommended_action || "Autonomous process evaluation completed."}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <span className="text-[11px] text-slate-400 font-mono">
                {formatDate(dec.created_at)}
              </span>
              <Link
                href="/decisions"
                className="px-3 py-1 rounded-lg bg-dark-850 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
              >
                Inspect
              </Link>
            </div>
          </div>
        ))}

        {decisions.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">
            No recent AI decisions logged. Run a live simulation to generate activity.
          </div>
        )}
      </div>
    </div>
  );
}
