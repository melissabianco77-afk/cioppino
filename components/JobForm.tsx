"use client";

import { useState } from "react";
import { Job } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

interface Props {
  onJobCreated: (job: Job) => void;
  onCancel: () => void;
}

export default function JobForm({ onJobCreated, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setLoading(true);
    setStatus("Writing job description...");

    try {
      const res = await fetch("/api/agents/write-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const data = await res.json();

      const job: Job = {
        id: uuidv4(),
        title,
        description,
        jobDescription: data.jobDescription,
        candidates: [],
        createdAt: new Date().toISOString(),
      };

      onJobCreated(job);
    } catch {
      setStatus("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 pt-16">
      <button onClick={onCancel} className="text-white/40 hover:text-white text-sm mb-8 transition-colors">
        ← Back
      </button>
      <h2 className="text-2xl font-semibold mb-2">New Role</h2>
      <p className="text-white/40 text-sm mb-8">
        Describe what you&apos;re looking for in plain English — the AI will write a polished job description.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm text-white/60 mb-1.5">Job Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Senior Product Designer"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-white/20"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm text-white/60 mb-1.5">Role Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the role, team, required skills, nice-to-haves, and any other context..."
            rows={8}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm outline-none focus:border-violet-500 transition-colors resize-none placeholder:text-white/20"
            disabled={loading}
          />
        </div>

        {status && (
          <div className="flex items-center gap-2 text-sm text-violet-300">
            <span className="animate-spin">⟳</span>
            {status}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim() || !description.trim()}
            className="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {loading ? "Generating..." : "Generate Job Description"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm text-white/60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
