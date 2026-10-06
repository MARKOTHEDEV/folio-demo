"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/** Sign up (name + email) or sign in (email): both email a 6-digit code. */
export function StartForm({ withName }: { withName: boolean }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, ...(withName ? { name } : {}) }) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(false);
      return setError(data.error ?? "Something went wrong.");
    }
    router.push(`/verify?email=${encodeURIComponent(data.email)}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {withName && (
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ada Obi" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Work email</label>
        <input id="email" type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required />
      </div>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Sending code…" : withName ? "Create account" : "Email me a code"}</button>
      <p className="text-sm text-muted text-center">
        {withName ? <>Have an account? <Link href="/signin" className="underline">Sign in</Link></> : <>New here? <Link href="/signup" className="underline">Create an account</Link></>}
      </p>
    </form>
  );
}
