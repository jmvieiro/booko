import { NextResponse } from "next/server";
import { supabaseServer } from "../../../../lib/supabaseServer";
import { Resend } from "resend";
import { telegramSend } from "../../../../lib/telegram";

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

  // // 🔔 Notificación al admin por email (opcional pero recomendado)
  // try {
  //   const resend = new Resend(process.env.RESEND_API_KEY!);

  //   // traemos el evento para poner el título
  //   const { data: event } = await supabase
  //     .from("events")
  //     .select("title, slug")
  //     .eq("id", eventId)
  //     .single();

  //   const when = slotStart.slice(0, 16).replace("T", " ");
  //   const subject = `Nueva reserva: ${event?.title ?? "Evento"}`;

  //   await resend.emails.send({
  //     from: "Booko <onboarding@resend.dev>",
  //     to: process.env.ADMIN_NOTIFY_EMAIL!,
  //     subject,
  //     text:
  //       `Nueva reserva\n` +
  //       `Evento: ${event?.title ?? eventId}\n` +
  //       `Cuando: ${when}\n` +
  //       `Nombre: ${guestName}\n` +
  //       `Personas: ${peopleCount}\n\n` +
  //       `Panel: ${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/admin`,
  //   });
  // } catch (e) {
  //   // No rompemos la reserva si falla el email
  //   console.error("Resend notify failed", e);
  // }

  // 🔔 Notificación Telegram (no bloqueante)
  telegramSend(
    `🍼 Nueva reserva\n` +
    `Nombre: ${guestName}\n` +
    `Personas: ${peopleCount}\n` +
    `Horario: ${slotStart.replace("T", " ").slice(0, 16)}`
  );

  return NextResponse.json({ ok: true, bookingId: data });
}