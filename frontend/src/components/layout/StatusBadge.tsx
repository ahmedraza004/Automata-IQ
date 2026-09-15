import { cn, getConfidenceBadgeColor, getPriorityBadgeColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "confidence" | "priority" | "tier";
  score?: number;
  className?: string;
}

export function StatusBadge({ status, type = "status", score, className }: StatusBadgeProps) {
  if (type === "confidence" && score !== undefined) {
    const style = getConfidenceBadgeColor(score);
    return (
      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border", style.bg, style.text, style.border, className)}>
        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        <span>{score}% Confidence</span>
      </span>
    );
  }

  if (type === "priority") {
    const style = getPriorityBadgeColor(status);
    return (
      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border", style.bg, style.text, style.border, className)}>
        {status}
      </span>
    );
  }

  // Default status badge
  let bg = "bg-slate-800 text-slate-300 border-slate-700";
  const s = status.toLowerCase();

  if (s === "active" || s === "completed" || s === "auto_approved" || s === "approved_by_human" || s === "paid") {
    bg = "bg-emerald-950/60 text-emerald-400 border-emerald-800/60";
  } else if (s === "running" || s === "in_progress" || s === "pending_review" || s === "open") {
    bg = "bg-amber-950/60 text-amber-400 border-amber-800/60";
  } else if (s === "failed" || s === "rejected_by_human" || s === "escalated" || s === "overdue" || s === "critical") {
    bg = "bg-rose-950/60 text-rose-400 border-rose-800/60";
  }

  return (
    <span className={cn("inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border", bg, className)}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
      <span className="capitalize">{status.replace(/_/g, " ")}</span>
    </span>
  );
}
