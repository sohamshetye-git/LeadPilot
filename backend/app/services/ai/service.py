import re
from typing import Optional
from app.services.ai.client import gemini_client
from app.services.ai.prompts import (
    SUMMARIZE_PROMPT,
    FOLLOWUP_PROMPT,
    EXTRACT_PROMPT,
    SCORE_PROMPT,
    NEXT_ACTION_PROMPT,
    PRE_CONTACT_BRIEF_PROMPT
)
from app.schemas.schemas import (
    AISummaryResult,
    AIFollowUpResult,
    AIExtractResult,
    AIScoreResult,
    AINextActionResult,
    AIPreContactBriefResult
)


class AIService:
    @staticmethod
    def summarize(notes: str, lead_name: Optional[str] = "", company: Optional[str] = "") -> AISummaryResult:
        prompt = SUMMARIZE_PROMPT.format(
            notes=notes,
            lead_name=lead_name or "Lead",
            company=company or "Company"
        )
        data = gemini_client.generate_json(prompt)
        if data and "summary" in data:
            return AISummaryResult(
                summary=data.get("summary", ""),
                key_interests=data.get("key_interests", []),
                pain_points=data.get("pain_points", []),
                buying_signals=data.get("buying_signals", []),
                suggested_next_step=data.get("suggested_next_step", "")
            )
        
        # Rule-based fallback when offline / no API key configured
        sentences = [s.strip() for s in notes.split(".") if s.strip()]
        first_few = ". ".join(sentences[:2]) + ("." if sentences else "")
        return AISummaryResult(
            summary=first_few or "Conversation recorded during event interaction.",
            key_interests=["Product exploration", "Operational efficiency"],
            pain_points=["Manual workflows", "Scalability constraints"],
            buying_signals=["Requested follow-up discussion"],
            suggested_next_step="Send introduction note and outline relevant product capabilities."
        )

    @staticmethod
    def generate_followup(
        lead_name: str,
        company: str,
        event_name: Optional[str] = "",
        notes: Optional[str] = "",
        tone: str = "Professional",
        purpose: str = "Schedule demo"
    ) -> AIFollowUpResult:
        prompt = FOLLOWUP_PROMPT.format(
            lead_name=lead_name,
            company=company,
            event_name=event_name or "the event",
            notes=notes or "Met and discussed business collaboration.",
            tone=tone,
            purpose=purpose
        )
        data = gemini_client.generate_json(prompt)
        if data and "subject" in data and "body" in data:
            return AIFollowUpResult(
                subject=data.get("subject", ""),
                body=data.get("body", "")
            )

        # High-quality fallback template tailored to tone & purpose
        event_ref = f" at {event_name}" if event_name else ""
        subject = f"Following up from our conversation{event_ref} - {company}"
        body = (
            f"Hi {lead_name},\n\n"
            f"It was great speaking with you{event_ref}. I enjoyed learning more about your focus at {company}.\n\n"
            f"Following up on our discussion regarding your team's goals, I'd welcome the chance to continue the conversation. "
            f"Would you be open to a brief 15-minute sync next week to explore how we can support {company}?\n\n"
            f"Best regards,\n[Your Name]"
        )
        return AIFollowUpResult(subject=subject, body=body)

    @staticmethod
    def extract_lead(raw_text: str) -> AIExtractResult:
        prompt = EXTRACT_PROMPT.format(raw_text=raw_text)
        data = gemini_client.generate_json(prompt)
        if data and isinstance(data, dict):
            return AIExtractResult(
                name=data.get("name"),
                company=data.get("company"),
                role=data.get("role"),
                email=data.get("email"),
                event=data.get("event"),
                interest=data.get("interest"),
                potential_follow_up_timing=data.get("potential_follow_up_timing"),
                confidence_notes=data.get("confidence_notes", "Extracted via Gemini AI.")
            )

        # Heuristic fallback parser
        email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', raw_text)
        email = email_match.group(0) if email_match else None
        
        return AIExtractResult(
            name=None,
            company=None,
            role=None,
            email=email,
            event=None,
            interest=None,
            potential_follow_up_timing="Next week",
            confidence_notes="Extracted basic contact details. Please review and fill in remaining fields."
        )

    @staticmethod
    def score_lead(
        notes: str,
        lead_name: Optional[str] = "",
        company: Optional[str] = "",
        job_title: Optional[str] = ""
    ) -> AIScoreResult:
        prompt = SCORE_PROMPT.format(
            notes=notes,
            lead_name=lead_name or "Lead",
            job_title=job_title or "Role",
            company=company or "Company"
        )
        data = gemini_client.generate_json(prompt)
        if data and "score" in data and "priority" in data:
            return AIScoreResult(
                score=max(0, min(100, int(data.get("score", 50)))),
                priority=data.get("priority", "Medium"),
                reasoning=data.get("reasoning", []),
                buying_signals=data.get("buying_signals", [])
            )

        # Rule-based fallback scoring
        score = 65
        text_lower = (notes + " " + (job_title or "")).lower()
        reasons = []
        signals = []

        if any(w in text_lower for w in ["cto", "vp", "director", "head of", "founder", "ceo"]):
            score += 15
            reasons.append("High decision-making authority indicated by seniority")
        if any(w in text_lower for w in ["pricing", "budget", "cost", "quote"]):
            score += 10
            signals.append("Pricing or commercial evaluation requested")
        if any(w in text_lower for w in ["next week", "urgent", "soon", "asap", "demo"]):
            score += 10
            signals.append("Clear near-term evaluation timeline")

        score = min(score, 95)
        priority = "High" if score >= 80 else ("Medium" if score >= 50 else "Low")
        if not reasons:
            reasons.append("Active interaction recorded at company event booth")
        if not signals:
            signals.append("Expressed general interest in solution capabilities")

        return AIScoreResult(
            score=score,
            priority=priority,
            reasoning=reasons,
            buying_signals=signals
        )

    @staticmethod
    def recommend_next_action(
        lead_name: str,
        company: str,
        notes: Optional[str] = "",
        job_title: Optional[str] = ""
    ) -> AINextActionResult:
        prompt = NEXT_ACTION_PROMPT.format(
            lead_name=lead_name,
            company=company,
            job_title=job_title or "Role",
            notes=notes or ""
        )
        data = gemini_client.generate_json(prompt)
        if data and "recommended_action" in data:
            return AINextActionResult(
                recommended_action=data.get("recommended_action", ""),
                reason=data.get("reason", ""),
                suggested_timing=data.get("suggested_timing", "Within 48 hours")
            )

        return AINextActionResult(
            recommended_action=f"Send custom briefing deck and propose a 15-minute discovery call.",
            reason="Maintain momentum following initial event conversation.",
            suggested_timing="Within 48 hours"
        )

    @staticmethod
    def pre_contact_brief(
        lead_name: str,
        company: str,
        event_name: Optional[str] = "",
        notes: Optional[str] = ""
    ) -> AIPreContactBriefResult:
        prompt = PRE_CONTACT_BRIEF_PROMPT.format(
            lead_name=lead_name,
            company=company,
            event_name=event_name or "Event",
            notes=notes or ""
        )
        data = gemini_client.generate_json(prompt)
        if data and "who_is_this" in data:
            return AIPreContactBriefResult(
                who_is_this=data.get("who_is_this", ""),
                what_they_care_about=data.get("what_they_care_about", ""),
                core_problem=data.get("core_problem", ""),
                key_discussion_points=data.get("key_discussion_points", []),
                what_to_mention=data.get("what_to_mention", []),
                next_step=data.get("next_step", "")
            )

        return AIPreContactBriefResult(
            who_is_this=f"Key contact from {company} met at {event_name or 'the conference'}.",
            what_they_care_about="Improving operational efficiency and evaluating suitable technology partners.",
            core_problem="Current processes involve friction or manual coordination.",
            key_discussion_points=["Event interaction", "High-level requirements", "Next quarter roadmap"],
            what_to_mention=["Specific points raised during meeting", "Case studies in their domain"],
            next_step="Confirm mutual availability for a quick walkthrough."
        )


ai_service = AIService()
