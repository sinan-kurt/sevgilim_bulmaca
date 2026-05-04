create extension if not exists pgcrypto;

create table if not exists public.puzzles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  theme text not null check (theme in ('romantic', 'minimal', 'night')),
  final_message text not null,
  questions jsonb not null,
  crossword jsonb not null,
  created_at timestamptz default now()
);

alter table public.puzzles enable row level security;

create index if not exists puzzles_created_at_idx
  on public.puzzles (created_at desc);

create index if not exists puzzles_theme_idx
  on public.puzzles (theme);
