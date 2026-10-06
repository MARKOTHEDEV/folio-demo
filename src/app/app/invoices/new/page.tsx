"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { ClientView, InvoiceView } from "@/lib/types";

function NewInvoiceForm() {
  const router = useRouter();
  const preset = useSearchParams().get("client") ?? "";
  const [clients, setClients] = useState<ClientView[] | null>(null);
  const [clientId, setClientId] = useState(preset);
  const [due, setDue] = useState("14");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ data: ClientView[] }>("/api/clients").then((r) => r.ok && setClients(r.data.data));
  }, []);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await api<{ invoice: InvoiceView }>("/api/invoices", { method: "POST", body: { clientId, dueInDays: Number(due) } });
    if (!r.ok) {
      setBusy(false);
      return setError(r.data.error ?? "Couldn't create the invoice.");
    }
    router.push(`/app/invoices/${r.data.invoice.id}`);
  }

  if (clients && clients.length === 0) {
    return (
      <div className="panel p-10 text-center mt-6">
        <p className="font-semibold">Add a client first</p>
        <p className="text-muted text-sm mt-1">Every invoice is billed to a client.</p>
        <Link href="/app/clients" className="btn btn-primary mt-5">Add client</Link>
      </div>
    );
  }

  return (
    <form onSubmit={create} className="panel p-6 mt-6 max-w-lg space-y-4">
      <div>
        <label className="label" htmlFor="invoice-client">Bill to</label>
        <select id="invoice-client" className="field" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
          <option value="">Choose a client…</option>
          {(clients ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div>
        <label className="label" htmlFor="invoice-due">Payment due</label>
        <select id="invoice-due" className="field" value={due} onChange={(e) => setDue(e.target.value)}>
          <option value="7">In 7 days</option>
          <option value="14">In 14 days</option>
          <option value="30">In 30 days</option>
        </select>
      </div>
      {error && <p role="alert" className="text-danger text-sm">{error}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? "Creating…" : "Create invoice"}</button>
    </form>
  );
}

export default function NewInvoice() {
  return (
    <div>
      <Link href="/app" className="text-sm text-muted hover:text-ink">Back to invoices</Link>
      <h1 className="text-3xl font-bold tracking-tight mt-2">New invoice</h1>
      <Suspense>
        <NewInvoiceForm />
      </Suspense>
    </div>
  );
}
