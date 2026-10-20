-- Skema Database Transaksional Supabase (PRD Bagian A6 & Tahap 2)
-- Tabel: subscribers, contact_messages, event_registrations, redirect_map
-- Keamanan: Row Level Security (RLS) diaktifkan TANPA kebijakan publik
-- Akses eksklusif: Hanya service role key melalui server Route Handler

-- 1. Tabel Subscribers (Buletin / Newsletter Double Opt-in)
create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'unsubscribed')),
  confirm_token uuid not null default gen_random_uuid(),
  confirmed_at timestamptz,
  source text,
  created_at timestamptz not null default now()
);

-- 2. Tabel Contact Messages (Pesan Formulir Kontak)
create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

-- 3. Tabel Event Registrations (Pendaftaran Kegiatan & Acara Organisasi)
create table if not exists event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_sanity_id text not null,
  full_name text not null,
  email text not null,
  phone text,
  organization text,
  extra jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (event_sanity_id, email)
);

-- 4. Tabel Redirect Map (Pemetaan URL Lama Blogger ke URL Baru)
create table if not exists redirect_map (
  id uuid primary key default gen_random_uuid(),
  blogger_path text not null unique,
  sanity_id text,
  new_path text,
  status text not null default 'mapped',
  checked_at timestamptz
);

-- Indeks untuk performa query
create index if not exists idx_subscribers_email on subscribers(email);
create index if not exists idx_subscribers_confirm_token on subscribers(confirm_token);
create index if not exists idx_event_reg_event on event_registrations(event_sanity_id);
create index if not exists idx_redirect_blogger_path on redirect_map(blogger_path);

-- RLS (Row Level Security) AKTIF tanpa kebijakan publik
-- Mengamankan NFR-03: Akses anon key (anonim) dari browser ditolak 100%
alter table subscribers enable row level security;
alter table contact_messages enable row level security;
alter table event_registrations enable row level security;
alter table redirect_map enable row level security;
