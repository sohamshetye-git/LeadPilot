"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Users, Plus, ArrowRight, X } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { EventItem } from "@/types";

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    description: ""
  });

  async function loadEvents() {
    try {
      setLoading(true);
      const data = await fetchApi<EventItem[]>("/events");
      setEvents(data);
    } catch (err: any) {
      alert("Failed to load events: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function handleCreateEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      setSubmitting(true);
      await fetchApi("/events", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          location: formData.location || null,
          date: formData.date ? new Date(formData.date).toISOString() : null,
          description: formData.description || null
        })
      });
      setShowModal(false);
      setFormData({ name: "", location: "", date: "", description: "" });
      loadEvents();
    } catch (err: any) {
      alert("Failed to create event: " + err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Conferences & Events
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Track lead performance, booth conversations, and follow-up completion by event.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition dark:bg-zinc-50 dark:text-zinc-900"
        >
          <Plus className="h-3.5 w-3.5" /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-8 text-center text-xs text-zinc-500 animate-pulse">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-full p-12 text-center text-xs text-zinc-500 border border-dashed rounded-xl">
            No events tracked yet. Click "Add Event" to start.
          </div>
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="p-5 rounded-xl border border-zinc-200 bg-white shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{ev.name}</h3>
                  <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 shrink-0">
                    <Users className="h-3 w-3" /> {ev.lead_count || 0}
                  </span>
                </div>

                {ev.location && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{ev.location}</span>
                  </div>
                )}

                {ev.date && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                    <span>{new Date(ev.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}

                {ev.description && (
                  <p className="text-xs text-zinc-600 line-clamp-2 pt-1 dark:text-zinc-400">
                    {ev.description}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between dark:border-zinc-800">
                <Link
                  href={`/leads?event_id=${ev.id}`}
                  className="text-xs font-medium text-zinc-900 hover:underline flex items-center gap-1 dark:text-zinc-100"
                >
                  View Leads ({ev.lead_count || 0}) <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-xl border border-zinc-200 overflow-hidden dark:bg-zinc-900 dark:border-zinc-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Add Event</h3>
              <button onClick={() => setShowModal(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. SaaS Growth Summit 2026"
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA (Moscone Center)"
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key audience, booth goals, target accounts..."
                  className="w-full p-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-md focus:outline-none dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 text-xs font-medium bg-zinc-900 text-white rounded-md hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
                >
                  {submitting ? "Saving..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
