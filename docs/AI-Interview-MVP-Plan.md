# AI Interview Prep Platform – Detailed MVP Plan

**Vision:** A scalable AI-driven mock interview platform for India's 1.5M engineering graduates, eventually covering coding, DSA, aptitude, reasoning, and government exams.

**Phase 1 (MVP):** Tech interview focus – DSA + coding (JS/Python) + HR/behavioral for fresh engineers and job seekers.

---

## 1. MVP Features & Requirements

### Core User Flows

#### 1.1 Authentication & Onboarding
- **Sign-up/Login:** Email + password, GitHub/LinkedIn OAuth integration (easier for devs).
- **User Profile:** Role selection (fresher, experienced, gov-exam aspirant), experience level, target company/job type, resume upload (optional for later feature use).
- **Email verification** and basic profile completion before first mock.

#### 1.2 Free Tier (Freemium Hook)
- **2 free mock interviews** on registration (no card required, no time limit).
- Access to **5 sample DSA questions** (easy tier only).
- Basic feedback after each mock (score, time taken, code quality, communication observations).
- Limited dashboard: view only the last mock's results.

#### 1.3 Mock Interview Generation & Execution
- **Question Selection:** AI system generates 1–3 questions based on:
  - User experience level (fresher, intermediate, experienced).
  - Focus area (DSA, Java, JS, Python, HR).
  - Difficulty (easy, medium, hard).
  - Company-specific variants (optional for later; TCS, Infosys, startups patterns).

- **Interview Flow:**
  1. User picks interview type (coding + HR, pure coding, etc.).
  2. AI generates 2–3 questions (text display + optional audio narration).
  3. User codes in integrated editor (syntax-highlighted, runnable for JS/Python).
  4. Timer per question (e.g., 20 min for DSA, 5 min for HR).
  5. Optional: Record user voice/screen for soft skills feedback (text input fallback for MVP).

- **Question Bank (MVP):** 1,000+ curated questions across:
  - DSA: arrays, linked lists, trees, graphs, DP, sorting (LeetCode-style).
  - JS/Python basics: closures, async/await, OOP, design patterns.
  - HR: "Tell me about yourself", "Why this company", "Conflict resolution", etc.
  - Reasoning & aptitude (light; expand in Phase 2): number series, logic puzzles.

#### 1.4 AI Feedback Engine
- **Post-Mock Analysis:**
  - **Code Quality:** Correctness (pass/fail test cases), time/space complexity, edge cases handled, code clarity, best practices adherence.
  - **Communication:** Clarity, how well they explained approach, pace, handling of hints/clarifications.
  - **Time Management:** Did they finish on time? Pressure handling?
  - **Weak Areas:** Topics to focus on (e.g., "Graph algorithms need work").

- **Feedback Format:**
  - Score (0–100).
  - Detailed report: strengths, areas to improve, suggested resources/similar questions.
  - Comparison: "Faster than 75% of users on this question."
  - **Action items:** Next 3 questions to practice based on weaknesses.

#### 1.5 Dashboard & Progress Tracking
- **Home:** Quick stats (mocks completed, avg score, favorite topics, next recommendation).
- **Mock History:** List of past interviews with date, score, company type, questions asked, time spent.
- **Progress Analytics:**
  - Score trend (line chart: last 10 mocks).
  - Weak topics heatmap (which DSA topics need work).
  - Time management graph.
  - Accuracy by topic (DSA vs HR vs coding fundamentals).
- **Recommendations:** "You're weak in graph algorithms; here are 5 similar questions to practice."
- **Leaderboard (optional for MVP):** Weekly/monthly scores (anonymous; gamification).

#### 1.6 Question Bank & Resources
- **Curated questions:** Organized by:
  - Topic (array, linked list, tree, etc.).
  - Difficulty.
  - Company (TCS, Infosys, startups, FAANG, etc.; expand later).
  - Language (JS, Python, Java, etc.).

