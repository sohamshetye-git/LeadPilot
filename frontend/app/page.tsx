"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  Flame, 
  Clock, 
  AlertCircle, 
  ArrowRight, 
  Calendar,
  Building2,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Mail
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { DashboardStats } from "@/types";
import { PriorityBadge, StatusBadge, ScoreIndicator } from "@/components/Badges";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchApi<DashboardStats>("/dashboard/stats");
        setStats(data);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"></div>
          ))}
        </div>
        <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <h3 className="text-sm font-semibold">Unable to load dashboard intelligence</h3>
          </div>
          <p className="mt-2 text-xs">{error || "Backend service is currently initializing or unreachable."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Pipeline Overview
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Turn event conversations into actionable opportunities. Real-time lead pipeline & AI follow-up tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/leads"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800 shadow-sm"
          >
            All Leads <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Leads Captured</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.total_leads}</span>
            <span className="text-xs text-zinc-400">across events</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">High Priority Leads</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{stats.high_priority_count}</span>
            <span className="text-xs text-zinc-400">ready to close</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Follow-ups Due Today</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">{stats.follow_ups_due_today}</span>
            <span className="text-xs text-zinc-400">scheduled</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Overdue Follow-ups</span>
            <AlertCircle className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{stats.overdue_follow_ups}</span>
            <span className="text-xs text-zinc-400">needs touchpoint</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Needs Your Attention & Upcoming Followups */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Needs Your Attention (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-zinc-900 dark:text-zinc-100" />
              <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                Needs Your Attention
              </h2>
            </div>
            <span className="text-xs text-zinc-500">Prioritized by AI intent & timing</span>
          </div>

          <div className="space-y-3">
            {stats.attention_leads.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-zinc-200 text-zinc-500 text-xs dark:border-zinc-800">
                No active leads require immediate attention today. Great job!
              </div>
            ) : (
              stats.attention_leads.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/leads/${lead.id}`}
                  className="group block p-4 rounded-xl border border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs transition dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-zinc-600 dark:text-zinc-100 dark:group-hover:text-zinc-300">
                          {lead.name}
                        </span>
                        <PriorityBadge priority={lead.priority} />
                        <ScoreIndicator score={lead.lead_score} />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {lead.company} {lead.job_title ? `· ${lead.job_title}` : ""}
                        </span>
                        {lead.event_name && (
                          <span className="flex items-center gap-1 text-zinc-400">
                            <Calendar className="h-3 w-3" />
                            {lead.event_name}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-zinc-400 group-hover:translate-x-0.5 transition" />
                  </div>
                  {lead.notes && (
                    <p className="mt-2.5 text-xs text-zinc-600 line-clamp-2 bg-zinc-50 p-2 rounded-md border border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-300">
                      {lead.notes}
                    </p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Sidebar: Upcoming Follow-ups & Event Performance */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <Mail className="h-4 w-4" /> Upcoming Follow-ups
            </h2>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              {stats.upcoming_follow_ups.length === 0 ? (
                <p className="text-xs text-zinc-500">No pending follow-ups scheduled.</p>
              ) : (
                stats.upcoming_follow_ups.map((fu) => (
                  <div key={fu.id} className="pb-3 border-b border-zinc-100 last:border-b-0 last:pb-0 dark:border-zinc-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-800 dark:text-zinc-200">{fu.lead_name || "Lead"}</span>
                      <span className="text-[10px] text-zinc-400">{fu.action_type}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 truncate mt-0.5">{fu.lead_company || fu.notes || "Follow-up discussion"}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" /> Event Yield
            </h2>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900/50">
              {stats.event_performance.map((ev) => (
                <div key={ev.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{ev.name}</span>
                    <span className="font-mono text-zinc-500">{ev.leads_count} leads</span>
                  </div>
                  <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden dark:bg-zinc-800">
                    <div 
                      className="bg-zinc-900 h-full rounded-full dark:bg-zinc-300"
                      style={{ width: `${Math.min(100, (ev.leads_count / Math.max(stats.total_leads, 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
