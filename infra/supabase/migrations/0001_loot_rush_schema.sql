create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  wallet_balance bigint not null default 0 check (wallet_balance >= 0),
  selected_skin uuid null,
  created_at timestamptz not null default now()
);

create table if not exists cosmetics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('skin', 'emote', 'trail')),
  price bigint not null check (price >= 0),
  asset_url text not null,
  rarity text not null,
  created_at timestamptz not null default now()
);

create table if not exists player_cosmetics (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references profiles(id) on delete cascade,
  cosmetic_id uuid not null references cosmetics(id) on delete cascade,
  purchased_at timestamptz not null default now(),
  unique (player_id, cosmetic_id)
);

create table if not exists matches (
  id uuid primary key,
  started_at timestamptz not null,
  ended_at timestamptz not null,
  winning_team text not null check (winning_team in ('blue', 'red')),
  blue_score bigint not null default 0,
  red_score bigint not null default 0,
  total_payout bigint not null default 0
);

create table if not exists match_players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references profiles(id) on delete cascade,
  team text not null check (team in ('blue', 'red')),
  loot_deposited bigint not null default 0,
  payout bigint not null default 0,
  result text not null check (result in ('win', 'loss')),
  unique (match_id, player_id)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references profiles(id) on delete cascade,
  amount bigint not null,
  reason text not null,
  match_id uuid null references matches(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function increment_wallet_balance(p_player_id uuid, p_amount bigint)
returns void
language plpgsql
security definer
as $$
begin
  update profiles
  set wallet_balance = wallet_balance + p_amount
  where id = p_player_id;
end;
$$;
