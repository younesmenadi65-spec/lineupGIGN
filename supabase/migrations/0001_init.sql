-- ROCKFORD LINEUPS : schéma initial. À exécuter dans Supabase > SQL Editor.
create extension if not exists pgcrypto;

create type lineup_category   as enum ('smoke','flash','frag');
create type lineup_difficulty as enum ('easy','medium','hard');
create type lineup_status     as enum ('pending','approved','rejected');
create type report_status     as enum ('open','resolved','dismissed');
create type user_role         as enum ('user','admin');

-- ---------- Tables ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,24}$'),
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now()
);

create table public.zones (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.lineups (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  description text not null default '' check (char_length(description) <= 4000),
  category lineup_category not null,
  difficulty lineup_difficulty not null default 'medium',
  difficulty_rank smallint generated always as (case difficulty when 'easy' then 1 when 'medium' then 2 else 3 end) stored,
  throw_type text check (throw_type is null or char_length(throw_type) <= 40),
  start_zone_id uuid,
  target_zone_id uuid,
  author_id uuid,
  status lineup_status not null default 'pending',
  thumbnail_url text,
  video_url text check (video_url is null or video_url ~* '^https://'),
  map_version text check (map_version is null or char_length(map_version) <= 40),
  tags text[] not null default '{}',
  verified boolean not null default false,
  verified_at timestamptz,
  is_demo boolean not null default false,
  view_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lineups_start_zone_fk  foreign key (start_zone_id)  references public.zones(id) on delete set null,
  constraint lineups_target_zone_fk foreign key (target_zone_id) references public.zones(id) on delete set null,
  constraint lineups_author_fk      foreign key (author_id)      references public.profiles(id) on delete set null,
  constraint verified_needs_date check (not verified or verified_at is not null)
);
create index lineups_status_idx   on public.lineups(status, created_at desc);
create index lineups_category_idx on public.lineups(category);
create index lineups_start_idx    on public.lineups(start_zone_id);
create index lineups_target_idx   on public.lineups(target_zone_id);
create index lineups_author_idx   on public.lineups(author_id);

create table public.lineup_steps (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  step_number int not null check (step_number > 0),
  title text not null check (char_length(title) between 1 and 120),
  instructions text not null default '' check (char_length(instructions) <= 2000),
  image_url text,
  video_url text check (video_url is null or video_url ~* '^https://'),
  created_at timestamptz not null default now(),
  unique (lineup_id, step_number)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, lineup_id)
);

create table public.recent_views (
  user_id uuid not null references auth.users(id) on delete cascade,
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (user_id, lineup_id)
);

create table public.map_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  label text not null default 'Rockford',
  is_active boolean not null default false,
  created_at timestamptz not null default now()
);
create unique index map_images_one_active on public.map_images(is_active) where is_active;

-- Positions relatives à l'image : 0 = bord gauche/haut, 1 = bord droit/bas.
create table public.map_markers (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  x_position numeric(6,5) not null check (x_position between 0 and 1),
  y_position numeric(6,5) not null check (y_position between 0 and 1),
  zone_name text,
  created_at timestamptz not null default now()
);
create index map_markers_lineup_idx on public.map_markers(lineup_id);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  lineup_id uuid not null references public.lineups(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null check (char_length(reason) between 10 and 1000),
  status report_status not null default 'open',
  created_at timestamptz not null default now()
);
create index reports_status_idx on public.reports(status, created_at desc);

-- ---------- Fonctions et triggers ----------
create function public.is_admin() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(nullif(new.raw_user_meta_data->>'username',''), 'joueur_' || substr(new.id::text, 1, 8)));
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger lineups_updated_at before update on public.lineups
  for each row execute function public.set_updated_at();

-- Empêche un utilisateur de se promouvoir admin. (Le SQL Editor n'a pas d'auth.uid() : il reste autorisé.)
create function public.protect_profile_role() returns trigger language plpgsql as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Changement de rôle interdit';
  end if;
  return new;
