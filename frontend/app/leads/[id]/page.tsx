"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Building2, 
  Mail, 
  Phone, 
  Calendar, 
  Globe, 
  ArrowLeft, 
  Trash2, 
  Edit3, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Clock, 
  Activity,
  Compass,
  FileText,
  AlertCircle
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { 
  Lead, 
  AISummaryResult, 
  AIFollowUpResult, 
  AINextActionResult, 
  AIPreContactBriefResult 
} from "@/types";
import { PriorityBadge, StatusBadge, ScoreIndicator } from "@/components/Badges";

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Feature States
  const [summaryData, setSummaryData] = useState<AISummaryResult | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  const [nextActionData, setNextActionData] = useState<AINextActionResult | null>(null);
  const [fetchingAction, setFetchingAction] = useState(false);

  const [briefData, setBriefData] = useState<AIPreContactBriefResult | null>(null);
  const [generatingBrief, setGeneratingBrief] = useState(false);

  // Follow-up Generation Modal/Drawer State
  const [followUpTone, setFollowUpTone] = useState("Professional");
  const [followUpPurpose, setFollowUpPurpose] = useState("Schedule demo");
  const [followUpDraft, setFollowUpDraft] = useState<AIFollowUpResult | null>(null);
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // New Interaction state
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit status state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  async function loadLead() {
    try {
      setLoading(true);
      const data = await fetchApi<Lead>(`/leads/${leadId}`);
      setLead(data);
    } catch (err: any) {
      setError(err.message || "Failed to load lead details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (leadId) {
      loadLead();
    }
  }, [leadId]);

  async function handleSummarize() {
    if (!lead) return;
    try {
      setSummarizing(true);
      const res = await fetchApi<AISummaryResult>("/ai/summarize", {
        method: "POST",
        body: JSON.stringify({
          notes: lead.notes || "Lead captured during event.",
          lead_name: lead.name,
          company: lead.company
        })
      });
      setSummaryData(res);
    } catch (err: any) {
      alert("Failed to summarize notes: " + err.message);
    } finally {
      setSummarizing(false);
    }
  }

  async function handleNextAction() {
    if (!lead) return;
    try {
      setFetchingAction(true);
      const res = await fetchApi<AINextActionResult>("/ai/next-action", {
        method: "POST",
        body: JSON.stringify({
          lead_name: lead.name,
          company: lead.company,
          notes: lead.notes,
          job_title: lead.job_title
        })
      });
      setNextActionData(res);
    } catch (err: any) {
      alert("Failed to calculate next best action: " + err.message);
    } finally {
      setFetchingAction(false);
    }
  }

  async function handlePreContactBrief() {
    if (!lead) return;
    try {
      setGeneratingBrief(true);
      const res = await fetchApi<AIPreContactBriefResult>("/ai/brief", {
        method: "POST",
        body: JSON.stringify({
          lead_name: lead.name,
          company: lead.company,
          event_name: lead.event_name,
          notes: lead.notes
        })
      });
      setBriefData(res);
    } catch (err: any) {
      alert("Failed to compile pre-contact brief: " + err.message);
    } finally {
      setGeneratingBrief(false);
    }
  }

  async function handleGenerateFollowUp() {
    if (!lead) return;
    try {
      setGeneratingDraft(true);
      const res = await fetchApi<AIFollowUpResult>("/ai/follow-up", {
        method: "POST",
        body: JSON.stringify({
          lead_name: lead.name,
          company: lead.company,
          event_name: lead.event_name,
          notes: lead.notes,
          tone: followUpTone,
          purpose: followUpPurpose
        })
      });
      setFollowUpDraft(res);
    } catch (err: any) {
      alert("Failed to generate follow-up draft: " + err.message);
    } finally {
      setGeneratingDraft(false);
    }
  }

  async function handleAddInteraction() {
    if (!newNote.trim()) return;
    try {
      setAddingNote(true);
      await fetchApi(`/leads/${leadId}/interactions`, {
        method: "POST",
        body: JSON.stringify({
          type: "Note Added",
          summary: newNote.slice(0, 80),
          details: newNote
        })
      });
      setNewNote("");
      loadLead();
    } catch (err: any) {
      alert("Failed to record interaction: " + err.message);
    } finally {
      setAddingNote(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    try {
      setUpdatingStatus(true);
      await fetchApi(`/leads/${leadId}`, {
        method: "PATCH",
        body: JSON.stringify({ follow_up_status: newStatus })
      });
      loadLead();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  async function handleDeleteLead() {
    try {
      setDeleting(true);
      await fetchApi(`/leads/${leadId}`, { method: "DELETE" });
      router.push("/leads");
    } catch (err: any) {
      alert("Failed to delete lead: " + err.message);
      setDeleting(false);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 animate-pulse">
        <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 bg-zinc-100 dark:bg-zinc-900 rounded-xl"></div>
          <div className="h-96 bg-zinc-100 dark:bg-zinc-900 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !lead) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 text-xs">
          <p className="font-semibold">Lead not found or error loading data.</p>
          <Link href="/leads" className="underline mt-2 inline-block">Return to leads table</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/leads"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Leads
        </Link>
        <div className="flex items-center gap-2">
          <select
            value={lead.follow_up_status}
            disabled={updatingStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="text-xs bg-white border border-zinc-200 rounded-md px-2.5 py-1.5 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300 font-medium shadow-xs"
          >
            <option value="Pending">Status: Pending</option>
            <option value="Contacted">Status: Contacted</option>
            <option value="Follow-up scheduled">Status: Follow-up scheduled</option>
            <option value="Completed">Status: Completed</option>
            <option value="Not interested">Status: Not interested</option>
          </select>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md border border-rose-200 transition dark:hover:bg-rose-950/30 dark:border-rose-900/50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details/Timeline, Right AI Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Lead Info + Conversation + Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                  {lead.name}
                </h1>
                <p className="text-xs text-zinc-500 font-medium mt-0.5">
                  {lead.job_title ? `${lead.job_title} at ` : ""}{lead.company}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <ScoreIndicator score={lead.lead_score} />
                <PriorityBadge priority={lead.priority} />
                <StatusBadge status={lead.follow_up_status} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-zinc-100 text-xs dark:border-zinc-800">
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Mail className="h-3.5 w-3.5 text-zinc-400" />
                <a href={`mailto:${lead.email}`} className="hover:underline">{lead.email}</a>
              </div>
              {lead.phone && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Phone className="h-3.5 w-3.5 text-zinc-400" />
                  <span>{lead.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                <span>Met at: {lead.event_name || "Booth interaction"}</span>
              </div>
              {lead.linkedin_url && (
                <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300">
                  <Globe className="h-3.5 w-3.5 text-zinc-400" />
                  <a href={lead.linkedin_url} target="_blank" rel="noreferrer" className="text-zinc-600 hover:underline">
                    LinkedIn Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Conversation Notes */}
          <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
                <FileText className="h-4 w-4" /> Interaction Notes
              </h2>
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-zinc-900 text-white hover:bg-zinc-800 transition dark:bg-zinc-100 dark:text-zinc-900"
              >
                <Sparkles className="h-3 w-3" />
                {summarizing ? "Analyzing..." : "Generate AI Breakdown"}
              </button>
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed bg-zinc-50 p-3.5 rounded-lg border border-zinc-100 dark:bg-zinc-800/50 dark:border-zinc-800">
              {lead.notes || "No notes recorded yet."}
            </p>

            {/* AI Summary Breakdown Card if generated */}
            {summaryData && (
              <div className="mt-4 p-4 rounded-lg bg-zinc-50/80 border border-zinc-200 text-xs space-y-3 dark:bg-zinc-800/40 dark:border-zinc-700">
                <div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">Summary: </span>
                  <span className="text-zinc-700 dark:text-zinc-300">{summaryData.summary}</span>
                </div>
                {summaryData.key_interests?.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Key Interests: </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{summaryData.key_interests.join(", ")}</span>
                  </div>
                )}
                {summaryData.buying_signals?.length > 0 && (
                  <div>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Buying Signals: </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{summaryData.buying_signals.join(", ")}</span>
                  </div>
                )}
                {summaryData.suggested_next_step && (
                  <div className="pt-2 border-t border-zinc-200 dark:border-zinc-700 font-medium text-zinc-900 dark:text-zinc-100">
                    Recommended Next Step: {summaryData.suggested_next_step}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline & Interactions */}
          <div className="p-6 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Activity Timeline
            </h2>

            {/* Add note input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add an interaction note or call update..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
              <button
                onClick={handleAddInteraction}
                disabled={addingNote || !newNote.trim()}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-md disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
              >
                {addingNote ? "Adding..." : "Log Note"}
              </button>
            </div>

            {/* Timeline Events */}
            <div className="space-y-3 pt-2">
              {lead.interactions && lead.interactions.length > 0 ? (
                lead.interactions.map((it) => (
                  <div key={it.id} className="flex gap-3 text-xs">
                    <div className="h-2 w-2 rounded-full bg-zinc-400 mt-1.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {it.type}: <span className="font-normal text-zinc-700 dark:text-zinc-300">{it.summary}</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-0.5">
                        {new Date(it.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-500">No interaction history recorded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: AI Next Best Action, Pre-Contact Brief & Follow-up drafter */}
        <div className="space-y-6">
          {/* Next Best Action Card */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                Next Best Action
              </h3>
              <button
                onClick={handleNextAction}
                disabled={fetchingAction}
                className="text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {fetchingAction ? "Analyzing..." : "Refresh"}
              </button>
            </div>

            {nextActionData ? (
              <div className="space-y-2 text-xs">
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {nextActionData.recommended_action}
                </p>
                <p className="text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">Why: </span>
                  {nextActionData.reason}
                </p>
                <div className="inline-block text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  Timing: {nextActionData.suggested_timing}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">
                  Evaluate conversation intent and recommend immediate high-leverage action.
                </p>
                <button
                  onClick={handleNextAction}
                  disabled={fetchingAction}
                  className="w-full py-1.5 px-3 text-xs font-medium rounded-md border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition"
                >
                  {fetchingAction ? "Calculating..." : "Compute Next Best Action"}
                </button>
              </div>
            )}
          </div>

          {/* AI Pre-Contact Brief */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
                30-Sec Pre-Contact Brief
              </h3>
            </div>

            {briefData ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <div className="font-medium text-zinc-500 text-[11px]">Contact Context:</div>
                  <div className="text-zinc-800 dark:text-zinc-200">{briefData.who_is_this}</div>
                </div>
                <div>
                  <div className="font-medium text-zinc-500 text-[11px]">Primary Priority:</div>
                  <div className="text-zinc-800 dark:text-zinc-200">{briefData.what_they_care_about}</div>
                </div>
                <div>
                  <div className="font-medium text-zinc-500 text-[11px]">Core Friction:</div>
                  <div className="text-zinc-800 dark:text-zinc-200">{briefData.core_problem}</div>
                </div>
                <div>
                  <div className="font-medium text-zinc-500 text-[11px]">Talking Points to Mention:</div>
                  <ul className="list-disc list-inside text-zinc-700 dark:text-zinc-300 space-y-0.5">
                    {briefData.what_to_mention.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-zinc-500">
                  Get a concise briefing on what this lead cares about before jumping on a call or email.
                </p>
                <button
                  onClick={handlePreContactBrief}
                  disabled={generatingBrief}
                  className="w-full py-1.5 px-3 text-xs font-medium rounded-md border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800 transition"
                >
                  {generatingBrief ? "Compiling..." : "Generate Pre-Contact Brief"}
                </button>
              </div>
            )}
          </div>

          {/* AI Follow-Up Generator */}
          <div className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900/50 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
              <Send className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
              AI Follow-Up Drafter
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-zinc-500 mb-0.5 block">Tone</label>
                <select
                  value={followUpTone}
                  onChange={(e) => setFollowUpTone(e.target.value)}
                  className="w-full p-1.5 bg-zinc-50 border border-zinc-200 rounded text-xs dark:bg-zinc-800 dark:border-zinc-700"
                >
                  <option value="Professional">Professional</option>
                  <option value="Friendly">Friendly</option>
                  <option value="Concise">Concise</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 mb-0.5 block">Purpose</label>
                <select
                  value={followUpPurpose}
                  onChange={(e) => setFollowUpPurpose(e.target.value)}
                  className="w-full p-1.5 bg-zinc-50 border border-zinc-200 rounded text-xs dark:bg-zinc-800 dark:border-zinc-700"
                >
                  <option value="Schedule demo">Schedule demo</option>
                  <option value="General follow-up">General follow-up</option>
                  <option value="Pricing discussion">Pricing discussion</option>
                  <option value="Send information">Send information</option>
                  <option value="Reconnect">Reconnect</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateFollowUp}
              disabled={generatingDraft}
              className="w-full py-1.5 px-3 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
            >
              {generatingDraft ? "Drafting Email..." : "Draft Personalized Follow-Up"}
            </button>

            {followUpDraft && (
              <div className="mt-3 p-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs space-y-2 dark:bg-zinc-800/40 dark:border-zinc-700">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5 dark:border-zinc-700">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate pr-2">
                    {followUpDraft.subject}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`Subject: ${followUpDraft.subject}\n\n${followUpDraft.body}`)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {copiedDraft ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                    {copiedDraft ? "Copied" : "Copy"}
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={followUpDraft.body}
                  onChange={(e) => setFollowUpDraft({ ...followUpDraft, body: e.target.value })}
                  className="w-full p-2 text-xs bg-white border border-zinc-200 rounded font-sans focus:outline-none dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-200"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-zinc-200 p-6 space-y-4 dark:bg-zinc-900 dark:border-zinc-800">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              Delete Lead: {lead.name}?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              This action cannot be undone. All recorded interactions and scheduled follow-ups for this lead will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400"
              >
                Cancel
              </button>
              <button
                disabled={deleting}
                onClick={handleDeleteLead}
                className="px-3 py-1.5 text-xs font-medium bg-rose-600 text-white rounded-md hover:bg-rose-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
