"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ForgotForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error ?? "Something went wrong.");
    }
    if (data.mode === "link") {
      setBusy(false);
      return setSentTo(data.email);
    }
    router.push(`/reset?email=${encodeURIComponent(data.email)}`);
  }

  if (sentTo) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm">
          We emailed a reset link to <strong className="text-ink">{sentTo}</strong>. Open it to choose a new password. It works for 30 minutes.
        </p>
        <p className="text-sm text-muted">
          Didn&apos;t get it? Check your spam folder, or <button type="button" className="underline" onClick={() => setSentTo(null)}>try again</button>.
        </p>
        <p className="text-sm text-muted text-center"><Link href="/signin" className="underline">Back to sign in</Link></p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
      </div>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending…" : "Email me a reset code"}</button>
      <p className="text-sm text-muted text-center"><Link href="/signin" className="underline">Back to sign in</Link></p>
    </form>
  );
}
