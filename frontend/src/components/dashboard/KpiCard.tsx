import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  icon: LucideIcon;
  variant?: "brand" | "emerald" | "amber" | "rose";
}

export function KpiCard({
  title,
  value,
  subValue,
  trend,
  trendDirection = "up",
  icon: Icon,
  variant = "brand"
}: KpiCardProps) {
  const styles = {
    brand: {
      border: "hover:border-brand-500/50",
      glow: "hover:shadow-glow-brand",
      iconBg: "bg-brand-500/10 text-brand-400 border-brand-500/20",
      badge: "text-brand-300 bg-brand-950/60 border-brand-800/60"
    },
    emerald: {
      border: "hover:border-emerald-500/50",
      glow: "hover:shadow-glow-emerald",
      iconBg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      badge: "text-emerald-300 bg-emerald-950/60 border-emerald-800/60"
    },
    amber: {
      border: "hover:border-amber-500/50",
      glow: "hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]",
      iconBg: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      badge: "text-amber-300 bg-amber-950/60 border-amber-800/60"
    },
    rose: {
      border: "hover:border-rose-500/50",
      glow: "hover:shadow-glow-rose",
      iconBg: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      badge: "text-rose-300 bg-rose-950/60 border-rose-800/60"
    },
  }[variant];

  return (
    <div className={cn(
      "glass-panel p-5 transition-all duration-300 group hover:-translate-y-0.5",
      styles.border,
      styles.glow
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={cn("p-2 rounded-xl border transition-transform group-hover:scale-110", styles.iconBg)}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <div>
          <div className="text-2xl font-bold font-display text-white tracking-tight">
            {value}
          </div>
          {subValue && (
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              {subValue}
            </p>
          )}
        </div>
        {trend && (
          <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full border", styles.badge)}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
