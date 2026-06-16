import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { Candidate, Job } from "@/lib/types";

const client = new Anthropic();

async function screenOne(candidate: Candidate, job: Job) {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are an expert recruiter screening candidates. Evaluate this candidate against the job description.

Job Title: ${job.title}
Job Description:
${job.jobDescription || job.description}

Candidate: ${candidate.name}
Resume / Background:
${candidate.resumeText}

Respond in this exact JSON format:
{
  "score": <number 0-100>,
  "scoreReasoning": "<2-3 sentence explanation>",
  "stage": "<screened or rejected>"
}

Set stage to "rejected" if score is below 40, otherwise "screened".`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return { score: 50, scoreReasoning: text, stage: "screened" };
  }
}

export async function POST(req: NextRequest) {
  const { candidates, job } = await req.json();

  const unscreened: Candidate[] = candidates.filter(
    (c: Candidate) => c.score === undefined && c.stage === "new"
  );

  const results = await Promise.all(
    unscreened.map(async (c: Candidate) => ({
      id: c.id,
      ...(await screenOne(c, job)),
    }))
  );

  return NextResponse.json({ results });
}
