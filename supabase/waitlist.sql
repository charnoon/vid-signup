create extension if not exists pgcrypto;

create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null unique,
  role text,
  interest text,
  source text default 'signup_page',
  created_at timestamptz default now(),
  consent boolean default true
);

alter table public.waitlist
add column if not exists last_name text;

update public.waitlist
set last_name = ''
where last_name is null;

alter table public.waitlist
alter column last_name set not null;

alter table public.waitlist
add column if not exists marketing_consent boolean default false;
