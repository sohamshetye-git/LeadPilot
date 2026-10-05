"use client";

import { useEffect, useState } from "react";
import { 
  BarChart3, 
  Users, 
  Flame, 
  CheckCircle2, 
  Target, 
  MapPin, 
  Calendar 
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { DashboardStats } from "@/types";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const data = await fetchApi<DashboardStats>("/dashboard/stats");
        setStats(data);
      } catch (err: any) {
        alert("Failed to load analytics: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-zinc-100 dark:bg-zinc-900 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Event Performance Analytics
        </h1>
        <p className="text-xs text-zinc-500 mt-1">
          Objective conversion data, qualified opportunities, and event ROI comparison.
        </p>
      </div>

      {/* Aggregate Yield KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Average Lead Score</span>
            <Target className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {stats.avg_lead_score} / 100
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Total Captured Leads</span>
            <Users className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-50">
            {stats.total_leads}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>High-Priority Leads</span>
            <Flame className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">
            {stats.high_priority_count}
          </div>
        </div>

        <div className="p-4 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Follow-ups Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {stats.completed_follow_ups}
          </div>
        </div>
      </div>

      {/* Event Comparison Breakdown */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
          <BarChart3 className="h-4 w-4" /> Per-Event Quality & Yield
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
            <thead className="border-b border-zinc-200 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:border-zinc-800">
              <tr>
                <th className="py-2.5">Event Name</th>
                <th className="py-2.5">Location</th>
                <th className="py-2.5 text-center">Total Leads</th>
                <th className="py-2.5 text-center">High Priority</th>
                <th className="py-2.5 text-center">Qualified (Score &ge; 70)</th>
                <th className="py-2.5 text-center">Outreach Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 font-mono">
              {stats.event_performance.map((ev) => (
                <tr key={ev.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                  <td className="py-3 font-sans font-medium text-zinc-900 dark:text-zinc-100">{ev.name}</td>
                  <td className="py-3 font-sans text-zinc-500">{ev.location || "N/A"}</td>
                  <td className="py-3 text-center">{ev.leads_count}</td>
                  <td className="py-3 text-center text-rose-600 font-semibold">{ev.high_priority_count}</td>
                  <td className="py-3 text-center text-emerald-600">{ev.qualified_count}</td>
                  <td className="py-3 text-center">{ev.completed_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
