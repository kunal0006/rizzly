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