- **Resources Tab:**
  - Links to external resources (LeetCode patterns, GeeksforGeeks DSA guides).
  - Short notes on key DSA concepts (expand as you add content).
  - Curated YouTube playlists for weak areas.

#### 1.7 Subscription & Payment
- **Pricing:**
  - **Free:** 2 mocks + 5 sample questions + basic feedback.
  - **Pay-per-mock:** ₹99 per additional mock.
  - **Starter (₹299/month):** 10 mocks + all 1K+ questions + resources + analytics (no HR prep expansion yet).
  - **Pro (₹499/month):** Unlimited mocks + all questions + resources + analytics + HR + behavioral tips + weekly recommendations + 1 free resume review/month (optional).

- **Payment gateway:** Razorpay (standard in India; handles INR).
- **Subscription management:** Pause, cancel, upgrade/downgrade in dashboard.

---

## 2. Tech Stack for MVP

### Backend
- **Node.js + Express.js** (or NestJS for scalability later).
- **TypeScript** for type safety.
- **PostgreSQL + Prisma ORM:** User data, mocks history, question bank, subscription info.
- **Redis:** Caching (user session, leaderboard data, frequently accessed questions).

### Frontend
- **Next.js** (App Router) for SSR/CSR flexibility.
- **React** for interactive components.
- **TailwindCSS** for styling.
- **CodeMirror** or **Monaco Editor** for code input (syntax highlight, runnable environment).
- **Chart.js** or **Recharts** for analytics/progress graphs.

### AI & Agents
- **LLM:** GPT-4o or Claude 3.5 Sonnet for:
  - Question generation (adaptive based on user level).
  - Code evaluation and feedback generation.
  - HR question generation and answer evaluation.
  - **Why:** GPT-4o faster (320ms latency, real-time feel), Claude better at clarity and following complex instructions (good for feedback tone). Evaluate both; GPT-4o recommended for speed.[web:68][web:71]

- **Agent Framework:**
  - **LangChain.js** or **Langbase SDK** (TypeScript-native, works with Next.js, supports memory & retrieval).[web:69]
  - Or **OpenAI Assistants API** + custom Node.js logic (simpler for MVP; upgrade to Langchain later).

- **Agent Workflow (for interview generation & feedback):**

  ```
  User Submits Interview Request
    ↓
  Retrieval Agent: Fetch 3-5 candidate questions from DB based on:
    - User experience level
    - Weak topics (from past performance)
    - Language preference (JS/Python/DSA)
    - Company type (if applicable)
    ↓
  Generation Agent: Use GPT-4o to:
    - Rank/finalize top 2-3 questions
    - Generate follow-up hints (if user gets stuck)
    ↓
  Evaluation Agent (Post-Mock):
    1. Parse user's code submission
    2. Run test cases against sample inputs
    3. Generate code feedback (correctness, complexity, style)
    4. For HR: Use GPT-4o to evaluate response quality, clarity
    5. Compile comprehensive feedback report
    ↓
  Scoring Agent:
    - Assign score (0–100) based on:
      - Test case pass rate (40%)
      - Code quality (30%)
      - Communication/HR (20%)
      - Time management (10%)
  ```

### Infrastructure & Deployment
- **Backend:** Node.js on **Vercel** (serverless) or **Koyeb** (affordable, India-friendly).
- **Database:** PostgreSQL on **Vercel Postgres** or **Supabase** (PostgreSQL + free tier generous for startups).
- **Frontend:** Deployed on Vercel (integrated with Next.js).
- **File Storage:** AWS S3 or **Cloudinary** for resume uploads (if added).
- **Email:** SendGrid or Resend for verification & notifications.

### Third-Party Services
- **LLM APIs:** OpenAI (GPT-4o) or Anthropic (Claude).
- **Payment:** Razorpay (for ₹ subscriptions).
- **Authentication:** NextAuth.js (GitHub/LinkedIn OAuth) + JWT for API.
- **Analytics:** Vercel Analytics + custom event tracking (e.g., "mock started", "subscription purchased").

