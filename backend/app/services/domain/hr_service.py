from datetime import datetime, timezone
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.domain_entities import CandidateApplication
from app.models.audit import AuditLog
from app.services.engines.decision_engine import DecisionEngine


class HRService:
    """
    Business Domain Service: Candidate Screening & Talent Intelligence.
    """

    @staticmethod
    async def screen_candidate(db: Session, candidate_data: Dict[str, Any]) -> Dict[str, Any]:
        # Evaluate via DecisionEngine
        eval_res = await DecisionEngine.evaluate_and_route(
            db=db,
            domain="recruitment",
            input_data=candidate_data,
            actor_id="recruitment_agent"
        )

        ai_out = eval_res["ai_output"]
        cand = CandidateApplication(
            candidate_name=candidate_data.get("candidate_name", "Applicant"),
            candidate_email=candidate_data.get("candidate_email", "applicant@example.com"),
            job_title=candidate_data.get("job_title", "Software Engineer"),
            years_experience=float(candidate_data.get("min_years_experience", 3.0)),
            skills=ai_out.get("skills_found", []),
            resume_text=candidate_data.get("resume_text", ""),
            overall_score=float(ai_out.get("candidate_score", 0.0)),
            skills_match_score=float(ai_out.get("skills_match", 0.0)),
            risk_level=ai_out.get("risk", "low"),
            recommendation=ai_out.get("recommendation", "review"),
            ai_analysis_summary=ai_out.get("reasoning", ""),
            status="screened"
        )
        db.add(cand)
        db.commit()
        db.refresh(cand)

        return {
            "candidate_id": cand.id,
            "candidate_name": cand.candidate_name,
            "evaluation": eval_res
        }
