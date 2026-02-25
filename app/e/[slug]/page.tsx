"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

function buildSlots(date: string, start = "16:30", end = "19:30", minutes = 45) {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const slots: string[] = [];
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    for (let t = startMin; t + minutes <= endMin; t += minutes) {
        const hh = String(Math.floor(t / 60)).padStart(2, "0");
        const mm = String(t % 60).padStart(2, "0");
        slots.push(`${date}T${hh}:${mm}:00`);
    }
    return slots;
}

export default function PublicEventPage() {
    const params = useParams<{ slug: string }>();
    const slug = params?.slug;

    const [event, setEvent] = useState<any>(null);
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [usedBySlot, setUsedBySlot] = useState<Record<string, number>>({});
    const [name, setName] = useState("");
    const [people, setPeople] = useState(1);
    const [chosen, setChosen] = useState<string | null>(null);
    const [msg, setMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!slug) return;
        fetch(`/api/public/event?slug=${encodeURIComponent(slug)}`)
            .then((r) => r.json())
            .then((j) => setEvent(j.event));
    }, [slug]);

    useEffect(() => {
        if (!event?.id) return;
        fetch(`/api/public/availability?eventId=${event.id}&date=${date}`)
            .then((r) => r.json())
            .then((j) => setUsedBySlot(j.usedBySlot ?? {}));
    }, [event?.id, date]);

    const slots = useMemo(() => {
        if (!event) return [];
        return buildSlots(date, event.day_start_time, event.day_end_time, event.slot_duration_minutes);
    }, [date, event]);

    async function book() {
        setMsg(null);
        if (!event?.id || !chosen) return setMsg("Elegí un horario");
        if (!name.trim()) return setMsg("Poné tu nombre");

        const res = await fetch("/api/public/book", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                eventId: event.id,
                slotStart: chosen,
                guestName: name.trim(),
                peopleCount: people,
            }),
        });

        const json = await res.json();
        if (!res.ok) {
            const msg = (json?.error ?? "").toLowerCase().includes("slot full")
                ? "Ese horario ya está completo. Elegí otro 🙏"
                : (json.error ?? "No se pudo reservar");
            return setMsg(msg);
        }
        setMsg("✅ Reservado. ¡Gracias!");

        // refrescar cupos
        fetch(`/api/public/availability?eventId=${event.id}&date=${date}`)
            .then((r) => r.json())
            .then((j) => setUsedBySlot(j.usedBySlot ?? {}));

        setChosen(null);
        setName("");
        setPeople(1);
    }

    if (!slug) return <div className="p-6">Cargando…</div>;
    if (!event) return <div className="p-6">Cargando evento…</div>;

    return (
        <div className="p-6 max-w-xl space-y-4">
            <h1 className="text-2xl font-semibold">{event.title}</h1>

            <div className="border rounded p-3 space-y-2">
                <label className="text-sm opacity-80">Elegí día</label>
                <input
                    className="border rounded p-2 w-full"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <div className="text-sm opacity-80">Horarios</div>
                <div className="grid grid-cols-2 gap-2">
                    {slots.map((s) => {
                        const used = usedBySlot[s] ?? 0;
                        const remaining = event.capacity_per_slot - used;
                        const disabled = remaining <= 0;
                        const time = s.slice(11, 16);
                        const active = chosen === s;

                        return (
                            <button
                                key={s}
                                disabled={disabled}
                                onClick={() => setChosen(s)}
                                className={`border rounded p-3 text-left ${disabled ? "opacity-40" : ""} ${active ? "border-black" : ""}`}
                            >
                                <div className="font-medium">{time}</div>
                                <div className="text-xs opacity-70">{disabled ? "Completo" : `Cupos: ${remaining}`}</div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="border rounded p-3 space-y-3">
                <div>
                    <label className="text-sm opacity-80">Tu nombre</label>
                    <input className="border rounded p-2 w-full" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div>
                    <label className="text-sm opacity-80">Cuántos son</label>
                    <select className="border rounded p-2 w-full" value={people} onChange={(e) => setPeople(Number(e.target.value))}>
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                    </select>
                </div>

                <button
                    onClick={book}
                    disabled={!chosen || !name.trim()}
                    className={`border rounded p-3 w-full ${(!chosen || !name.trim()) ? "opacity-40" : ""}`}
                >Reservar
                </button>

                {msg && <p className="text-sm">{msg}</p>}
            </div>
        </div>
    );
}