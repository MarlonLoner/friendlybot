"use client";

import { FormEvent, ReactNode, useEffect, useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { adminStorageKey } from "@/lib/admin-storage";

export function getStoredAdminCode() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(adminStorageKey) ?? window.sessionStorage.getItem(adminStorageKey) ?? "";
}

export function AdminAuthGate({ children }: { children: ReactNode }) {
  const [code, setCode] = useState("");
  const [remember, setRemember] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(nextCode: string) {
    const response = await fetch("/api/admin/auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ code: nextCode })
    });

    return response.ok;
  }

  useEffect(() => {
    const storedCode = getStoredAdminCode();

    if (!storedCode) {
      setIsChecking(false);
      return;
    }

    verify(storedCode)
      .then((ok) => {
        if (ok) {
          setIsAuthed(true);
        } else {
          window.localStorage.removeItem(adminStorageKey);
          window.sessionStorage.removeItem(adminStorageKey);
        }
      })
      .finally(() => setIsChecking(false));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const ok = await verify(code);

    if (!ok) {
      setError("That access code does not match this environment.");
      setIsSubmitting(false);
      return;
    }

    const storage = remember ? window.localStorage : window.sessionStorage;
    storage.setItem(adminStorageKey, code);
    setIsAuthed(true);
    setIsSubmitting(false);
  }

  if (isChecking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <Loader2 className="h-6 w-6 animate-spin text-eclipse-gold" aria-hidden="true" />
      </div>
    );
  }

  if (isAuthed) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-eclipse-blue px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center">
        <form onSubmit={handleSubmit} className="w-full rounded-lg bg-white p-6 text-eclipse-ink shadow-soft">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-eclipse-gold text-eclipse-blue">
            <LockKeyhole className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-2xl font-bold">Admin access</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Enter the `ADMIN_ACCESS_CODE` for this deployment to manage Eclipse FriendlyBot.</p>

          <label htmlFor="admin-code" className="mt-6 block text-sm font-semibold text-eclipse-ink">
            Access code
          </label>
          <input
            id="admin-code"
            type="password"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition focus:border-eclipse-gold focus:ring-2 focus:ring-eclipse-gold/30"
            placeholder="friendlybot-admin"
            autoComplete="current-password"
          />

          <label className="mt-4 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-eclipse-gold focus:ring-eclipse-gold"
            />
            Remember on this device
          </label>

          {error ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting || !code.trim()}
            className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-eclipse-gold px-4 text-sm font-semibold text-eclipse-blue transition hover:bg-[#e8b957] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LockKeyhole className="h-4 w-4" aria-hidden="true" />}
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