---

## 3. Agents & Automation Details

### Agent 1: Interview Generation Agent
**Purpose:** Fetch relevant questions, adapt difficulty based on user history, generate interview package.

**Inputs:**
- User ID, experience level, weak topics, language preference.
- Past mock results (to identify weak areas).

**Process:**
1. Query question bank: `SELECT * FROM questions WHERE difficulty = user_level AND topic IN (weak_topics) ORDER BY popularity LIMIT 5`
2. Use GPT-4o with prompt:
   ```
   "Given the candidate details (experience: {level}, weak topics: {topics}), 
    select the 3 most suitable interview questions from this pool: {pool}.
    Consider: difficulty progression, relevance, educational value."
   ```
3. Return 3 questions + metadata (topic, difficulty, expected time).

**Output:**
- Interview object: `{ questions: [...], estimatedTime: 45, interviewType: "DSA + HR" }`

**Implementation:**
```typescript
// Using Langbase SDK or LangChain.js
const interviewGenerationAgent = async (userId: string) => {
  const user = await db.user.findUnique({ where: { id: userId } });
  const weakTopics = await analytics.getWeakTopics(userId);
  const questionPool = await db.question.findMany({
    where: { difficulty: user.level, topic: { in: weakTopics } },
    take: 20,
  });

  const llm = new OpenAI({ model: "gpt-4o" });
  const selectedQuestions = await llm.invoke(
    `Select top 3 questions from ${JSON.stringify(questionPool)} for a ${user.level} developer weak in ${weakTopics.join(", ")}.`
  );

  return { questions: selectedQuestions, estimatedTime: 45 };
};
```

### Agent 2: Code Evaluation & Feedback Agent
**Purpose:** Evaluate submitted code, check correctness, analyze complexity, generate actionable feedback.

**Inputs:**
- User's code (JS/Python).
- Test cases (predefined for each question).
- Question details (expected approach, optimal complexity).

**Process:**
1. **Parse & Execute:**
   - Extract function from user code.
   - Run against test cases (using Node.js `vm` module or isolated sandbox).
   - Capture: pass/fail, output, errors.

2. **Static Analysis:**
   - Check code complexity using AST parsing.
   - Detect common mistakes (off-by-one, null-safety, etc.).
   - Score code quality (0–100).

3. **LLM Feedback Generation:**
   ```
   "Evaluate this code for a {question_title}:
    Test results: {pass_rate}
    Time complexity: {user_complexity} vs optimal {optimal}
    Provide: 1) what they did well, 2) top 3 improvements, 3) next similar question to practice."
   ```

**Output:**
```json
{
  "testPassRate": 80,
  "codeQuality": 75,
  "timeComplexity": "O(n²)",
  "optimalComplexity": "O(n log n)",
  "feedback": "Great logic, but nested loops are inefficient...",
  "nextQuestion": "merge-intervals"
}
```

**Implementation:**
```typescript
const evaluateCodeAgent = async (submission: CodeSubmission) => {
  const testResults = runTests(submission.code, submission.question.testCases);
  const complexity = analyzeComplexity(submission.code);
  
  const feedback = await llm.invoke(
    `Code: ${submission.code}\nTests: ${JSON.stringify(testResults)}\nProvide feedback.`
  );

  return { testPassRate: testResults.passRate, feedback, complexity };
};
```

### Agent 3: Analytics & Recommendation Agent
**Purpose:** Analyze user performance trends, identify weak areas, recommend next questions/topics.

**Inputs:**
- User's mock history (scores, topics, time taken).
- Global benchmarks (avg score by topic).

**Process:**
1. **Aggregation:**
   - Group mocks by topic.
   - Calculate: avg score, pass rate, time spent.
   - Identify bottom 3 topics.

2. **Trend Analysis:**
   - Is score improving over time?
   - Are they getting faster?
   - Consistency (std dev of scores)?

