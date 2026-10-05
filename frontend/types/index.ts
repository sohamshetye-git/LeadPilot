export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  job_title?: string;
  phone?: string;
  linkedin_url?: string;
  lead_source: string;
  event_id?: string;
  event_name?: string;
  notes?: string;
  priority: 'High' | 'Medium' | 'Low';
  lead_score: number;
  follow_up_status: 'Pending' | 'Contacted' | 'Follow-up scheduled' | 'Completed' | 'Not interested';
  next_follow_up_date?: string;
  created_at: string;
  updated_at: string;
  interactions?: Interaction[];
  follow_ups?: FollowUp[];
  ai_insights?: AIInsight[];
}

export interface Interaction {
  id: string;
  lead_id: string;
  type: string;
  summary: string;
  details?: string;
  created_at: string;
}

export interface FollowUp {
  id: string;
  lead_id: string;
  due_date?: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  action_type: 'Email' | 'Demo' | 'Call' | 'LinkedIn';
  notes?: string;
  generated_subject?: string;
  generated_body?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  lead_name?: string;
  lead_company?: string;
}

export interface AIInsight {
  id: string;
  lead_id: string;
  insight_type: string;
  content: string;
  created_at: string;
}

export interface EventItem {
  id: string;
  name: string;
  location?: string;
  date?: string;
  description?: string;
  lead_count?: number;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_leads: number;
  high_priority_count: number;
  follow_ups_due_today: number;
  overdue_follow_ups: number;
  completed_follow_ups: number;
  avg_lead_score: number;
  leads_by_status: Record<string, number>;
  leads_by_priority: Record<string, number>;
  attention_leads: Lead[];
  upcoming_follow_ups: FollowUp[];
  event_performance: Array<{
    id: string;
    name: string;
    date?: string;
    location?: string;
    leads_count: number;
    high_priority_count: number;
    qualified_count: number;
    completed_count: number;
  }>;
}

export interface DuplicateCheckResult {
  is_duplicate: boolean;
  matches: Array<{
    id: string;
    name: string;
    company: string;
    email: string;
    match_reason: string;
  }>;
}

export interface AISummaryResult {
  summary: string;
  key_interests: string[];
  pain_points: string[];
  buying_signals: string[];
  suggested_next_step: string;
}

export interface AIFollowUpResult {
  subject: string;
  body: string;
}

export interface AIExtractResult {
  name?: string;
  company?: string;
  role?: string;
  email?: string;
  event?: string;
  interest?: string;
  potential_follow_up_timing?: string;
  confidence_notes?: string;
}

export interface AIScoreResult {
  score: number;
  priority: 'High' | 'Medium' | 'Low';
  reasoning: string[];
  buying_signals: string[];
}

export interface AINextActionResult {
  recommended_action: string;
  reason: string;
  suggested_timing: string;
}

export interface AIPreContactBriefResult {
  who_is_this: string;
  what_they_care_about: string;
  core_problem: string;
  key_discussion_points: string[];
  what_to_mention: string[];
  next_step: string;
}
