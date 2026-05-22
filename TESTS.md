# Tests

Automated tests for the SpendScope audit engine. All tests live in a single file and run with Jest.

| Test # | File | What it covers | How to run |
|--------|------|----------------|------------|
| 1 | `src/lib/__tests__/auditEngine.test.ts` | Cursor Business plan with under 5 seats → downgrade to Pro ($40/mo savings) | `npm test` |
| 2 | `src/lib/__tests__/auditEngine.test.ts` | GitHub Copilot Enterprise with under 20 seats → downgrade to Business ($100/mo savings) | `npm test` |
| 3 | `src/lib/__tests__/auditEngine.test.ts` | Claude Team with under 3 seats → switch to individual Pro ($20/mo savings) | `npm test` |
| 4 | `src/lib/__tests__/auditEngine.test.ts` | ChatGPT Plus + Claude Pro at equal spend → flags one as redundant ($20 savings) | `npm test` |
| 5 | `src/lib/__tests__/auditEngine.test.ts` | Anthropic API spend over $500 → Credex recommendation (~$120 savings at $800/mo) | `npm test` |
| 6 | `src/lib/__tests__/auditEngine.test.ts` | Cursor Pro + Windsurf Pro together → Windsurf flagged redundant ($15 savings) | `npm test` |
| 7 | `src/lib/__tests__/auditEngine.test.ts` | Cursor Pro with more seats than team size → seat bloat detection (savings greater than 0) | `npm test` |
| 8 | `src/lib/__tests__/auditEngine.test.ts` | Cursor Pro matched to team size and spend → no savings (`totalMonthlySavings === 0`) | `npm test` |

## How to Run Tests

```bash
npm test
```

## CI Status

Tests run automatically on every push to main via `.github/workflows/ci.yml`

## Coverage

The audit engine (`src/lib/auditEngine.ts`) is the primary tested module.
All 8 core business rules are covered by automated tests.