3. **LLM-Driven Recommendations:**
   ```
   "User stats: {weak_topics}, improvement_rate: {trend}
    Suggest: 1) top 3 topics to focus on, 2) difficulty progression, 3) estimated time to mastery."
   ```

**Output:**
```json
{
  "weakTopics": ["dynamic-programming", "graphs"],
  "recommendation": "Master DP first; it's foundational for graph problems.",
  "suggestedQuestions": ["climbing-stairs", "coin-change", "word-ladder"],
  "estimatedWeeksToMastery": 4
}
```

### Agent 4: HR/Behavioral Evaluation Agent (Future)
**Purpose:** Evaluate HR responses for communication, culture fit, confidence.

**Inputs:**
- User's text/voice transcription for HR questions.
- Expected answer framework.

**Process:**
1. **Transcription** (if voice; for MVP, text input is fine).
2. **LLM Analysis:**
   ```
   "HR Question: {question}\nUser Answer: {answer}\nEvaluate: clarity (0–10), relevance (0–10), confidence (0–10)."
   ```

**Output:**
```json
{
  "clarity": 8,
  "relevance": 7,
  "confidence": 6,
  "feedback": "Good structure, but pause more for emphasis...",
  "suggestions": ["Add specific metrics/outcomes to answers"]
}
```

---

## 4. MVP Launch Checklist

### Must-Have Features
- [ ] User signup/login (email + GitHub OAuth).
- [ ] 2 free mocks on registration.
- [ ] AI mock interview generation (2-3 DSA/HR questions).
- [ ] Code editor with syntax highlighting.
- [ ] Test case execution (JS/Python).
- [ ] Post-mock feedback report.
- [ ] Simple dashboard (last mock, progress).
- [ ] Question bank view (filter by topic/difficulty).
- [ ] Pay-per-mock (₹99) + Starter (₹299/month) pricing.
- [ ] Razorpay payment integration.
- [ ] Email notifications (verification, subscription confirmation).
- [ ] Analytics: score trend, weak topics, next recommendations.

### Nice-to-Have (Post-MVP)
- [ ] LinkedIn OAuth.
- [ ] Video/voice recording for soft skills.
- [ ] Resume upload and parsing.
- [ ] Company-specific question sets.
- [ ] Leaderboard.
- [ ] Progress export (PDF report).
- [ ] Chrome extension for in-situ interview tips.
- [ ] Batch onboarding for colleges/training institutes.

### Technical Pre-Launch
- [ ] Secure all API keys (env vars).
- [ ] Database migrations tested.
- [ ] Error handling & logging (Sentry or similar).
- [ ] Rate limiting on API endpoints (prevent abuse).
- [ ] SSL/HTTPS enabled.
- [ ] GDPR/privacy policy in place.
- [ ] Load testing (simulate 100 concurrent users).

---

## 5. Marketing the MVP

### Phase 1: Pre-Launch (Weeks 1–2)
**Goal:** Build awareness & collect waitlist.

#### 5.1 Content & Community
- **Post on LinkedIn:**
  - Share your journey: "Building an AI interview prep for India's 1.5M engineers."
  - Behind-the-scenes: "Day 10: 500+ DSA questions curated", "Building the AI feedback engine."
  - Tag: #IndieHacker #StartupJourney #EdTech
  - Target: Followers on your current 3k+ network + dev groups.

- **Reddit Presence:**
  - Post in r/developersIndia, r/learnprogramming, r/cscareerquestions.
  - Honest pitch: "Built an AI mock interview tool for freshers. Feedback?"
  - Link to landing page with waitlist.

- **Dev Communities:**
  - Share on Dev.to (write a blog: "Why AI interview prep beats courses").
  - Post in Indian dev Discord/Telegram groups (LearnCodeOnline, TheCodeist, etc.).
  - GitHub issue/discussion threads for LeetCode/interview prep repos.

