-- Your audits table needs recommendations (NOT NULL).
-- Run only the ALTER lines for columns you are missing.

alter table public.audits
  add column if not exists recommendations jsonb not null default '[]'::jsonb;

alter table public.audits
  add column if not exists total_monthly_savings numeric not null default 0;

alter table public.audits
  add column if not exists total_annual_savings numeric not null default 0;

alter table public.audits
  add column if not exists ai_summary text;

-- Optional — only add if you want this column (not required by the app)
-- alter table public.audits
--   add column if not exists generated_at timestamptz not null default now();
