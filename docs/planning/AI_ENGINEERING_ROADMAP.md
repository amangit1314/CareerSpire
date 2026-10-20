# AI Engineering Roadmap — Beyond the Groq Wrapper

Written 2026-08-12, from a cross-project portfolio review (done in ApplyPilot's Claude
session, not this repo). Read this before starting any AI-related work here — it's the
plan for turning CareerSpire from a working product into a real AI-engineering portfolio
piece.

## Current state (verified by reading the code, not assumed)

`src/lib/ai/*` is a well-built LLM wrapper, nothing more:

- `groq.ts` — single-turn `chat.completions.create`, no streaming, no tools.
- `index.ts` (`aiChat`/`aiChatJSON`) — tries Groq first, falls back to Gemini on 429 or
  failure, JSON-mode with one retry on parse failure. Solid provider-fallback plumbing.
- `tutorRouter.ts` — a regex/heuristic classifier (`classifyTutorIntent`) routing "light"
  messages to Gemini flash and "heavy" ones to Groq's 70B model. Real routing, but a fixed
  heuristic, not learned or measured.

What's missing, in order of how much it matters for an AI-engineer resume story: no
retrieval (questions/feedback are pure generation, nothing grounded), no agent loop (fixed
pipeline: fetch question → get answer → generate feedback, one shot each, no adaptive
next-step decision), no tool use (code submissions are evaluated by prompting the model to
eyeball them, not by executing them), no eval harness (no way to know if a prompt/model
change made feedback quality better or worse), no observability (no cost/latency/token
tracking — so `tutorRouter`'s routing heuristic has never actually been measured against
what it's supposed to save).

## Do not start this until

`repo-rag` (in `~/Developer/repo-rag`) is deployed and its resume/LinkedIn writeup is
done. That project is 90% finished and blocks nothing else — starting a second
unfinished AI project before it ships is the mistake to avoid. Once repo-rag is live,
this is next.

## The upgrade plan, in order

Each step should be independently demoable/buildable — don't chain them into one big
rewrite.

1. **RAG-ground question generation.** Embed the question bank plus resume/JD context;
   retrieve relevant questions and the candidate's past-performance signal before
   generating, instead of generating from a bare prompt. This is the actual RAG skill —
   reasoning over real retrieved data, not the model making up plausible-sounding
   questions.

2. **Turn the interview conductor into an agent loop.** Replace the fixed
   fetch-question → get-answer → generate-feedback pipeline with adaptive
   next-question selection based on where the candidate is weak. Give it a real
   `run_code` tool to execute code submissions instead of having the model eyeball
   correctness via prompt — genuine tool use, not simulated.

3. **Build an eval harness against that agent.** Golden transcripts (question, candidate
   answer, expected feedback quality) with rubric scoring. This is deliberately a harder
   eval problem than repo-rag's — multi-turn state and tool calls, not single-shot RAG —
   so it proves a different, complementary skill rather than repeating the same one.

Eval/observability work for this portfolio round was deliberately folded into this
project rather than built as a separate standalone platform — decided so the harness has
to handle multi-turn agent state and tool calls, which a generic eval product built in
isolation wouldn't have forced.

## Why this project over building something new

CareerSpire already has production-grade bones worth keeping (auth, rate limiting, CSRF,
password policy — see `docs/PRODUCTION_FEATURES.md`) and a domain (mock interviews) that
naturally supports retrieval, adaptive agent behavior, and gradeable evals. The fastest
path to a genuine agentic-AI portfolio piece here is upgrading this, not starting over.