#### 5.2 Landing Page
- **Build on Vercel + Next.js in 1 day:**
  - Hero: "AI Mock Interviews, Real Feedback, ₹499/month."
  - 3 key benefits: "24/7 practice, personalized roadmaps, see your progress."
  - Video demo (30 sec; Loom or Reels): user starts interview → gets feedback.
  - Pricing table (highlight ₹99/mock for impulse buyers).
  - Testimonials (ask your beta users, friends).
  - Waitlist form (Convertkit, Beehiiv, or simple Airtable).
  - Countdown timer: "MVP launches Jan 25" (create urgency).

#### 5.3 Email Sequence
- **Day 0:** "You're on the waitlist! Here's what's coming."
- **Day 5:** "Why AI interview prep is 10x better than courses" (blog link).
- **Day 10:** "See how 100 beta users improved their DSA scores."
- **Launch day:** "Go live. 2 free mocks waiting for you."

### Phase 2: MVP Launch (Weeks 3–4)
**Goal:** Get 500–1K users in first 2 weeks.

#### 5.4 Product Hunt Launch
- **Day before:** Create PH account, write compelling description.
  - **Title:** "MortalInterview – AI Mock Interviews for India's Engineers"
  - **Tagline:** "Unlimited practice. Real feedback. ₹499/month."
  - **Description:** Emphasize Indian focus, freemium, competitive pricing.
- **Launch day:**
  - Post on PH at 10 AM IST (align with India prime time).
  - Email waitlist: "We're live on PH; I'm answering questions all day."
  - Ask users to upvote, share feedback.
  - **Target:** Top 5 in category → 200–400 upvotes, 100+ signups.

#### 5.5 Indie Hackers
- **Cross-post to Indie Hackers.**
  - Detailed post: "How I built an AI interview prep in 3 months (solo)."
  - Include: tech stack, challenges, learnings, metrics.
  - **Target:** 50–100 signups, 20–30 upvotes.

#### 5.6 Influencer Outreach
- **Micro-influencers in EdTech/dev space (10K–100K followers):**
  - Dev YouTubers (Dev Delight, CodeWithHarry followers, etc.).
  - LinkedIn creators (20k+ followers in EdTech).
  - Offer: Free Pro subscription + commission (₹50 per converted subscription).
  - Pitch: "Tool solves a real problem for your audience; mention in a video/post?"
  - **Realistic:** 5 influencers × 20 signups each = 100 warm signups.

#### 5.7 Organic Channels
- **SEO Keywords (long-term):**
  - "AI mock interview India"
  - "DSA practice with AI feedback"
  - "Free interview prep tool"
  - Start blogging on your domain; target these keywords.

- **YouTube:**
  - Make 3 short videos (5–10 min):
    1. "I built an AI that conducts your interviews" (demo + growth story).
    2. "Why your interview prep is failing & how AI fixes it."
    3. Tutorial: "How to crack DSA interviews using AI feedback."
  - Upload to YouTube, embed on landing page.
  - Target: 1K views → 100–200 signups.

### Phase 3: Growth & Retention (Weeks 5–8)
**Goal:** Achieve 1K–2K users, optimize for conversion to paid.

#### 5.8 Viral Loops & Referrals
- **Share Mock Results:**
  - After each mock, let users share results on LinkedIn/Twitter.
  - "I scored 85 on the TCS interview mock via MortalInterview. Try it!"
  - Include referral link: "Sign up via my link, get 1 free premium week."
  - Incentivize: Referrer gets 1 month free for every 3 successful conversions.

- **Leaderboard (gamification):**
  - Add weekly leaderboard (launch Week 4).
  - Announce weekly winners on LinkedIn.
  - "Top scorer this week: @devuser scored 95 on Google DSA mocks."

#### 5.9 Content Marketing
- **Weekly Blog Posts (on your domain):**
  - Week 5: "Why 90% of engineers fail interviews (and how to fix it)."
  - Week 6: "DSA patterns every FAANG company asks in 2026."
  - Week 7: "How to score 90+ on our AI mock interviews (guide)."
  - Share on LinkedIn; target 500–1K views per post → 5–10% CTR to app.

