import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { candidate, job } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
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

Provide:
1. A score from 0-100 (where 100 = perfect match)
2. A 2-3 sentence reasoning explaining the score

Respond in this exact JSON format:
{
  "score": <number>,
  "scoreReasoning": "<string>",
  "stage": "<screened or rejected>"
}

Set stage to "rejected" if score is below 40, otherwise "screened".`,
      },
    ],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const result = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ score: 50, scoreReasoning: text, stage: "screened" });
  }
}
