-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Extends Supabase Auth)
create table if not exists public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  token_balance integer not null default 10, -- 10 free tokens on signup (2 analyses)
  subscription_tier text not null default 'Cub', -- Cub, Scout, Alpha, Grizzly+
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Users
alter table public.users enable row level security;
create policy "Users can view their own profile" on public.users for select using (auth.uid() = id);

-- TRANSACTIONS TABLE
create table if not exists public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  amount_inr numeric not null,
  tokens_added integer not null,
  razorpay_order_id text unique not null,
  razorpay_payment_id text,
  status text not null default 'created', -- created, paid, failed
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS for Transactions
alter table public.transactions enable row level security;
create policy "Users can view their own transactions" on public.transactions for select using (auth.uid() = user_id);

-- FUNCTION: Secure Token Deduction
create or replace function deduct_tokens(user_id uuid, amount integer)
returns boolean as $$
declare
  current_balance integer;
begin
  -- Lock the row for update to prevent concurrent race conditions
  select token_balance into current_balance from public.users where id = user_id for update;
  
  if current_balance >= amount then
    update public.users set token_balance = token_balance - amount where id = user_id;
    return true;
  else
    return false;
  end if;
end;
$$ language plpgsql security definer;

-- ==========================================
-- V2 EVOLUTION: AI Dating Intelligence Platform
-- ==========================================

-- Alter Users table for V2 logic (Ultra Pro tier and free limits)
-- Note: V1 used token_balance, V2 adds plan_type and free_uses
alter table public.users add column if not exists plan_type text default 'free';
alter table public.users add column if not exists free_uses_remaining int default 1;

-- USER PERSONAS (Feature 3 Questionnaire)
create table if not exists public.user_personas (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  vibe text,
  humor_type text,
  dating_goals text,
  personality_traits text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.user_personas enable row level security;
create policy "Users can view/edit their own persona" on public.user_personas for all using (auth.uid() = user_id);

-- ANALYSES HISTORY (Features 1 & 2)
create table if not exists public.analyses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  analysis_type text not null, -- 'target_profile', 'self_profile'
  result_data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.analyses enable row level security;
create policy "Users can view their own analyses" on public.analyses for select using (auth.uid() = user_id);
create policy "Users can insert their own analyses" on public.analyses for insert with check (auth.uid() = user_id);

-- SAVED PROMPTS
create table if not exists public.saved_prompts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  prompt_text text not null,
  tone text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.saved_prompts enable row level security;
create policy "Users can manage their own prompts" on public.saved_prompts for all using (auth.uid() = user_id);
