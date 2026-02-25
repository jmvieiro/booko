"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient"; // ✅ import seguro sin alias

export default function AdminEventsPage() {
  const router = useRouter();
  const [authHeader, setAuthHeader] = useState<string | null>(null);

  const [title, setTitle] = useState("Visitas a Benjamín");
  const [slug, setSlug] = useState("benjamin");
  const [capacity, setCapacity] = useState(2);

  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.push("/admin/login");
      else setAuthHeader(`Bearer ${data.session.access_token}`);
    });
  }, [router]);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!authHeader) return;

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({
        title,
        slug,
        capacity_per_slot: capacity,
      }),
    });

    const json = await res.json();
    if (!res.ok) return setMsg(json.error ?? "Error creando evento");

    const link = `${window.location.origin}/e/${json.event.slug}`;
    setMsg(`✅ Evento creado. Link: ${link}`);
  }

  return (
    <div className="p-6 max-w-xl space-y-4">
      <h1 className="text-xl font-semibold">Crear evento</h1>

      <form onSubmit={createEvent} className="space-y-3">
        <div>
          <label className="text-sm opacity-80">Título</label>
          <input
            className="w-full border rounded p-3"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm opacity-80">Slug (link)</label>
          <input
            className="w-full border rounded p-3"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
          <p className="text-xs opacity-60">Ej: benjamin → /e/benjamin</p>
        </div>

        <div>
          <label className="text-sm opacity-80">Cupo por turno</label>
          <input
            className="w-full border rounded p-3"
            type="number"
            min={1}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
          />
        </div>

        <button className="border rounded p-3 w-full">Crear</button>
      </form>

      {msg && <div className="border rounded p-3 text-sm">{msg}</div>}
    </div>
  );
}