# Devlog

Daily development logs.

---

## Day 1 — 2026-05-20

**Hours worked:** 2

**What I did:** Set up the Next.js project, created all 12 required markdown files, pushed to GitHub, and deployed to Vercel. The app is live!

**What I learned:** How to use the terminal, what git init/commit/push does, and how Vercel connects to GitHub automatically.

**Blockers / what I'm stuck on:** Still getting comfortable with which files matter (app code vs docs) and when to run commands from the project folder vs elsewhere.

**Plan for tomorrow:** Build the spend input form — the main form where users enter their AI tools.

---

## Day 2 — 2026-05-21

**Hours worked:** 3

**What I did:** Created TypeScript types for all data shapes. Built pricing constants for all 8 tools with real prices. Built the ToolRow component and the main form page. Form persists across page refreshes using localStorage.

**What I learned:** What TypeScript types are and why they're useful. How React useState and useEffect work together. What localStorage is and how it saves data in the browser without a server.

**Blockers / what I'm stuck on:** Hit a React hydration error because `crypto.randomUUID()` ran on the server and again on the client with different IDs — fixed it by not rendering the form until after mount. Still fuzzy on when Next.js runs code on the server vs only in the browser for `"use client"` pages. Free and API plans don't auto-fill monthly spend (`pricePerSeat` is 0), so submit fails until you pick a paid plan or type spend manually — that tripped me up while testing.

---

## Day 3 — 2026-05-22

**Hours worked:** 4

**What I did:** Built the audit engine with specific rules for all 8 tools. Wrote 8 Jest unit tests — all passing. Set up GitHub Actions CI — green checkmarks now appear on GitHub automatically after every push.

**What I learned:** Why automated tests matter — they caught two bugs in my savings calculation before any user saw them. What CI/CD means and why companies use it. How to think about business rules as code: "if this condition is true, then this specific action and savings amount."

**Blockers / what I'm stuck on:** CI failed on the first push because I hadn't run `npm run lint` locally — unused variables and a new ESLint rule (`react-hooks/set-state-in-effect`) blocked the build. Had to install Jest with `npm install` before `npm test` worked. The Copilot Enterprise rule and the general "seat bloat" rule both fired at once, which showed $117 instead of $100 until I learned to prioritize tool-specific rules over the general one. Wrapping `setState` in `startTransition` fixed lint but still feels like a workaround rather than fully understanding the rule.

**Plan for tomorrow:** Build the results page — the animated savings hero, per-tool recommendation cards, and the Credex CTA.

---

## Day 4 — 2026-05-23

**Hours worked:** 5

**What I did:** Built the full results page — rebuilt the `/audit` page shell with loading and error states, built the SavingsHero component with a counting animation, built the per-tool RecommendationList sorted by savings amount, and built the three-state CredexCTA. Tested the full form → results flow manually with multiple test cases.

**What I learned:** How to animate a number counting up using useEffect and setInterval. How to design for multiple user states (high savings vs already optimal vs moderate). What it actually feels like to use your own product for the first time — I noticed the counting animation makes the savings feel much more real than seeing a static number, and how jarring the jump from "Loading form…" on the home page to the full results page is without the skeleton loader (fixing that made the wait feel intentional).

**Blockers / what I'm stuck on:** The audit page is a client component, so the page title had to go in a separate `layout.tsx` — I didn't know that at first. ESLint's `react-hooks/set-state-in-effect` rule blocked CI again when reading from localStorage on mount; wrapping updates in `startTransition` fixed it but I still don't fully get why that's different. Building three completely different CredexCTA layouts from one savings number took longer than expected. On mobile, the recommendation card header (tool name + savings badge) needed extra layout work so nothing overflowed at 375px width.

**Plan for tomorrow:** Wire up the Anthropic API for the real AI summary, connect Supabase database for lead storage, and set up Resend for confirmation emails.

---

## Day 5 — 2026-05-24

**Hours worked:** 6

**What I did:** Set up Supabase with two tables (`audits` + `leads`) and Row Level Security policies. Got Anthropic and Resend API keys. Built the `/api/summarize` route with graceful fallback when the API fails. Built the `/api/capture-lead` route with email validation, honeypot bot protection, Supabase storage, and Resend confirmation email. Added `/api/audits` to persist full audit results. Updated the CredexCTA to call the real backend. Tested the full flow on the live Vercel URL — email arrives in inbox, Supabase row appears.

**What I learned:** What environment variables are and why they protect secrets. How Next.js API routes run server-side so the browser never sees the code. What a honeypot field is and why it stops bots without annoying real users. What Row Level Security (RLS) means in a database.

**Blockers / what I'm stuck on:** Supabase inserts failed until the payload matched the real schema (`recommendations` is NOT NULL; no `generated_at` column — use `created_at`). One audit run wrote **three** rows in `audits` because the results page called `runAudit()` again (new UUID each time) and React Strict Mode double-ran the effect in dev — fixed by running the audit once on submit and saving with a session guard (`auditStorage.ts`). `ai_summary` stayed NULL until the summarize route updated the audit row by `id`. On `leads`, `role` and `team_size` were NULL because the email form only sent email and optional company — wired `team_size` from the audit; `role` still needs a form field if we want it filled.

**Plan for tomorrow:** Build shareable public audit URLs with Open Graph tags, then write the entrepreneurial documents (GTM, ECONOMICS, LANDING_COPY, METRICS, PRICING_DATA).

---

## Day 6 — 2026-05-25

**Hours worked:** 7

**What I did:** Built the save-audit API route that persists audits to Supabase. Built the public shareable audit page at `/audit/[id]` as a server component with Open Graph meta tags and a viral loop CTA. Added a share button to the results page that copies the URL to clipboard. Manually verified all 8 tool prices from official vendor pages and wrote `PRICING_DATA.md`. Wrote `GTM.md` with specific channels and outreach scripts. Wrote `ECONOMICS.md` with full funnel math showing 3.2 customers breaks even on the tool build. Wrote `LANDING_COPY.md` and `METRICS.md`.

**What I learned:** How Open Graph tags create rich preview cards on Twitter and LinkedIn — they are just HTML meta tags in the page head. How Next.js `generateMetadata()` works for dynamic pages. How to think about unit economics by working backwards from a revenue target.

**Blockers / what I'm stuck on:** The hardest part was understanding the difference between private audit results and public shared audit pages. I had to make sure the shareable page only stores privacy-safe fields and does not expose email, company name, monthly spend, or other identifying details. Next.js dynamic route typing also required extra care because newer App Router versions expect async `params` in generated page types. Pricing research took longer than expected because vendor pricing pages change names and plans often — for example ChatGPT Team became Business, Cursor now has Pro+/Ultra, and Windsurf changed its Pro and Teams pricing.

**Plan for tomorrow:** The three most important things left — talk to 3 real people for `USER_INTERVIEWS.md` (do this first), write `REFLECTION.md` honestly, complete `README.md` and `ARCHITECTURE.md`, run Lighthouse audit, final submission check.
