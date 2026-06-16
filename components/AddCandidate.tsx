"use client";

import { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Candidate, Job } from "@/lib/types";

interface Props {
  job: Job;
  onAdd: (candidate: Candidate) => void;
  onClose: () => void;
}

export default function AddCandidate({ onAdd, onClose }: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.name.endsWith(".pdf")) return;
    setFileName(file.name);
    setParsing(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/parse-resume", { method: "POST", body: fd });
      const data = await res.json();
      setResumeText(data.text || "");
    } finally {
      setParsing(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !resumeText.trim()) return;
    onAdd({
      id: uuidv4(),
      name,
      email,
      resumeText,
      stage: "new",
    });
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a22] border border-white/10 rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Add Candidate</h3>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xl leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-white/50 mb-1.5">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-white/20"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-white/50 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-500 transition-colors placeholder:text-white/20"
              />
            </div>
          </div>

          {/* PDF drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
              dragOver ? "border-violet-400 bg-violet-500/10" : "border-white/10 hover:border-white/20"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
            />
            {parsing ? (
              <p className="text-sm text-violet-300">Parsing PDF...</p>
            ) : fileName ? (
              <p className="text-sm text-white/60">✓ {fileName}</p>
            ) : (
              <div>
                <p className="text-sm text-white/40">Drop resume PDF here</p>
                <p className="text-xs text-white/20 mt-0.5">or click to browse</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5">
              Resume Text {fileName && <span className="text-white/30">(extracted — edit if needed)</span>}
            </label>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text or upload a PDF above..."
              rows={5}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-violet-500 transition-colors resize-none placeholder:text-white/20"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={!name.trim() || !email.trim() || !resumeText.trim() || parsing}
              className="flex-1 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Add Candidate
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors text-sm text-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
