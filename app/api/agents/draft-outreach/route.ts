import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { candidate, job } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 512,
    messages: [
      {
        role: "user",
        content: `You are a recruiter drafting a personalized outreach email to a strong candidate.

Job Title: ${job.title}
Candidate: ${candidate.name}
Candidate Background:
${candidate.resumeText}

Write a short, warm, personalized outreach email (4-6 sentences).
- Reference something specific from their background
- Be enthusiastic but not over the top
- Include a clear call to action (schedule a quick call)
- Sign off as "The RecruitFlow Team"

Return only the email body, no subject line.`,
      },
    ],
  });

  const outreachDraft = message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ outreachDraft, stage: "outreach" });
}
