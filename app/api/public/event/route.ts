import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("events")
    .select("id,title,description,timezone,slot_duration_minutes,capacity_per_slot,start_date,end_date,day_start_time,day_end_time,slug")
    .eq("slug", slug)
    .single();

  if (error) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  return NextResponse.json({ event: data });
}