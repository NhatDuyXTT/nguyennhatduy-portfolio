-- NHATDUYPN baseline schema for a new Supabase project.
create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password text not null,
  role text not null default 'reseller' check (role in ('admin','reseller')),
  credits bigint not null default 0 check (credits >= 0),
  unlimited boolean not null default false,
  unlimited_expires_at bigint,
  api_allowed boolean not null default false,
  api_key text unique,
  prefix text,
  status text not null default 'active' check (status in ('active','banned')),
  created_at timestamptz not null default now()
);

create table if not exists public.keys (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  duration text not null check (duration in ('1d','3d','7d','15d','30d')),
  max_devices integer not null default 1 check (max_devices between 1 and 20),
  expires_at bigint not null,
  created_by text not null,
  creator_platform text not null default 'web',
  deleted boolean not null default false,
  activated boolean not null default false,
  activated_at bigint,
  hwid text,
  device_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_keys_created_by on public.keys(created_by);
create index if not exists idx_keys_deleted on public.keys(deleted);
create index if not exists idx_keys_expires_at on public.keys(expires_at);
create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_api_key on public.users(api_key);

create table if not exists public.license_devices (
  id uuid primary key default gen_random_uuid(),
  key_id uuid not null references public.keys(id) on delete cascade,
  hwid text not null,
  first_seen_at bigint not null default (floor(extract(epoch from now())*1000)),
  last_seen_at bigint not null default (floor(extract(epoch from now())*1000)),
  unique(key_id, hwid)
);
create index if not exists idx_license_devices_key_id on public.license_devices(key_id);
