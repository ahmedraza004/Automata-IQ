"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Search,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Building,
  CheckCircle2,
  ChevronDown
} from "lucide-react";
import { api } from "@/lib/api";
import { wsClient } from "@/lib/websocket";

export function Header() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    wsClient.connect();
    const interval = setInterval(() => {
      setWsConnected(wsClient.status);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerSentinel = async () => {
    setIsScanning(true);
    try {
      const res = await api.triggerSentinelScan();
      setScanMessage(`Scan complete: ${res.invoices_flagged} invoices flagged, ${res.escalations_created} escalations updated.`);
      setTimeout(() => setScanMessage(null), 4000);
    } catch (err: any) {
      setScanMessage("Sentinel scan failed to run.");
      setTimeout(() => setScanMessage(null), 3000);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <header className="h-16 border-b border-slate-800/80 bg-dark-900/60 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Tenant Switcher & Quick Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-dark-850/80 border border-slate-700/60 text-xs text-slate-300">
          <Building className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-medium text-white">Apex Global Enterprise</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-emerald-950/80 text-emerald-400 rounded border border-emerald-800/50">PROD</span>
        </div>

        {/* Global Sentinel Quick-Trigger Button */}
        <button
          onClick={handleTriggerSentinel}
          disabled={isScanning}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-brand-600/20 hover:bg-brand-600/30 border border-brand-500/40 text-brand-300 text-xs font-medium transition-all shadow-[0_0_12px_-3px_rgba(99,102,241,0.25)] hover:shadow-[0_0_16px_-3px_rgba(99,102,241,0.4)] disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? "animate-spin text-brand-400" : ""}`} />
          <span>{isScanning ? "Scanning System Rules..." : "Run Sentinel Watcher"}</span>
        </button>

        {scanMessage && (
          <div className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 animate-fade-in bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* Right: Live Stream Beacon & User Profile */}
      <div className="flex items-center gap-4">
        {/* Live Stream Status */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-dark-850 border border-slate-800 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-300 font-mono text-[11px]">LIVE BROADCAST</span>
        </div>

        {/* Verification Status */}
        <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-800/40">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-medium">Verification Layer Enforced</span>
        </div>

        {/* User Card */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-accent-violet p-0.5 shadow-glow-brand">
            <div className="w-full h-full rounded-full bg-dark-950 flex items-center justify-center font-bold text-xs text-brand-300">
              AV
            </div>
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">Alexander Vance</p>
            <p className="text-[10px] text-brand-400 font-medium leading-tight">Executive Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}
