import { NextRequest, NextResponse } from "next/server";
import { getServerSupabase } from "../../../../lib/supabaseServer";

export async function POST(request: NextRequest) {
  const { playerId, cosmeticId } = await request.json();
  const supabase = getServerSupabase();

  const { data: owned, error } = await supabase
    .from("player_cosmetics")
    .select("id")
    .eq("player_id", playerId)
    .eq("cosmetic_id", cosmeticId)
    .single();

  if (error || !owned) {
    return NextResponse.json({ error: "Cosmetic not owned." }, { status: 403 });
  }

  await supabase.from("profiles").update({ selected_skin: cosmeticId }).eq("id", playerId);
  return NextResponse.json({ ok: true });
}
