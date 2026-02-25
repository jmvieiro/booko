import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get("eventId");
  const date = searchParams.get("date"); // YYYY-MM-DD
  if (!eventId || !date) return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const supabase = supabaseServer();

  const dayStart = `${date}T00:00:00.000Z`;
  const dayEnd = `${date}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from("bookings")
    .select("slot_start, people_count")
    .eq("event_id", eventId)
    .eq("status", "active")
    .gte("slot_start", dayStart)
    .lte("slot_start", dayEnd);

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const usedBySlot: Record<string, number> = {};
  for (const b of data ?? []) {
    const key = new Date(b.slot_start as string).toISOString().slice(0, 19);;
    usedBySlot[key] = (usedBySlot[key] ?? 0) + (b.people_count ?? 0);
  }

  return NextResponse.json({ usedBySlot });
}