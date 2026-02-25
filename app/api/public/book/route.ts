import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { eventId, slotStart, guestName, peopleCount } = body;

  if (!eventId || !slotStart || !guestName || !peopleCount) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = supabaseServer();

  const { data, error } = await supabase.rpc("reserve_slot", {
    p_event_id: eventId,
    p_slot_start: slotStart,
    p_guest_name: guestName,
    p_people_count: peopleCount,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 409 });

  return NextResponse.json({ ok: true, bookingId: data });
}