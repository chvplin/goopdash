import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "../../../../lib/supabaseServer";

export async function POST(request: NextRequest) {
  const { playerId, cosmeticId } = await request.json();
  const supabase = getServerSupabase();

  const { data: cosmetic, error: cosmeticError } = await supabase
    .from("cosmetics")
    .select("id, price")
    .eq("id", cosmeticId)
    .single();

  if (cosmeticError || !cosmetic) {
    return NextResponse.json({ error: "Cosmetic not found." }, { status: 404 });
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("id", playerId)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: "Profile not found." }, { status: 404 });
  }

  if (profile.wallet_balance < cosmetic.price) {
    return NextResponse.json({ error: "Insufficient balance." }, { status: 400 });
  }

  await supabase.from("player_cosmetics").insert({ player_id: playerId, cosmetic_id: cosmeticId });
  await supabase.rpc("increment_wallet_balance", { p_player_id: playerId, p_amount: -cosmetic.price });
  await supabase.from("transactions").insert({
    player_id: playerId,
    amount: -cosmetic.price,
    reason: "shop_purchase"
  });

  return NextResponse.json({ ok: true });
}
