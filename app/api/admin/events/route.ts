import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Missing auth" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    }
  );

  const body = await req.json();
  const { title, slug, capacity_per_slot } = body;

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user)
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });

  const { data, error } = await supabase
    .from("events")
    .insert({
      owner_user_id: userData.user.id,
      title,
      slug,
      capacity_per_slot,
      start_date: "2026-02-25",
      end_date: "2026-03-25",
      slot_duration_minutes: 45,
      day_start_time: "16:30",
      day_end_time: "19:30",
      timezone: "America/Argentina/Buenos_Aires",
    })
    .select("id, slug")
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, event: data });
}