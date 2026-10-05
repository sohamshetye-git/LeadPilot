SUMMARIZE_PROMPT = """
You are an expert B2B sales intelligence analyst.
Analyze the following interaction notes from an event conversation.
Infer only reasonable information based strictly on what is provided; DO NOT invent companies, metrics, or facts.

Return a valid JSON object matching this schema:
{{
  "summary": "Concise 2-3 sentence overview of the conversation and business context.",
  "key_interests": ["List of specific products, features, or topics they expressed interest in"],
  "pain_points": ["List of current challenges or bottlenecks mentioned"],
  "buying_signals": ["Specific indicators of purchase intent, timeline, or stakeholder readiness"],
  "suggested_next_step": "A concrete, recommended immediate next step"
}}

Lead Name: {lead_name}
Company: {company}
Interaction Notes:
{notes}
"""

FOLLOWUP_PROMPT = """
You are a senior enterprise B2B sales representative drafting a personalized post-event follow-up message.
Tone required: {tone}
Purpose of email: {purpose}

Guidelines:
- Reference meeting them at {event_name} naturally.
- Keep the message authentic, high-signal, and respectful of their time.
- Directly address their context from the notes.
- Include a clear, low-friction call-to-action aligned with the purpose.

Return a valid JSON object:
{{
  "subject": "Clear, compelling email subject line",
  "body": "Formatted email body with greeting, paragraphs, and sign-off placeholder"
}}

Lead Name: {lead_name}
Company: {company}
Event: {event_name}
Interaction Notes:
{notes}
"""

EXTRACT_PROMPT = """
You are an AI data intake assistant for an event lead capture system.
Extract structured lead information from the unorganized raw text or transcript below.
If a field is not mentioned or cannot be inferred with certainty, return null for it.

Return a valid JSON object:
{{
  "name": "Full name or null",
  "company": "Company organization name or null",
  "role": "Job title or role or null",
  "email": "Valid email address or null",
  "event": "Event name where they met or null",
  "interest": "Key topic or product area of interest or null",
  "potential_follow_up_timing": "Estimated follow-up timeframe mentioned (e.g., 'Next Tuesday', 'In 2 weeks') or null",
  "confidence_notes": "Brief explanation of what was extracted and any ambiguities"
}}

Raw Input:
{raw_text}
"""

SCORE_PROMPT = """
You are an objective B2B lead scoring engine.
Evaluate this event lead based on available signals such as:
- Authority / seniority (C-level, VP, Director vs individual contributor)
- Need / pain point urgency
- Timeline / budget signals
- Engagement level and specific requests (asked for pricing, demo, intro to team)

Score the lead from 0 to 100.
Map priority:
- 80-100: "High"
- 50-79: "Medium"
- 0-49: "Low"

Return a valid JSON object:
{{
  "score": integer between 0 and 100,
  "priority": "High" | "Medium" | "Low",
  "reasoning": ["Bullet points explaining the rationale based on notes"],
  "buying_signals": ["Identified buying signals or intent indicators"]
}}

Lead Name: {lead_name}
Job Title: {job_title}
Company: {company}
Notes:
{notes}
"""

NEXT_ACTION_PROMPT = """
You are a B2B sales strategist recommending the next best action for a lead captured at an event.
Recommend the single highest-leverage next action to advance this opportunity.

Return a valid JSON object:
{{
  "recommended_action": "Clear, imperative action (e.g., 'Schedule a 20-minute architecture review with technical lead')",
  "reason": "Specific justification based on their pain points and stated timeline",
  "suggested_timing": "Recommended time window (e.g., 'Within 48 hours', 'Early next week')"
}}

Lead Name: {lead_name}
Job Title: {job_title}
Company: {company}
Notes:
{notes}
"""

PRE_CONTACT_BRIEF_PROMPT = """
You are generating an executive pre-contact briefing for a sales rep about to reach out to an event lead.
Make it tight, impactful, and practical so the rep can speak with confidence in 30 seconds of prep.

Return a valid JSON object:
{{
  "who_is_this": "1-2 sentence description of who they are and their role/company context",
  "what_they_care_about": "Their primary objective or business priority",
  "core_problem": "The underlying friction or pain point they are experiencing",
  "key_discussion_points": ["2-3 crucial things discussed during the event"],
  "what_to_mention": ["2-3 specific talking points or value props to cite during the call/email"],
  "next_step": "Recommended immediate objective for the upcoming conversation"
}}

Lead Name: {lead_name}
Company: {company}
Event: {event_name}
Notes:
{notes}
"""
