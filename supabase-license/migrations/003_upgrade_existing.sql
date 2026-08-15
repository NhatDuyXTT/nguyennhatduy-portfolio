-- Run this instead of 001_schema.sql if the old project already has users/keys tables.
-- Back up first. This migration only adds missing columns/indexes and then installs functions from 002_functions.sql.
create extension if not exists pgcrypto;

alter table public.users add column if not exists credits bigint not null default 0;
alter table public.users add column if not exists unlimited boolean not null default false;
alter table public.users add column if not exists unlimited_expires_at bigint;
alter table public.users add column if not exists api_allowed boolean not null default false;
alter table public.users add column if not exists api_key text;
alter table public.users add column if not exists prefix text;
alter table public.users add column if not exists status text not null default 'active';
alter table public.users add column if not exists created_at timestamptz not null default now();

alter table public.keys add column if not exists creator_platform text not null default 'web';
alter table public.keys add column if not exists deleted boolean not null default false;
alter table public.keys add column if not exists activated boolean not null default false;
alter table public.keys add column if not exists activated_at bigint;
alter table public.keys add column if not exists hwid text;
alter table public.keys add column if not exists device_count integer not null default 0;
alter table public.keys add column if not exists created_at timestamptz not null default now();

create unique index if not exists idx_users_username_unique on public.users(username);
create unique index if not exists idx_users_api_key_unique on public.users(api_key) where api_key is not null;
create unique index if not exists idx_keys_key_unique on public.keys(key);
create index if not exists idx_keys_created_by on public.keys(created_by);
create index if not exists idx_keys_deleted on public.keys(deleted);
create index if not exists idx_keys_expires_at on public.keys(expires_at);

create table if not exists public.license_devices (
  id uuid primary key default gen_random_uuid(),
  key_id uuid not null references public.keys(id) on delete cascade,
  hwid text not null,
  first_seen_at bigint not null default (floor(extract(epoch from now())*1000)),
  last_seen_at bigint not null default (floor(extract(epoch from now())*1000)),
  unique(key_id, hwid)
);
create index if not exists idx_license_devices_key_id on public.license_devices(key_id);
