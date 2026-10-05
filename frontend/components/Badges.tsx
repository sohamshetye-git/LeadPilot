import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  const base = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";
  
  const variants = {
    default: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
    success: "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40",
    warning: "bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40",
    danger: "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40",
    outline: "border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400",
  };

  return (
    <span className={`${base} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "High") return <Badge variant="danger">High Priority</Badge>;
  if (priority === "Medium") return <Badge variant="warning">Medium</Badge>;
  return <Badge variant="default">Low</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "Completed":
      return <Badge variant="success">Completed</Badge>;
    case "Follow-up scheduled":
      return <Badge variant="warning">Follow-up Scheduled</Badge>;
    case "Contacted":
      return <Badge variant="outline">Contacted</Badge>;
    case "Not interested":
      return <Badge variant="default">Not Interested</Badge>;
    case "Pending":
    default:
      return <Badge variant="default">Pending</Badge>;
  }
}

export function ScoreIndicator({ score }: { score: number }) {
  let color = "text-zinc-600 bg-zinc-100";
  if (score >= 80) color = "text-emerald-700 bg-emerald-50 border border-emerald-200";
  else if (score >= 60) color = "text-amber-700 bg-amber-50 border border-amber-200";

  return (
    <span className={`inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded-md ${color}`}>
      {score}/100
    </span>
  );
}
