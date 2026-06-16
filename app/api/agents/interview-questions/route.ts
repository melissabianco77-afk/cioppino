import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { candidate, job } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 768,
    messages: [
      {
        role: "user",
        content: `You are an expert technical recruiter preparing for an interview.

Job Title: ${job.title}
Job Description:
${job.jobDescription || job.description}

Candidate: ${candidate.name}
Background:
${candidate.resumeText}

Generate 6 tailored interview questions for this specific candidate and role. Mix of:
- 2 behavioral questions
- 2 role-specific technical/skills questions
- 1 question probing a potential gap you noticed
- 1 culture/motivation question

Return a JSON array of question strings only, no numbering or labels:
["question 1", "question 2", ...]`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "[]";

  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const interviewQuestions = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return NextResponse.json({ interviewQuestions, stage: "interview" });
  } catch {
    return NextResponse.json({ interviewQuestions: [text], stage: "interview" });
  }
}
