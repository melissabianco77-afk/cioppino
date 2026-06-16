"use client";

import { useState } from "react";
import { Candidate, Job } from "@/lib/types";

interface Props {
  candidate: Candidate;
  job: Job;
  onUpdate: (candidate: Candidate) => void;
}

export default function CandidateCard({ candidate, job, onUpdate }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  async function runAgent(agentName: string) {
    setLoading(agentName);
    try {
      const res = await fetch(`/api/agents/${agentName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate, job }),
      });
      const data = await res.json();
      onUpdate({ ...candidate, ...data });
    } finally {
      setLoading(null);
    }
  }

  const scoreColor =
    candidate.score === undefined
      ? "text-white/30"
      : candidate.score >= 75
      ? "text-emerald-400"
      : candidate.score >= 50
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col gap-3 hover:border-white/20 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium leading-tight">{candidate.name}</p>
          <p className="text-xs text-white/40 mt-0.5">{candidate.email}</p>
        </div>
        {candidate.score !== undefined && (
          <span className={`text-sm font-semibold tabular-nums ${scoreColor}`}>
            {candidate.score}
          </span>
        )}
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {!candidate.score && (
          <AgentButton
            label="Screen"
            loading={loading === "screen-resume"}
            onClick={() => runAgent("screen-resume")}
          />
        )}
        {candidate.score && !candidate.outreachDraft && (
          <AgentButton
            label="Draft Outreach"
            loading={loading === "draft-outreach"}
            onClick={() => runAgent("draft-outreach")}
          />
        )}
        {candidate.score && !candidate.interviewQuestions && (
          <AgentButton
            label="Interview Qs"
            loading={loading === "interview-questions"}
            onClick={() => runAgent("interview-questions")}
          />
        )}
      </div>

      {(candidate.scoreReasoning || candidate.outreachDraft || candidate.interviewQuestions) && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-white/30 hover:text-white/60 transition-colors text-left"
        >
          {expanded ? "Hide details ↑" : "Show details ↓"}
        </button>
      )}

      {expanded && (
        <div className="flex flex-col gap-3 text-xs text-white/60 border-t border-white/10 pt-3">
          {candidate.scoreReasoning && (
            <div>
              <p className="text-white/30 uppercase tracking-widest text-[10px] mb-1">Screen result</p>
              <p className="leading-relaxed">{candidate.scoreReasoning}</p>
            </div>
          )}
          {candidate.outreachDraft && (
            <div>
              <p className="text-white/30 uppercase tracking-widest text-[10px] mb-1">Outreach draft</p>
              <p className="leading-relaxed whitespace-pre-wrap">{candidate.outreachDraft}</p>
            </div>
          )}
          {candidate.interviewQuestions && (
            <div>
              <p className="text-white/30 uppercase tracking-widest text-[10px] mb-1">Interview questions</p>
              <ol className="list-decimal list-inside flex flex-col gap-1">
                {candidate.interviewQuestions.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AgentButton({
  label,
  loading,
  onClick,
}: {
  label: string;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="text-[11px] px-2.5 py-1 rounded-md bg-violet-600/20 text-violet-300 hover:bg-violet-600/40 disabled:opacity-50 transition-colors border border-violet-500/20"
    >
      {loading ? "..." : label}
    </button>
  );
}