- **Email Nurture:**
  - Free users who didn't convert: Weekly tips + 1 discount offer (₹199/month for first month).
  - Segment: New users, high performers (higher LTV), low performers (churn risk).

#### 5.10 Direct Outreach
- **Target Your Audience Directly:**
  - Find engineering college Discord/Telegram groups; share your tool.
  - DM active users on LeetCode discussions, GeeksforGeeks forums.
  - Connect with placement coordinators at Tier 2/3 colleges; offer bulk discounts.

### Phase 4: Scale (Months 3–4)
**Goal:** Hit 5K users, $5K MRR, refine for expansion to aptitude/reasoning.

#### 5.11 Paid Ads (After Proving PMF)
- **LinkedIn Ads:**
  - Target: "Job title: Engineer, Student. Interest: Interview prep, EdTech."
  - Budget: ₹3K–5K/week.
  - Lookalike audiences from existing users.
  - **Target CAC:** ₹200–300, LTV ₹2,000+ (10 lifetime payments) = 6–10x ROI.

- **Google Search Ads:**
  - Keywords: "AI mock interviews", "DSA practice with feedback", "interview prep India".
  - Budget: ₹5K–10K/week.
  - Target conversion: 5–10% (sign-ups) × 20% (conversion to paid) = 1–2% CAC efficiency.

#### 5.12 Retention & Upsell
- **Retention Metrics:**
  - Weekly active users (WAU) / monthly active users (MAU).
  - Target: 30% WAU/MAU (good for EdTech SaaS).
  - Churn rate: <5% monthly.

- **Upsell:**
  - Free → Pay-per-mock (₹99): "Great first mock! Try 5 more at ₹99 each."
  - Pay-per-mock → Subscription (₹299/month): "Unlimit your practice: ₹299/month = 40 mocks."
  - Starter → Pro (₹499/month): "Get HR prep + resume review."

#### 5.13 Metrics to Track
- **Week 1–4 Goals:**
  - 500+ signups.
  - 50–100 paid conversions.
  - ₹5K–10K MRR.
  - 30%+ free-to-paid conversion rate.

- **Month 2–3 Goals:**
  - 2K+ users.
  - 200+ paid subscribers.
  - ₹30K–50K MRR.
  - LTV: ₹2,000 (avg 5 months retention), CAC: ₹300.

- **Month 4 Goals:**
  - 5K+ users.
  - 500+ paid subscribers.
  - ₹50K–100K MRR.
  - Proof of concept for expansion to aptitude/reasoning (Phase 2).

---

## 6. Quick Marketing Checklist

### Pre-Launch (Week 1–2)
- [ ] Landing page live (Vercel + Convertkit).
- [ ] LinkedIn strategy: Schedule 3 posts (journey, feature deep-dive, call-to-action).
- [ ] Reddit: Identify 5 subreddits for posting.
- [ ] Dev communities: Gather 10 Telegram/Discord groups.
- [ ] Email sequence: Draft 5 emails in Convertkit.
- [ ] Video demo: Create 30-sec demo (Loom).

### Launch Day (Week 3)
- [ ] Product Hunt live + day-of engagement plan.
- [ ] Indie Hackers post live.
- [ ] Email waitlist (target 500+ recipients).
- [ ] LinkedIn post (link, thank you note).
- [ ] Reddit posts in 5 subreddits.
- [ ] Telegram/Discord groups: Announce launch.
- [ ] Monitor analytics; respond to all comments/questions.

### Growth Phase (Week 4–8)
- [ ] Referral system live.
- [ ] First blog post published + shared.
- [ ] YouTube videos 1–3 uploaded.
- [ ] Influencer outreach: 5 DMs sent.
- [ ] Weekly analytics review: CAC, LTV, churn, conversion rate.
- [ ] User feedback: Weekly surveys (Google Form) or in-app feedback widget.
- [ ] A/B test: Landing page headline, pricing, email CTA.

---

## 7. Success Metrics & Milestones

