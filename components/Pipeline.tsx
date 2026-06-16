"use client";

import { useState } from "react";
import { Job, Candidate } from "@/lib/types";
import CandidateCard from "@/components/CandidateCard";
import AddCandidate from "@/components/AddCandidate";
import JobDescriptionPanel from "@/components/JobDescriptionPanel";

interface Props {
  job: Job;
  onJobUpdate: (job: Job) => void;
}

const STAGES = ["new", "screened", "outreach", "interview", "rejected"] as const;
type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  new: "New",
  screened: "Screened",
  outreach: "Outreach Sent",
  interview: "Interview",
  rejected: "Rejected",
};

export default function Pipeline({ job, onJobUpdate }: Props) {
  const [showJD, setShowJD] = useState(false);
  const [showAddCandidate, setShowAddCandidate] = useState(false);
  const [screeningAll, setScreeningAll] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  function updateCandidate(updated: Candidate) {
    onJobUpdate({
      ...job,
      candidates: job.candidates.map((c) => (c.id === updated.id ? updated : c)),
    });
  }

  function addCandidate(candidate: Candidate) {
    onJobUpdate({ ...job, candidates: [...job.candidates, candidate] });
    setShowAddCandidate(false);
  }

  async function screenAll() {
    const unscreened = job.candidates.filter((c) => c.score === undefined && c.stage === "new");
    if (unscreened.length === 0) return;
    setScreeningAll(true);
    try {
      const res = await fetch("/api/agents/screen-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidates: job.candidates, job }),
      });
      const { results } = await res.json();
      const updatedMap: Record<string, Partial<Candidate>> = {};
      for (const r of results) updatedMap[r.id] = r;
      onJobUpdate({
        ...job,
        candidates: job.candidates.map((c) =>
          updatedMap[c.id] ? { ...c, ...updatedMap[c.id] } : c
        ),
      });
    } finally {
      setScreeningAll(false);
    }
  }

  function onDragStart(e: React.DragEvent, candidateId: string) {
    setDragId(candidateId);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDrop(e: React.DragEvent, stage: Stage) {
    e.preventDefault();
    if (!dragId) return;
    onJobUpdate({
      ...job,
      candidates: job.candidates.map((c) =>
        c.id === dragId ? { ...c, stage } : c
      ),
    });
    setDragId(null);
  }

  const candidatesByStage = STAGES.reduce((acc, stage) => {
    acc[stage] = job.candidates.filter((c) => c.stage === stage);
    return acc;
  }, {} as Record<Stage, Candidate[]>);

  const unscreenedCount = job.candidates.filter(
    (c) => c.score === undefined && c.stage === "new"
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-lg">{job.title}</h2>
          <p className="text-white/40 text-xs mt-0.5">{job.candidates.length} candidates</p>
        </div>
        <div className="flex gap-2">
          {unscreenedCount > 0 && (
            <button
              onClick={screenAll}
              disabled={screeningAll}
              className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-600/40 disabled:opacity-50 transition-colors"
            >
              {screeningAll ? "Screening..." : `Screen All (${unscreenedCount})`}
            </button>
          )}
          <button
            onClick={() => setShowJD(true)}
            className="text-sm px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 text-white/60 hover:text-white transition-colors"
          >
            View JD
          </button>
          <button
            onClick={() => setShowAddCandidate(true)}
            className="text-sm px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors font-medium"
          >
            + Add Candidate
          </button>
        </div>
      </div>

      {/* Kanban */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-4 h-full min-w-max">
          {STAGES.map((stage) => (
            <div
              key={stage}
              className="w-64 flex flex-col gap-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white/50 uppercase tracking-widest">
                  {STAGE_LABELS[stage]}
                </span>
                <span className="text-xs text-white/30 bg-white/5 rounded-full px-2 py-0.5">
                  {candidatesByStage[stage].length}
                </span>
              </div>

              {candidatesByStage[stage].map((candidate) => (
                <div
                  key={candidate.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, candidate.id)}
                  className={`cursor-grab active:cursor-grabbing ${dragId === candidate.id ? "opacity-40" : ""}`}
                >
                  <CandidateCard
                    candidate={candidate}
                    job={job}
                    onUpdate={updateCandidate}
                  />
                </div>
              ))}

              {candidatesByStage[stage].length === 0 && (
                <div className="border border-dashed border-white/10 rounded-lg p-4 text-center text-white/20 text-xs min-h-[60px] flex items-center justify-center">
                  Drop here
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showJD && job.jobDescription && (
        <JobDescriptionPanel jd={job.jobDescription} onClose={() => setShowJD(false)} />
      )}
      {showAddCandidate && (
        <AddCandidate job={job} onAdd={addCandidate} onClose={() => setShowAddCandidate(false)} />
      )}
    </div>
  );
}
