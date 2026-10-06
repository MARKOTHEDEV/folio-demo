"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { formatMoney } from "@/lib/money";
import type { InvoiceView } from "@/lib/types";

export default function Invoices() {
  const [q, setQ] = useState("");
  const [list, setList] = useState<InvoiceView[] | null>(null);

  // Search as you type: the list asks the server for each new term.
  useEffect(() => {
    const t = setTimeout(() => {
      api<{ data: InvoiceView[] }>(`/api/invoices${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`).then((r) => r.ok && setList(r.data.data));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q]);

  const outstanding = (list ?? []).filter((i) => i.status === "sent").reduce((s, i) => s + i.totals.total, 0);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          {!q && list && list.length > 0 && <p className="text-muted text-sm mt-1">Outstanding <span className="num text-ink font-semibold">{formatMoney(outstanding)}</span></p>}
        </div>
        <Link href="/app/invoices/new" className="btn btn-primary">New invoice</Link>
      </div>
      <div className="mt-6">
        <label htmlFor="search" className="sr-only">Search invoices</label>
        <input id="search" className="field max-w-sm" placeholder="Search by client or number" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="panel mt-4 overflow-hidden">
        {list === null ? (
          <p className="p-6 text-muted text-sm">Loading…</p>
        ) : list.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-semibold">{q ? `No invoices match "${q}"` : "No invoices yet"}</p>
            {!q && <p className="text-muted text-sm mt-1">Add a client, then create your first invoice.</p>}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-line">
              <tr><th className="p-4 font-medium">Number</th><th className="p-4 font-medium">Client</th><th className="p-4 font-medium">Due</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium text-right">Total</th></tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0 hover:bg-paper">
                  <td className="p-4"><Link href={`/app/invoices/${i.id}`} className="font-semibold hover:text-green">{i.number}</Link></td>
                  <td className="p-4">{i.client?.name ?? "—"}</td>
                  <td className="p-4 num text-muted">{i.dueDate}</td>
                  <td className="p-4"><StatusBadge status={i.status} /></td>
                  <td className="p-4 num text-right">{formatMoney(i.totals.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
