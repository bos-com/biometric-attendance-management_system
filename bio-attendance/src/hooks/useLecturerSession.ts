"use client";

import { useCallback, useEffect, useState } from "react";

type SessionPayload = {
  userId: string;
  role?: string;
  expiresAt?: string | number | Date;
  fullName?: string;
  [key: string]: unknown;
};

type SessionResponse = {
  success: boolean;
  session?: SessionPayload | null;
  message?: string;
};

export const useLecturerSession = () => {
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/session", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as SessionResponse | null;
        setSession(null);
        setError(body?.message ?? "Not authenticated");
        return;
      }

      const data = (await res.json()) as SessionResponse;
      setSession(data.session ?? null);
    } catch (err) {
      setSession(null);
      setError(err instanceof Error ? err.message : "Failed to fetch session");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, error, refresh: fetchSession };
};
