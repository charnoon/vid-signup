-- Homepage copy (editable in Supabase Table Editor).
-- Keys: intro_text, last_sentence_text, cta_text
-- Values should match how the typewriter expects them (leading space on rotating lines after "Vid.").

create table if not exists public.site_copy (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

comment on table public.site_copy is 'Marketing/homepage strings; edit values in Dashboard.';

insert into public.site_copy (key, value) values
  ('intro_text', ' is an online platform for new music visuals.'),
  ('last_sentence_text', ' prioritises curation over algorithms.'),
  ('cta_text', 'REQUEST EARLY ACCESS')
on conflict (key) do nothing;
