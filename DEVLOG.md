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
