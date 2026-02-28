"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/admin/login");
      else setEmail(data.user.email ?? null);
    });
  }, [router]);

  if (!email) return null; // o un loader

  return (
    <div className="p-6"> 
      <h1 className="text-xl font-semibold">Simple Book </h1>
      <h2 className="text-md font-semibold">Panel Admin</h2>
      <p className="opacity-80">Logueado como: {email ?? "..."}</p>
    </div>
  );
}