from datetime import datetime, timedelta
from app.db.session import SessionLocal, Base, engine
from app.models.entities import Event, Lead, Interaction, FollowUp

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if data already exists
    if db.query(Lead).count() > 0:
        print("Database already has records. Skipping seed.")
        db.close()
        return

    print("Seeding realistic B2B event data...")

    # Events
    now = datetime.utcnow()
    e1 = Event(
        name="SaaS Growth Summit 2026",
        location="San Francisco, CA (Moscone Center)",
        date=now - timedelta(days=4),
        description="Premier gathering of 3,500+ B2B software founders, revenue executives, and product leaders."
    )
    e2 = Event(
        name="Enterprise AI World Expo",
        location="Austin, TX (Austin Convention Center)",
        date=now - timedelta(days=1),
        description="Enterprise conference focusing on deploying generative AI and automation at scale."
    )
    e3 = Event(
        name="Fintech Connect 2026",
        location="New York, NY (Javits Center)",
        date=now + timedelta(days=14),
        description="Connecting leaders in banking, compliance, risk technology, and modern financial infrastructure."
    )

    db.add_all([e1, e2, e3])
    db.commit()
    db.refresh(e1)
    db.refresh(e2)
    db.refresh(e3)

    # Leads
    l1 = Lead(
        name="Marcus Vance",
        company="AeroCloud Systems",
        email="m.vance@aerocloud.io",
        job_title="VP of Revenue Operations",
        phone="+1 (415) 890-4122",
        linkedin_url="https://linkedin.com/in/marcusvance-revops",
        lead_source="Booth Demo Session",
        event_id=e1.id,
        event_name=e1.name,
        notes="Stopped by booth during morning keynote break. Looking to replace their scattered spreadsheet follow-up system across 14 field sales reps. Asked about direct Salesforce synchronization and multi-seat pricing. Wants to loop in their Sales VP by Thursday.",
        priority="High",
        lead_score=92,
        follow_up_status="Follow-up scheduled",
        next_follow_up_date=now + timedelta(hours=4)
    )

    l2 = Lead(
        name="Elena Rostova",
        company="Synthetix Automation",
        email="elena.r@synthetix.tech",
        job_title="Head of Engineering",
        phone="+1 (512) 330-9811",
        linkedin_url="https://linkedin.com/in/elenarostova-tech",
        lead_source="Keynote Q&A",
        event_id=e2.id,
        event_name=e2.name,
        notes="Engaged in deep conversation about our data extraction pipeline and security guarantees for sensitive notes. Has an engineering team of 40. Wants technical documentation on privacy and API integration limits.",
        priority="High",
        lead_score=88,
        follow_up_status="Pending",
        next_follow_up_date=now - timedelta(days=1)  # Overdue
    )

    l3 = Lead(
        name="David Chen",
        company="Beacon Financial Group",
        email="dchen@beaconfg.com",
        job_title="Director of Strategic Alliances",
        phone="+1 (212) 555-0199",
        linkedin_url="https://linkedin.com/in/davidchen-alliances",
        lead_source="Networking Mixer",
        event_id=e1.id,
        event_name=e1.name,
        notes="Met at the VIP evening reception. Discussed potential co-marketing and bundle opportunities for mutual fintech clients. Needs a deck highlighting partnership tiers and joint customer case studies.",
        priority="Medium",
        lead_score=71,
        follow_up_status="Contacted",
        next_follow_up_date=now + timedelta(days=3)
    )

    l4 = Lead(
        name="Sarah Jenkins",
        company="Klaro Logistics",
        email="sjenkins@klarologistics.com",
        job_title="Operations Lead",
        phone="+1 (312) 441-2090",
        linkedin_url="https://linkedin.com/in/sarahjenkins-ops",
        lead_source="Event Booth",
        event_id=e2.id,
        event_name=e2.name,
        notes="Curious about lead capture at their regional supply chain expos. Currently evaluating if an AI tool is overkill compared to their simple web forms. Keep on nurture list.",
        priority="Low",
        lead_score=42,
        follow_up_status="Pending",
        next_follow_up_date=now + timedelta(days=7)
    )

    l5 = Lead(
        name="Tariq Al-Mansoor",
        company="Apex Data Partners",
        email="tariq@apexdatapartners.com",
        job_title="Chief Technology Officer",
        phone="+1 (650) 902-1144",
        linkedin_url="https://linkedin.com/in/tariq-almansoor",
        lead_source="Speaker Green Room",
        event_id=e2.id,
        event_name=e2.name,
        notes="Discussed enterprise licensing for 50+ event reps worldwide. Requested custom enterprise SOC2 report and a private deployment walkthrough. Immediate high-value prospect.",
        priority="High",
        lead_score=96,
        follow_up_status="Follow-up scheduled",
        next_follow_up_date=now + timedelta(hours=2)
    )

    l6 = Lead(
        name="Chloe Dupont",
        company="Vanguard Life Sciences",
        email="cdupont@vanguard-ls.com",
        job_title="Commercial Strategy Lead",
        phone="+1 (617) 492-3838",
        linkedin_url="https://linkedin.com/in/chloedupont-strategy",
        lead_source="Event Booth",
        event_id=e1.id,
        event_name=e1.name,
        notes="Attended demo of note summarization. Successfully scheduled post-event demo for next Tuesday. Completed initial outreach.",
        priority="Medium",
        lead_score=76,
        follow_up_status="Completed",
        next_follow_up_date=None
    )

    db.add_all([l1, l2, l3, l4, l5, l6])
    db.commit()

    for lead in [l1, l2, l3, l4, l5, l6]:
        db.refresh(lead)

    # Initial interactions and follow-ups
    i1 = Interaction(
        lead_id=l1.id,
        type="Lead Captured",
        summary="Met at SaaS Growth Summit booth during break",
        details="Discussed 14-rep team requirement and Salesforce integration."
    )
    i2 = Interaction(
        lead_id=l1.id,
        type="AI Generated",
        summary="AI Analysis: High buying intent with near-term executive decision timeline."
    )
    fu1 = FollowUp(
        lead_id=l1.id,
        due_date=now + timedelta(hours=4),
        status="Pending",
        action_type="Demo",
        notes="Provide live walkthrough focusing on multi-seat team management.",
        generated_subject="Following up from SaaS Growth Summit 2026 - AeroCloud Systems",
        generated_body=f"Hi Marcus,\n\nIt was great speaking with you earlier today at SaaS Growth Summit. I enjoyed hearing about your growth at AeroCloud Systems and your goals for streamlining field sales workflows.\n\nPer our conversation, I'd love to coordinate a 20-minute walkthrough tailored to your 14 field reps and show how our Salesforce sync operates in real-time.\n\nWould Thursday at 2 PM PT work for your team?\n\nBest regards,\n[Your Name]"
    )

    i3 = Interaction(
        lead_id=l2.id,
        type="Lead Captured",
        summary="Technical discussion following keynote on agent reliability"
    )
    fu2 = FollowUp(
        lead_id=l2.id,
        due_date=now - timedelta(days=1),
        status="Pending",
        action_type="Email",
        notes="Send API documentation and architecture overview regarding privacy."
    )

    fu3 = FollowUp(
        lead_id=l5.id,
        due_date=now + timedelta(hours=2),
        status="Pending",
        action_type="Call",
        notes="Executive alignment call regarding SOC2 report and enterprise licensing."
    )

    db.add_all([i1, i2, fu1, i3, fu2, fu3])
    db.commit()
    db.close()
    print("Database successfully seeded with realistic B2B records.")

if __name__ == "__main__":
    seed()
