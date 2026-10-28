
create table public.creators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  handle text not null unique,
  display_name text not null,
  bio text,
  photo_url text,
  socials jsonb not null default '{}'::jsonb,
  follower_count integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.creators to anon;
grant select, update on public.creators to authenticated;
grant all on public.creators to service_role;
alter table public.creators enable row level security;
create table public.creator_contacts (
  creator_id uuid primary key references public.creators(id) on delete cascade,
  contact_email text not null,
  note text,
  created_at timestamptz not null default now()
);
grant select on public.creator_contacts to authenticated;
grant all on public.creator_contacts to service_role;
alter table public.creator_contacts enable row level security;
create policy "Creator or admin reads contact" on public.creator_contacts for select to authenticated
  using (public.has_role(auth.uid(),'admin')
    or lower(contact_email) = lower(auth.jwt() ->> 'email')
    or exists (select 1 from public.creators cr where cr.id = creator_id and cr.user_id = auth.uid()));
create policy "Admins manage creator contacts" on public.creator_contacts for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create policy "Active creator pages are public" on public.creators for select using (active or public.has_role(auth.uid(),'admin') or user_id = auth.uid());
create policy "Creators can update their own page" on public.creators for update to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(),'admin')
    or (user_id is null and exists (select 1 from public.creator_contacts c where c.creator_id = creators.id and lower(c.contact_email) = lower(auth.jwt() ->> 'email'))))
  with check (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "Admins manage creators" on public.creators for all to authenticated
  using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create table public.creator_picks (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  target_type text not null check (target_type in ('resource','bronx_resource','event','business')),
  target_id text not null,
  target_name text not null,
  target_category text,
  note text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (creator_id, target_type, target_id)
);
grant select on public.creator_picks to anon;
grant select, insert, update, delete on public.creator_picks to authenticated;
grant all on public.creator_picks to service_role;
alter table public.creator_picks enable row level security;
create policy "Picks of active creators are public" on public.creator_picks for select
  using (exists (select 1 from public.creators cr where cr.id = creator_id and (cr.active or cr.user_id = auth.uid() or public.has_role(auth.uid(),'admin'))));
create policy "Creators manage their own picks" on public.creator_picks for all to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.creators cr where cr.id = creator_id and cr.user_id = auth.uid()))
  with check (public.has_role(auth.uid(),'admin') or exists (select 1 from public.creators cr where cr.id = creator_id and cr.user_id = auth.uid()));

create table public.creator_events (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.creators(id) on delete cascade,
  kind text not null check (kind in ('page_view','pick_click')),
  target_id text,
  action text,
  occurred_at timestamptz not null default now()
);
grant insert on public.creator_events to anon;
grant select, insert on public.creator_events to authenticated;
grant all on public.creator_events to service_role;
alter table public.creator_events enable row level security;
create policy "Anyone can record a creator event" on public.creator_events for insert to anon, authenticated with check (true);
create policy "Creator or admin reads their counts" on public.creator_events for select to authenticated
  using (public.has_role(auth.uid(),'admin') or exists (select 1 from public.creators cr where cr.id = creator_id and cr.user_id = auth.uid()));

create index creator_picks_target_idx on public.creator_picks (target_id);
create index creator_events_creator_idx on public.creator_events (creator_id, kind);

create trigger creators_set_updated_at before update on public.creators for each row execute function public.set_updated_at();
create trigger creator_picks_set_updated_at before update on public.creator_picks for each row execute function public.set_updated_at();
