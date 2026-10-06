"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { OtpInput } from "@/components/OtpInput";
import { setToken } from "@/lib/client-api";

export function VerifyForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function verify(value = code) {
    if (value.length !== 6 || busy) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: value }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error ?? "That code didn't work.");
    }
    setToken(data.token);
    router.push("/app");
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        verify();
      }}
      className="space-y-5"
    >
      <OtpInput
        value={code}
        invalid={!!error}
        disabled={busy}
        onChange={(v) => {
          setCode(v);
          setError(null);
          if (v.length === 6) verify(v);
        }}
      />
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy || code.length !== 6}>{busy ? "Checking…" : "Verify and continue"}</button>
      <p className="text-sm text-muted text-center"><Link href="/signup" className="underline">Use a different email</Link></p>
    </form>
  );
}
