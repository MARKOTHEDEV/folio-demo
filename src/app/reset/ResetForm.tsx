"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ResetForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [again, setAgain] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== again) return setError("The two passwords don't match.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/reset", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Something went wrong.");
    setDone(true);
  }

  if (!token) {
    return (
      <p role="alert" className="text-sm">
        This reset link is missing its code. <Link href="/forgot" className="underline">Ask for a new one</Link>.
      </p>
    );
  }
  if (done) {
    return (
      <div className="space-y-4">
        <p role="status" className="text-sm">Your password is updated. Sign in with it to continue.</p>
        <Link href="/signin" className="btn btn-primary w-full block text-center">Sign in</Link>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input id="password" type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required />
      </div>
      <div>
        <label className="label" htmlFor="again">New password again</label>
        <input id="again" type="password" className="field" value={again} onChange={(e) => setAgain(e.target.value)} placeholder="Type it once more" autoComplete="new-password" minLength={8} required />
      </div>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Saving…" : "Set new password"}</button>
    </form>
  );
}
