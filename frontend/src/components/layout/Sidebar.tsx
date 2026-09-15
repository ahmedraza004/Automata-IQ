"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  BrainCircuit,
  AlertTriangle,
  History,
  PlayCircle,
  Banknote,
  Users,
  Headphones,
  Settings,
  ShieldCheck,
  Activity,
  Layers
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Executive Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Live Simulator", href: "/simulation", icon: PlayCircle, badge: "Interactive" },
  { name: "Workflow Studio", href: "/workflows", icon: GitBranch },
  { name: "AI Decision Center", href: "/decisions", icon: BrainCircuit },
  { name: "SLA Escalations", href: "/escalations", icon: AlertTriangle },
  { name: "Audit & Compliance", href: "/audit", icon: History },
];

const domainModules = [
  { name: "Receivables & Dunning", href: "/modules/dunning", icon: Banknote },
  { name: "AI Talent Screening", href: "/modules/recruitment", icon: Users },
  { name: "Support Sentinel", href: "/modules/support", icon: Headphones },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex flex-col shrink-0 bg-dark-900/90 border-r border-slate-800/80 backdrop-blur-2xl h-screen sticky top-0 z-40">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800/80">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-accent-violet flex items-center justify-center shadow-glow-brand">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg text-white tracking-tight">Automata<span className="text-brand-400">IQ</span></span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-brand-500/20 text-brand-300 rounded border border-brand-500/30">AI OPS</span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Autonomous Operations</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Core Command
          </div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 group",
                    isActive
                      ? "bg-brand-600/20 text-brand-200 border border-brand-500/40 shadow-[0_0_15px_-4px_rgba(99,102,241,0.3)]"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={cn("w-4 h-4 transition-colors", isActive ? "text-brand-400" : "text-slate-400 group-hover:text-slate-200")} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-violet/20 text-accent-violet border border-accent-violet/30 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Domain Automations
          </div>
          <nav className="space-y-1">
            {domainModules.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-all duration-150 group",
                    isActive
                      ? "bg-brand-600/20 text-brand-200 border border-brand-500/40"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  )}
                >
                  <Icon className={cn("w-4 h-4", isActive ? "text-brand-400" : "text-slate-400 group-hover:text-slate-200")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Status Area */}
      <div className="p-3 border-t border-slate-800/80 bg-dark-950/40 space-y-2">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-xl transition-colors text-slate-400 hover:text-white hover:bg-slate-800/50",
            pathname === "/settings" && "bg-slate-800/70 text-white"
          )}
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>System Settings</span>
        </Link>
        <div className="p-2.5 rounded-xl bg-dark-850/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-slate-300 font-medium">Sentinel Active</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">10m CRON</span>
        </div>
      </div>
    </aside>
  );
}