### MVP Success Definition
- **4-week target:** 1K signups, 100 paid users, ₹10K MRR.
- **3-month target:** 5K users, 500 paid, ₹50K MRR, 30% WAU/MAU retention.
- **1-year target:** 50K users, 5K paid, ₹500K MRR, validated model for Phase 2 (aptitude/reasoning/gov exams).

### Tracking Tools
- **Analytics:** Vercel Analytics (free), custom event tracking via `gtag` for signups/conversions.
- **Payments:** Razorpay dashboard (real-time MRR, churn).
- **User Feedback:** Typeform surveys, Intercom for chat support.
- **Cohort Analysis:** Segment users by signup date; track retention weekly.

---

## 8. Risk Mitigation & Contingency

### Risks & Solutions
| Risk | Solution |
|------|----------|
| Low conversion (free → paid) | A/B test pricing; offer limited free tier to drive urgency. |
| High churn (users leave after 1-2 mocks) | Implement onboarding flow; send "you're weak in X" recommendations. |
| Poor LLM feedback quality | Start with GPT-4o; fine-tune prompts using user feedback; offer manual review option. |
| Low organic reach | Invest ₹5K/month in LinkedIn ads early (cut losses if CAC > LTV). |
| Competitor undercuts pricing | Focus on Indian market specificity; build brand loyalty early. |
| Platform bugs / downtime | Daily backups; Sentry error tracking; GitHub status page. |

---

## 9. Post-MVP Roadmap (Phases 2–3)

### Phase 2 (Months 5–8): Aptitude & Reasoning
- Add timed aptitude tests (quantitative, logical reasoning, verbal).
- Partner with coaching institutes for bulk licensing.
- Target: College placement cells + gov exam aspirants.

### Phase 3 (Months 9–12): Gov Exams & Multi-Language
- SSC/Bank exams prep (aptitude + English).
- Hindi support + regional languages.
- White-label version for institutes.

---

## 10. Final Checklist: Ready to Build?

- [ ] Clear MVP scope (features list finalized).
- [ ] Tech stack chosen (Next.js, Node.js, PostgreSQL, GPT-4o).
- [ ] Agent workflows documented (interview generation, evaluation, recommendation).
- [ ] Pricing finalized (₹99/mock, ₹299/month starter, ₹499/month pro).
- [ ] Marketing channels prioritized (LinkedIn, Reddit, YouTube, Product Hunt).
- [ ] Metrics defined (1K users in 4 weeks, ₹10K MRR).
- [ ] Team/solo timeline clear (3 months solo MVP build + launch).
- [ ] Budget estimated (LLM API costs: ₹500/day at launch; infrastructure: ₹5K/month).
- [ ] Contingency plan ready (what if conversion is 5% instead of 20%?).

---

## 11. Quick Reference: Tech Implementation Example

### Interview Generation Agent (Pseudocode)
```typescript
import { OpenAI } from "openai";
import { prisma } from "@/lib/prisma";

const generateInterview = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const weakTopics = await getWeakTopics(userId);
  
  const questions = await prisma.question.findMany({
    where: { 
      difficulty: user.level,
      topic: { in: weakTopics.slice(0, 3) } 
    },
    take: 10,
  });

  const openai = new OpenAI();
  const selectedQs = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `Select 2-3 interview questions for a ${user.level} dev weak in ${weakTopics.join(", ")} from: ${JSON.stringify(questions.map(q => ({ id: q.id, title: q.title, topic: q.topic, difficulty: q.difficulty })))}. Return IDs only.`,
      },
    ],
  });

  const selectedIds = JSON.parse(selectedQs.choices[0].message.content || "[]");
  const interview = await prisma.interview.create({
    data: {
      userId,
      questions: { connect: selectedIds.map((id: string) => ({ id })) },
      startedAt: new Date(),
    },
  });

  return interview;
};

export default generateInterview;
```

---

**Next Step:** Start building Week 1. Scope: Auth + Mock generation + feedback engine. Ship MVP Week 3.

Good luck! 🚀
