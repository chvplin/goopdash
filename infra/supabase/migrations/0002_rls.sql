alter table profiles enable row level security;
alter table cosmetics enable row level security;
alter table player_cosmetics enable row level security;
alter table matches enable row level security;
alter table match_players enable row level security;
alter table transactions enable row level security;

create policy "profiles_select_self" on profiles
for select
using (auth.uid() = id);

create policy "profiles_update_non_wallet_fields" on profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id and
  wallet_balance = (select p.wallet_balance from profiles p where p.id = auth.uid())
);

create policy "cosmetics_read_all" on cosmetics
for select
using (true);

create policy "player_cosmetics_select_own" on player_cosmetics
for select
using (auth.uid() = player_id);

create policy "match_players_select_own" on match_players
for select
using (auth.uid() = player_id);

create policy "transactions_select_own" on transactions
for select
using (auth.uid() = player_id);
