"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin` },
    });

    setMsg(error ? error.message : "Listo. Revisá tu email para el link.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={sendLink} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-semibold">Booko</h1>
        <input
          className="w-full border rounded p-3"
          placeholder="tu@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
        />
        <button className="w-full rounded p-3 border">
          Enviar link de autenticación por email
        </button>
        {msg && <p className="text-sm opacity-80">{msg}</p>}
      </form>
    </div>
  );
}