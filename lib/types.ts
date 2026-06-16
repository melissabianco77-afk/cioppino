export interface Job {
  id: string;
  title: string;
  description: string; // raw recruiter notes
  jobDescription?: string; // AI-generated JD
  candidates: Candidate[];
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  resumeText: string;
  score?: number;
  scoreReasoning?: string;
  outreachDraft?: string;
  interviewQuestions?: string[];
  stage: "new" | "screened" | "outreach" | "interview" | "rejected";
}
