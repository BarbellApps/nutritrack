-- NutriTrack database schema
-- Run this in the Supabase SQL Editor.

-- ============================================================
-- profiles
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  daily_calorie_goal integer not null default 2000,
  daily_protein_goal_g numeric(6,1) not null default 120,
  daily_carbs_goal_g numeric(6,1) not null default 225,
  daily_fat_goal_g numeric(6,1) not null default 65,
  daily_water_goal_ml integer not null default 2000,
  weight_unit text not null default 'kg' check (weight_unit in ('kg', 'lb')),
  height_cm numeric(5,1),
  goal_weight_kg numeric(5,1),
  activity_level text not null default 'moderate'
    check (activity_level in ('sedentary','light','moderate','active','very_active')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- foods — shared library (source='off'/'system') + user customs (source='user')
-- ============================================================
create table if not exists foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  name text not null,
  brand text,
  barcode text,
  serving_size numeric(8,2) not null default 100,
  serving_unit text not null default 'g',
  calories numeric(7,1) not null default 0,
  protein_g numeric(6,1) not null default 0,
  carbs_g numeric(6,1) not null default 0,
  fat_g numeric(6,1) not null default 0,
  fiber_g numeric(6,1),
  sugar_g numeric(6,1),
  sodium_mg numeric(7,1),
  image_url text,
  ingredients_text text,
  is_custom boolean not null default false,
  source text not null default 'user' check (source in ('user','off','system')),
  created_at timestamptz not null default now()
);

create index if not exists foods_barcode_idx on foods (barcode) where barcode is not null;
create index if not exists foods_name_idx on foods using gin (to_tsvector('english', name));
create index if not exists foods_user_id_idx on foods (user_id);

-- ============================================================
-- food_logs
-- ============================================================
create table if not exists food_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  food_id uuid references foods(id) on delete set null,
  food_name text not null,
  meal_type text not null check (meal_type in ('breakfast','lunch','dinner','snack')),
  logged_date date not null default current_date,
  servings numeric(6,2) not null default 1,
  calories numeric(7,1) not null default 0,
  protein_g numeric(6,1) not null default 0,
  carbs_g numeric(6,1) not null default 0,
  fat_g numeric(6,1) not null default 0,
  photo_url text,
  scan_group_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists food_logs_user_date_idx on food_logs (user_id, logged_date);
create index if not exists food_logs_scan_group_idx on food_logs (scan_group_id) where scan_group_id is not null;

-- ============================================================
-- water_logs
-- ============================================================
create table if not exists water_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  logged_date date not null default current_date,
  amount_ml integer not null,
  created_at timestamptz not null default now()
);

create index if not exists water_logs_user_date_idx on water_logs (user_id, logged_date);

-- ============================================================
-- weight_logs
-- ============================================================
create table if not exists weight_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  logged_date date not null default current_date,
  weight_kg numeric(5,1) not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, logged_date)
);

create index if not exists weight_logs_user_date_idx on weight_logs (user_id, logged_date);

-- ============================================================
-- recipes
-- ============================================================
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  servings numeric(5,1) not null default 1,
  ingredients jsonb not null default '[]',
  total_calories numeric(7,1) not null default 0,
  total_protein_g numeric(6,1) not null default 0,
  total_carbs_g numeric(6,1) not null default 0,
  total_fat_g numeric(6,1) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists recipes_user_id_idx on recipes (user_id);

-- ============================================================
-- favorites — quick-add shortcuts
-- ============================================================
create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  food_id uuid not null references foods(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, food_id)
);

-- ============================================================
-- auth trigger — create profile row on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles enable row level security;
alter table foods enable row level security;
alter table food_logs enable row level security;
alter table water_logs enable row level security;
alter table weight_logs enable row level security;
alter table recipes enable row level security;
alter table favorites enable row level security;

create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);

create policy "foods_select_shared_or_own" on foods for select
  using (user_id is null or user_id = auth.uid());
create policy "foods_insert_own_or_service" on foods for insert
  with check (user_id = auth.uid() or user_id is null);
create policy "foods_update_own" on foods for update using (user_id = auth.uid());
create policy "foods_delete_own" on foods for delete using (user_id = auth.uid());

create policy "food_logs_all_own" on food_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "water_logs_all_own" on water_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "weight_logs_all_own" on weight_logs for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "recipes_all_own" on recipes for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "favorites_all_own" on favorites for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================
-- migration: food photos + ingredients (run on an already-deployed DB —
-- safe/no-op if you're running this whole file fresh)
-- ============================================================
alter table foods add column if not exists image_url text;
alter table foods add column if not exists ingredients_text text;
alter table food_logs add column if not exists photo_url text;
alter table food_logs add column if not exists scan_group_id uuid;
create index if not exists food_logs_scan_group_idx on food_logs (scan_group_id) where scan_group_id is not null;
