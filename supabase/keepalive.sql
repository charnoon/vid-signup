-- Lightweight table for GitHub Actions keepalive pings (anon read-only).
-- Run in Supabase SQL Editor after creating or restoring a project.
-- Used by .github/workflows/keep-supabase-awake.yml — not by the Next.js app.

create table if not exists public.keepalive (
  id uuid primary key default gen_random_uuid(),
  checked_at timestamptz not null default now()
);

alter table public.keepalive enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'keepalive'
      and policyname = 'Allow anon read keepalive'
  ) then
    create policy "Allow anon read keepalive"
    on public.keepalive
    for select
    to anon
    using (true);
  end if;
end $$;

insert into public.keepalive (checked_at)
select now()
where not exists (select 1 from public.keepalive);
