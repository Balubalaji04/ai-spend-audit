# Devlog

> To be completed — ongoing

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