end $$;
create trigger profiles_protect_role before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Un non-admin ne peut ni publier, ni vérifier, ni marquer comme démo.
create function public.enforce_lineup_rules() returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    if tg_op = 'INSERT' then
      new.status := 'pending'; new.verified := false; new.verified_at := null;
      new.is_demo := false; new.view_count := 0; new.author_id := auth.uid();
    else
      new.status := old.status; new.verified := old.verified; new.verified_at := old.verified_at;
      new.is_demo := old.is_demo; new.view_count := old.view_count; new.author_id := old.author_id;
    end if;
  end if;
  return new;
end $$;
create trigger lineups_enforce_rules before insert or update on public.lineups
  for each row execute function public.enforce_lineup_rules();

create function public.increment_views(p_slug text) returns void
language sql security definer set search_path = public as $$
  update public.lineups set view_count = view_count + 1 where slug = p_slug and status = 'approved';
$$;
grant execute on function public.increment_views(text) to anon, authenticated;

-- ---------- RLS ----------
alter table public.profiles     enable row level security;
alter table public.zones        enable row level security;
alter table public.lineups      enable row level security;
alter table public.lineup_steps enable row level security;
alter table public.favorites    enable row level security;
alter table public.recent_views enable row level security;
alter table public.map_images   enable row level security;
alter table public.map_markers  enable row level security;
alter table public.reports      enable row level security;

create policy profiles_read   on public.profiles for select using (true);
create policy profiles_update on public.profiles for update
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

create policy zones_read  on public.zones for select using (true);
create policy zones_admin on public.zones for all using (public.is_admin()) with check (public.is_admin());

create policy lineups_read on public.lineups for select
  using (status = 'approved' or author_id = auth.uid() or public.is_admin());
create policy lineups_insert on public.lineups for insert
  with check (auth.uid() is not null and author_id = auth.uid());
create policy lineups_update_own on public.lineups for update
  using (author_id = auth.uid() and status = 'pending') with check (author_id = auth.uid());
create policy lineups_admin on public.lineups for all using (public.is_admin()) with check (public.is_admin());

-- Les sous-requêtes ci-dessous respectent la RLS de lineups : seules les fiches visibles sont lisibles.
create policy steps_read on public.lineup_steps for select
  using (exists (select 1 from public.lineups l where l.id = lineup_id));
create policy steps_write_own on public.lineup_steps for all
  using (exists (select 1 from public.lineups l where l.id = lineup_id and l.author_id = auth.uid() and l.status = 'pending'))
  with check (exists (select 1 from public.lineups l where l.id = lineup_id and l.author_id = auth.uid() and l.status = 'pending'));
create policy steps_admin on public.lineup_steps for all using (public.is_admin()) with check (public.is_admin());

create policy favorites_own on public.favorites for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy recent_own    on public.recent_views for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy map_images_read  on public.map_images for select using (true);
create policy map_images_admin on public.map_images for all using (public.is_admin()) with check (public.is_admin());

create policy markers_read  on public.map_markers for select
  using (exists (select 1 from public.lineups l where l.id = lineup_id and l.status = 'approved') or public.is_admin());
create policy markers_admin on public.map_markers for all using (public.is_admin()) with check (public.is_admin());

create policy reports_insert on public.reports for insert with check (reporter_id = auth.uid());
create policy reports_read   on public.reports for select using (reporter_id = auth.uid() or public.is_admin());
create policy reports_admin  on public.reports for update using (public.is_admin()) with check (public.is_admin());
create policy reports_delete on public.reports for delete using (public.is_admin());

-- ---------- Storage ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types) values
  ('lineup-media', 'lineup-media', true, 5242880,  array['image/jpeg','image/png','image/webp']),
  ('map-images',   'map-images',   true, 10485760, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy lineup_media_read on storage.objects for select using (bucket_id in ('lineup-media','map-images'));
create policy lineup_media_upload on storage.objects for insert to authenticated
  with check (bucket_id = 'lineup-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy lineup_media_delete on storage.objects for delete to authenticated
  using (bucket_id = 'lineup-media' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy map_images_upload on storage.objects for all to authenticated
  using (bucket_id = 'map-images' and public.is_admin()) with check (bucket_id = 'map-images' and public.is_admin());
