"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  Calendar, 
  ChevronRight, 
  Sparkles,
  RotateCcw,
  AlertTriangle,
  X
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { Lead, EventItem, DuplicateCheckResult } from "@/types";
import { PriorityBadge, StatusBadge, ScoreIndicator } from "@/components/Badges";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedDue, setSelectedDue] = useState("");

  // Create Modal State
  const [showModal, setShowModal] = useState(false);
  const [rawText, setRawText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [analyzingScore, setAnalyzingScore] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    job_title: "",
    phone: "",
    linkedin_url: "",
    event_id: "",
    notes: "",
    priority: "Medium",
    lead_score: 50,
    follow_up_status: "Pending"
  });

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<DuplicateCheckResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadLeads() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (selectedEvent) params.append("event_id", selectedEvent);
      if (selectedStatus) params.append("follow_up_status", selectedStatus);
      if (selectedPriority) params.append("priority", selectedPriority);
      if (selectedDue) params.append("follow_up_due", selectedDue);

      const data = await fetchApi<{ items: Lead[]; total: number }>(`/leads?${params.toString()}`);
      setLeads(data.items);
    } catch (err: any) {
      setError(err.message || "Failed to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    async function loadEvents() {
      try {
        const evs = await fetchApi<EventItem[]>("/events");
        setEvents(evs);
      } catch {
        // silently fallback
      }
    }
    loadEvents();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadLeads();
    }, 250);
    return () => clearTimeout(handler);
  }, [search, selectedEvent, selectedStatus, selectedPriority, selectedDue]);

  function resetFilters() {
    setSearch("");
    setSelectedEvent("");
    setSelectedStatus("");
    setSelectedPriority("");
    setSelectedDue("");
  }

  async function handleAIExtract() {
    if (!rawText.trim()) return;
    try {
      setExtracting(true);
      const result = await fetchApi<any>("/ai/extract", {
        method: "POST",
        body: JSON.stringify({ raw_text: rawText })
      });
      setFormData(prev => ({
        ...prev,
        name: result.name || prev.name,
        company: result.company || prev.company,
        email: result.email || prev.email,
        job_title: result.role || prev.job_title,
        notes: rawText
      }));
    } catch (err: any) {
      alert("AI extraction failed: " + err.message);
    } finally {
      setExtracting(false);
    }
  }

  async function handleAIScore() {
    if (!formData.notes.trim()) {
      alert("Please enter interaction notes first to score the lead.");
      return;
    }
    try {
      setAnalyzingScore(true);
      const result = await fetchApi<any>("/ai/score", {
        method: "POST",
        body: JSON.stringify({
          notes: formData.notes,
          lead_name: formData.name,
          company: formData.company,
          job_title: formData.job_title
        })
      });
      setFormData(prev => ({
        ...prev,
        lead_score: result.score,
        priority: result.priority
      }));
    } catch (err: any) {
      alert("AI scoring failed: " + err.message);
    } finally {
      setAnalyzingScore(false);
    }
  }

  async function handleCreateLead(force = false) {
    if (!formData.name.trim() || !formData.company.trim() || !formData.email.trim()) {
      alert("Name, Company, and a valid Email are required.");
      return;
    }

    if (!force) {
      try {
        const dupCheck = await fetchApi<DuplicateCheckResult>("/leads/check-duplicate", {
          method: "POST",
          body: JSON.stringify({
            email: formData.email,
            name: formData.name,
            company: formData.company
          })
        });
        if (dupCheck.is_duplicate) {
          setDuplicateWarning(dupCheck);
          return;
        }
      } catch {
        // proceed if duplicate check unavailable
      }
    }

    try {
      setSubmitting(true);
      await fetchApi("/leads", {
        method: "POST",
        body: JSON.stringify(formData)
      });
      setShowModal(false);
      setDuplicateWarning(null);
      setFormData({
        name: "",
        company: "",
        email: "",
        job_title: "",
        phone: "",
        linkedin_url: "",
        event_id: "",
        notes: "",
        priority: "Medium",
        lead_score: 50,
        follow_up_status: "Pending"
      });
      setRawText("");
      loadLeads();
    } catch (err: any) {
      alert("Failed to save lead: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Event Leads
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Capture, prioritize, and follow up with leads from all your conferences and summits.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 shadow-sm transition dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add Lead
        </button>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, event..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:bg-zinc-800/50 dark:border-zinc-700 dark:focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Event Filter */}
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Events</option>
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-up scheduled">Follow-up scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Not interested">Not interested</option>
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Follow-up Timing Filter */}
          <select
            value={selectedDue}
            onChange={(e) => setSelectedDue(e.target.value)}
            className="text-xs bg-zinc-50 border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-zinc-300 focus:outline-none"
          >
            <option value="">Any Follow-up Time</option>
            <option value="today">Due Today</option>
            <option value="overdue">Overdue</option>
            <option value="upcoming">Upcoming</option>
          </select>

          {(search || selectedEvent || selectedStatus || selectedPriority || selectedDue) && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50">
        {loading ? (
          <div className="p-8 text-center text-xs text-zinc-500 animate-pulse">
            Loading leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No leads found</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              No contacts match your current filter criteria, or no leads have been added for this event yet.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900"
            >
              <Plus className="h-3 w-3" /> Add Lead
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-300">
              <thead className="bg-zinc-50/75 border-b border-zinc-200 text-[11px] font-medium text-zinc-500 uppercase tracking-wider dark:bg-zinc-800/50 dark:border-zinc-800 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3">Lead & Title</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Score & Priority</th>
                  <th className="px-4 py-3">Follow-up Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {leads.map((lead) => (
                  <tr 
                    key={lead.id} 
                    className="hover:bg-zinc-50/75 transition-colors dark:hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/leads/${lead.id}`} className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
                        {lead.name}
                      </Link>
                      <div className="text-[11px] text-zinc-400">{lead.job_title || lead.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                        <Building2 className="h-3 w-3 text-zinc-400" />
                        <span>{lead.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-zinc-500">
                        <Calendar className="h-3 w-3 text-zinc-400" />
                        <span>{lead.event_name || "General Booth"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ScoreIndicator score={lead.lead_score} />
                        <PriorityBadge priority={lead.priority} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={lead.follow_up_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-zinc-100"
                      >
                        View & Actions <ChevronRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800 my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Capture New Event Lead</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Use AI text extraction or manually enter lead credentials.</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* AI Quick Intake */}
              <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 dark:bg-zinc-800/40 dark:border-zinc-700 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                    AI Note Intake (Paste notes or transcript)
                  </label>
                  <button
                    type="button"
                    onClick={handleAIExtract}
                    disabled={extracting || !rawText.trim()}
                    className="text-[11px] font-medium px-2 py-1 rounded bg-zinc-900 text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
                  >
                    {extracting ? "Extracting..." : "Auto-Fill Fields"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="e.g. Met Alex from Apex Data. He leads engineering, email is alex@apex.io. Looking for a demo next Tuesday..."
                  className="w-full p-2 text-xs bg-white border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-900 dark:border-zinc-700"
                />
              </div>

              {/* Duplicate Warning */}
              {duplicateWarning && (
                <div className="p-3.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-900 text-xs dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-300 space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    Possible Duplicate Detected
                  </div>
                  <p>A lead with matching email or name/company already exists:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    {duplicateWarning.matches.map((m) => (
                      <li key={m.id}>
                        <Link href={`/leads/${m.id}`} className="underline font-medium">
                          {m.name} ({m.company}) - {m.email}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleCreateLead(true)}
                      className="px-2.5 py-1 bg-amber-800 text-white rounded text-[11px] hover:bg-amber-900 font-medium"
                    >
                      Create Anyway
                    </button>
                    <button
                      type="button"
                      onClick={() => setDuplicateWarning(null)}
                      className="px-2.5 py-1 border border-amber-300 rounded text-[11px] hover:bg-amber-100 dark:hover:bg-amber-900/50"
                    >
                      Edit Info
                    </button>
                  </div>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="Marcus Vance"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Company *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="AeroCloud Systems"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="m.vance@aerocloud.io"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="VP of Revenue Operations"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Associated Event
                  </label>
                  <select
                    value={formData.event_id}
                    onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="">Select Event...</option>
                    {events.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                    placeholder="+1 (415) 890-4122"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    Interaction Notes & Context
                  </label>
                  <button
                    type="button"
                    onClick={handleAIScore}
                    disabled={analyzingScore || !formData.notes.trim()}
                    className="text-[11px] text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 flex items-center gap-1 disabled:opacity-40"
                  >
                    <Sparkles className="h-3 w-3" />
                    {analyzingScore ? "Scoring..." : "AI Auto-Score Intent"}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Key conversation highlights, pain points discussed, timeline mentioned..."
                  className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              {/* Priority & Score Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Lead Score (0-100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.lead_score}
                    onChange={(e) => setFormData({ ...formData, lead_score: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Follow-up Status
                  </label>
                  <select
                    value={formData.follow_up_status}
                    onChange={(e) => setFormData({ ...formData, follow_up_status: e.target.value as any })}
                    className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Follow-up scheduled">Follow-up scheduled</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Completed">Completed</option>
                    <option value="Not interested">Not interested</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleCreateLead(false)}
                className="px-4 py-1.5 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
              >
                {submitting ? "Saving..." : "Save Lead"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
