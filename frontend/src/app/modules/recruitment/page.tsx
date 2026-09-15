"use client";

import { useState } from "react";
import {
  Users,
  CheckCircle2,
  Sparkles,
  UserCheck,
  Award,
  BookOpen,
  Send,
  Play,
  Briefcase
} from "lucide-react";
import { api } from "@/lib/api";
import { StatusBadge } from "@/components/layout/StatusBadge";

export default function RecruitmentPage() {
  const [candidateName, setCandidateName] = useState("Kiran Patel");
  const [jobTitle, setJobTitle] = useState("Staff Platform Engineer");
  const [resumeText, setResumeText] = useState(
    "Senior software architect with 8+ years leading backend engineering teams. Deep expertise in Python, FastAPI, Docker, Kubernetes, Redis, PostgreSQL, and building reliable distributed streaming pipelines. Experienced with automated AI guardrails and high-throughput microservices."
  );
  const [screening, setScreening] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleScreen = async () => {
    setScreening(true);
    try {
      const res = await api.simulateRecruitment({
        candidate_name: candidateName,
        job_title: jobTitle,
        resume_text: resumeText,
        required_skills: ["Python", "FastAPI", "Docker", "PostgreSQL", "Redis"],
        min_years_experience: 5.0
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setScreening(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Talent Intelligence Gateways</span>
          </div>
          <h1 className="text-2xl font-display font-bold text-white">AI Candidate Screening & Talent Evaluator</h1>
          <p className="text-xs text-slate-400">Objective resume parsing, skills matrix matching, risk profiling, and tailored technical interview synthesis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 space-y-4 text-xs">
          <h3 className="font-display font-bold text-white text-sm pb-3 border-b border-slate-800">
            Candidate Application Profile
          </h3>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Candidate Name</label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Target Requisition</label>
            <input
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Resume / CV Content</label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-dark-950 border border-slate-700 text-white focus:outline-none focus:border-brand-500 font-sans leading-relaxed"
            />
          </div>

          <button
            onClick={handleScreen}
            disabled={screening}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 via-indigo-600 to-accent-violet hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-glow-brand transition-all disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${screening ? "animate-spin" : ""}`} />
            <span>{screening ? "Evaluating Applicant..." : "Run AI Resume Screening"}</span>
          </button>
        </div>

        {/* Right Result (7 cols) */}
        <div className="lg:col-span-7">
          {result ? (
            <div className="glass-panel p-6 space-y-6 animate-fade-in">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="font-display font-bold text-white text-lg">{candidateName}</h3>
                  <p className="text-xs text-slate-400 font-mono">Position: {jobTitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                    Score: {result.candidate_score}/100
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-brand-950 text-brand-300 border border-brand-800/60 capitalize">
                    {result.recommendation.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Skills Found vs Missing */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Identified Technical Competencies</span>
                <div className="flex flex-wrap gap-2">
                  {result.skills_found?.map((skill: string, i: number) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{skill}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Assessment */}
              <div className="p-4 rounded-xl bg-dark-850/80 border border-slate-800 space-y-2">
                <span className="text-[11px] font-semibold text-brand-300 uppercase tracking-wider">AI Competency Evaluation</span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">{result.reasoning || result.experience_assessment}</p>
              </div>

              {/* Interview Questions */}
              {result.interview_questions && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Recommended Technical Interview Questions</span>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {result.interview_questions.map((q: string, idx: number) => (
                      <li key={idx} className="p-3 rounded-xl bg-dark-950 border border-slate-800 flex items-start gap-2">
                        <span className="text-brand-400 font-bold">{idx + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-12 text-center text-slate-400 space-y-2">
              <UserCheck className="w-10 h-10 text-slate-600 mx-auto" />
              <h4 className="font-semibold text-slate-300 text-sm">No Candidate Evaluated Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Paste resume text on the left and click "Run AI Resume Screening" to parse skills and generate competency scores.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
