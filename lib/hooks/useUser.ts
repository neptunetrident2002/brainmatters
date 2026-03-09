"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function getUser() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { setLoading(false); return; }

      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();

      setUser(data);
      setLoading(false);
    }

    getUser();

    // Realtime: update credit balance when it changes elsewhere
    const channel = supabase
      .channel("user-credits")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "users" },
        (payload) => { setUser(payload.new as User); }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { user, loading };
}
