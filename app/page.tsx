"use client";

import { useState } from "react";
import JobForm from "@/components/JobForm";
import Pipeline from "@/components/Pipeline";
import { Job } from "@/lib/types";

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [view, setView] = useState<"dashboard" | "new-job">("dashboard");

  function addJob(job: Job) {
    setJobs((prev) => [job, ...prev]);
    setActiveJob(job);
    setView("dashboard");
  }

  return (
    <div className="flex h-screen bg-[#0f0f13] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col p-4 gap-2 shrink-0">
        <div className="mb-6">
          <h1 className="text-lg font-semibold tracking-tight">RecruitFlow</h1>
          <p className="text-xs text-white/40 mt-0.5">Agentic recruiting assistant</p>
        </div>

        <button
          onClick={() => setView("new-job")}
          className="w-full text-left text-sm px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors font-medium"
        >
          + New Job
        </button>

        <div className="mt-4">
          <p className="text-xs text-white/30 uppercase tracking-widest mb-2 px-1">Active Roles</p>
          {jobs.length === 0 && (
            <p className="text-xs text-white/30 px-1 italic">No roles yet</p>
          )}
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => { setActiveJob(job); setView("dashboard"); }}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors truncate ${
                activeJob?.id === job.id
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {job.title}
            </button>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {view === "new-job" ? (
          <JobForm onJobCreated={addJob} onCancel={() => setView("dashboard")} />
        ) : activeJob ? (
          <Pipeline job={activeJob} onJobUpdate={(updated) => {
            setJobs(prev => prev.map(j => j.id === updated.id ? updated : j));
            setActiveJob(updated);
          }} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4">
            <div className="text-5xl">🎯</div>
            <h2 className="text-xl font-medium">Welcome to RecruitFlow</h2>
            <p className="text-white/40 text-sm max-w-sm">
              Create a new job role to get started. The AI will write the job description,
              screen candidates, and draft outreach — automatically.
            </p>
            <button
              onClick={() => setView("new-job")}
              className="mt-2 px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-medium"
            >
              Create your first role
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
