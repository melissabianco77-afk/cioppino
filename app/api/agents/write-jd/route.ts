import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { title, description } = await req.json();

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are an expert technical recruiter. Write a compelling, professional job description for the following role.

Job Title: ${title}

Recruiter Notes:
${description}

Write a structured job description with these sections:
- About the Role (2-3 sentences)
- What You'll Do (5-6 bullet points)
- What We're Looking For (5-6 bullet points)
- Nice to Have (3-4 bullet points)
- What We Offer (3-4 bullet points)

Keep it engaging and specific. Avoid generic filler. Return only the job description text, no preamble.`,
      },
    ],
  });

  const jobDescription = message.content[0].type === "text" ? message.content[0].text : "";

  return NextResponse.json({ jobDescription });
}
