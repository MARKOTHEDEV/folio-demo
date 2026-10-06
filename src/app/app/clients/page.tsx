"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/client-api";
import type { ClientView } from "@/lib/types";

const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Germany", "Canada"];

export default function Clients() {
  const [list, setList] = useState<ClientView[] | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", country: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = () => api<{ data: ClientView[] }>("/api/clients").then((r) => r.ok && setList(r.data.data));
  useEffect(() => {
    load();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await api<{ client: ClientView }>("/api/clients", { method: "POST", body: form });
    setBusy(false);
    if (!r.ok) return setError(r.data.error ?? "Couldn't add the client.");
    setNotice(`${r.data.client.name} added`);
    setForm({ name: "", email: "", country: "" });
    setOpen(false);
    load();
  }

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
        {!open && <button className="btn btn-primary" onClick={() => { setOpen(true); setNotice(null); }}>Add client</button>}
      </div>
      {notice && <p role="status" className="mt-4 text-sm text-green font-semibold">{notice}</p>}
      {open && (
        <form onSubmit={add} className="panel p-6 mt-6 grid sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label" htmlFor="client-name">Client name</label>
            <input id="client-name" className="field" placeholder="Acme Studio" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="client-email">Billing email</label>
            <input id="client-email" type="email" className="field" placeholder="billing@acme.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="client-country">Country</label>
            <select id="client-country" className="field" value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} required>
              <option value="">Choose…</option>
              {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {error && <p role="alert" className="text-danger text-sm sm:col-span-3">{error}</p>}
          <div className="sm:col-span-3 flex gap-3">
            <button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save client"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="panel mt-6 overflow-hidden">
        {list === null ? (
          <p className="p-6 text-muted text-sm">Loading…</p>
        ) : list.length === 0 ? (
          <p className="p-10 text-center text-muted text-sm">No clients yet. Add the first one to start invoicing.</p>
        ) : (
          <ul>
            {list.map((c) => (
              <li key={c.id} className="flex items-center justify-between p-4 border-b border-line last:border-0 text-sm">
                <div>
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-muted">{c.email} · {c.country}</p>
                </div>
                <Link href={`/app/invoices/new?client=${c.id}`} className="btn btn-ghost">Invoice {c.name.split(" ")[0]}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
