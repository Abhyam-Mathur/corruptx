-- Reporters table
create extension if not exists pgcrypto;
create extension if not exists cube;
create extension if not exists earthdistance;

create table if not exists public.reporters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  age integer not null check (age >= 18),
  gender text,
  latitude double precision not null,
  longitude double precision not null,
  radius_km double precision not null default 5,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists idx_reporters_location on public.reporters using gist (ll_to_earth(latitude, longitude));
create index if not exists idx_reporters_active on public.reporters (is_active);

-- Reporter assignments table
create table if not exists public.reporter_assignments (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.uploads(id) on delete cascade,
  reporter_id uuid not null references public.reporters(id) on delete cascade,
  status text not null default 'notified',
  created_at timestamptz not null default now(),
  unique(report_id, reporter_id)
);

create index if not exists idx_reporter_assignments_reporter on public.reporter_assignments (reporter_id);
create index if not exists idx_reporter_assignments_report on public.reporter_assignments (report_id);

-- Haversine helper for kilometer distance
create or replace function public.haversine_distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) returns double precision language sql immutable as $$
  select 2 * 6371 * asin(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
    )
  );
$$;

-- Trigger to auto-create assignments when a report with coordinates is added
create or replace function public.create_reporter_assignments_for_report()
returns trigger language plpgsql as $$
begin
  if NEW.latitude is null or NEW.longitude is null then
    return NEW;
  end if;

  insert into public.reporter_assignments (id, report_id, reporter_id, status, created_at)
  select gen_random_uuid(), NEW.id, r.id, 'notified', now()
  from public.reporters r
  where r.is_active
    and haversine_distance_km(NEW.latitude, NEW.longitude, r.latitude, r.longitude) <= coalesce(r.radius_km, 5)
    and not exists (
      select 1 from public.reporter_assignments ra
      where ra.report_id = NEW.id and ra.reporter_id = r.id
    );

  return NEW;
end;
$$;

create trigger trg_create_reporter_assignments
after insert on public.uploads
for each row
execute function public.create_reporter_assignments_for_report();
