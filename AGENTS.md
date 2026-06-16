# RecruitFlow — Agent Notes

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS
- Claude API (claude-sonnet-4-6) via @anthropic-ai/sdk
- Deployed on Vercel

## Agent routes
All agents live under `app/api/agents/`:
- `write-jd` — generates a job description from recruiter notes
- `screen-resume` — scores a candidate 0-100 against the JD
- `draft-outreach` — writes a personalized outreach email
- `interview-questions` — generates 6 tailored interview questions

## Env vars
- `ANTHROPIC_API_KEY` — required, set in Vercel dashboard and `.env.local`
