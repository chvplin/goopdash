import { createClient } from "@supabase/supabase-js";
import type { Team } from "@loot-rush/shared";

const supabaseUrl = process.env.SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } });

type PersistResultInput = {
  matchId: string;
  startedAt: string;
  endedAt: string;
  winningTeam: Team;
  blueScore: number;
  redScore: number;
  payouts: Array<{ playerId: string; team: Team; payout: number; lootDeposited: number; result: "win" | "loss" }>;
};

export async function persistMatchResult(input: PersistResultInput): Promise<void> {
  await supabase.from("matches").insert({
    id: input.matchId,
    started_at: input.startedAt,
    ended_at: input.endedAt,
    winning_team: input.winningTeam,
    blue_score: input.blueScore,
    red_score: input.redScore,
    total_payout: input.winningTeam === "blue" ? input.blueScore : input.redScore
  });

  if (input.payouts.length === 0) return;

  await supabase.from("match_players").insert(
    input.payouts.map((p) => ({
      match_id: input.matchId,
      player_id: p.playerId,
      team: p.team,
      loot_deposited: p.lootDeposited,
      payout: p.payout,
      result: p.result
    }))
  );

  const txRows = input.payouts
    .filter((p) => p.payout > 0)
    .map((p) => ({
      player_id: p.playerId,
      amount: p.payout,
      reason: "match_win_payout",
      match_id: input.matchId
    }));

  if (txRows.length > 0) {
    await supabase.from("transactions").insert(txRows);
    for (const tx of txRows) {
      await supabase.rpc("increment_wallet_balance", { p_player_id: tx.player_id, p_amount: tx.amount });
    }
  }
}
