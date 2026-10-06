"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { api } from "@/lib/client-api";
import { formatMoney } from "@/lib/money";
import type { InvoiceView } from "@/lib/types";

const TAX_RATES = [0, 5, 7.5, 16, 20];

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [inv, setInv] = useState<InvoiceView | null | undefined>(undefined);
  const [item, setItem] = useState({ description: "", qty: "1", price: "" });
  const [pay, setPay] = useState({ method: "bank_transfer", reference: "" });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(() => api<{ invoice: InvoiceView }>(`/api/invoices/${id}`).then((r) => setInv(r.ok ? r.data.invoice : null)), [id]);
  useEffect(() => {
    load();
  }, [load]);

  async function run(what: string, path: string, method: string, body?: unknown) {
    setBusy(what);
    setError(null);
    setNotice(null);
    const r = await api<{ invoice: InvoiceView; message?: string }>(path, { method, body });
    setBusy(null);
    if (!r.ok) {
      setError(r.data.error ?? "Something went wrong.");
      return false;
    }
    setInv(r.data.invoice);
    if (r.data.message) setNotice(r.data.message);
    return true;
  }

  if (inv === undefined) return <p className="text-muted text-sm">Loading…</p>;
  if (inv === null) {
    return (
      <div className="panel p-10 text-center">
        <p className="font-semibold">This invoice isn&apos;t here</p>
        <Link href="/app" className="btn btn-ghost mt-4">Back to invoices</Link>
      </div>
    );
  }
  const draft = inv.status === "draft";

  return (
    <div>
      <Link href="/app" className="text-sm text-muted hover:text-ink">Back to invoices</Link>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <h1 className="text-3xl font-bold tracking-tight">{inv.number}</h1>
        <StatusBadge status={inv.status} />
      </div>
      <p className="text-muted text-sm mt-1">
        Billed to <span className="text-ink font-semibold">{inv.client?.name}</span> · due <span className="num">{inv.dueDate}</span>
      </p>
      {notice && <p role="status" className="mt-4 text-sm text-green font-semibold">{notice}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-danger">{error}</p>}

      <div className="grid lg:grid-cols-[1fr_300px] gap-6 mt-6 items-start">
        <div className="panel overflow-hidden">
          <table className="w-full text-sm">
            <thead className="text-left text-muted border-b border-line">
              <tr><th className="p-4 font-medium">Item</th><th className="p-4 font-medium text-right">Qty</th><th className="p-4 font-medium text-right">Price</th><th className="p-4 font-medium text-right">Amount</th></tr>
            </thead>
            <tbody>
              {inv.items.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-muted">No items yet — add the work below.</td></tr>
              )}
              {inv.items.map((i) => (
                <tr key={i.id} className="border-b border-line">
                  <td className="p-4">{i.description}</td>
                  <td className="p-4 num text-right">{i.qty}</td>
                  <td className="p-4 num text-right">{formatMoney(i.unitPrice)}</td>
                  <td className="p-4 num text-right">{formatMoney(i.qty * i.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {draft && (
            <form
              className="p-4 grid sm:grid-cols-[1fr_80px_120px_auto] gap-3 items-end bg-paper border-t border-line"
              onSubmit={async (e) => {
                e.preventDefault();
                const ok = await run("item", `/api/invoices/${inv.id}/items`, "POST", { description: item.description, qty: Number(item.qty), unitPrice: Math.round(Number(item.price) * 100) });
                if (ok) setItem({ description: "", qty: "1", price: "" });
              }}
            >
              <div>
                <label className="label" htmlFor="item-description">Description</label>
                <input id="item-description" className="field" placeholder="Brand refresh" value={item.description} onChange={(e) => setItem({ ...item, description: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="item-qty">Qty</label>
                <input id="item-qty" className="field num" inputMode="numeric" value={item.qty} onChange={(e) => setItem({ ...item, qty: e.target.value })} required />
              </div>
              <div>
                <label className="label" htmlFor="item-price">Price ($)</label>
                <input id="item-price" className="field num" inputMode="decimal" placeholder="1200" value={item.price} onChange={(e) => setItem({ ...item, price: e.target.value })} required />
              </div>
              <button className="btn btn-ghost" disabled={busy === "item"}>{busy === "item" ? "Adding…" : "Add item"}</button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="panel p-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="num">{formatMoney(inv.totals.subtotal)}</span></div>
            <div className="flex justify-between items-center gap-3">
              <label htmlFor="tax-rate" className="text-muted">Tax</label>
              {draft ? (
                <select
                  id="tax-rate"
                  className="field max-w-[110px] py-1.5"
                  value={String(inv.taxRate)}
                  onChange={(e) => run("tax", `/api/invoices/${inv.id}`, "PATCH", { taxRate: Number(e.target.value) })}
                >
                  {TAX_RATES.map((t) => <option key={t} value={t}>{t}%</option>)}
                </select>
              ) : (
                <span>{inv.taxRate}%</span>
              )}
            </div>
            <div className="flex justify-between"><span className="text-muted">Tax amount</span><span className="num">{formatMoney(inv.totals.tax)}</span></div>
            <div className="flex justify-between font-bold text-lg border-t border-line pt-3"><span>Total</span><span className="num" data-testid="invoice-total">{formatMoney(inv.totals.total)}</span></div>
          </div>

          {draft && (
            <button className="btn btn-primary w-full" disabled={busy === "send" || inv.items.length === 0} onClick={() => run("send", `/api/invoices/${inv.id}/send`, "POST")}>
              {busy === "send" ? "Sending…" : "Send invoice"}
            </button>
          )}

          {inv.status === "sent" && (
            <form
              className="panel p-5 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run("pay", `/api/invoices/${inv.id}/pay`, "POST", pay);
              }}
            >
              <p className="font-semibold text-sm">Record a payment</p>
              <div>
                <label className="label" htmlFor="pay-method">Paid by</label>
                <select id="pay-method" className="field" value={pay.method} onChange={(e) => setPay({ ...pay, method: e.target.value })}>
                  <option value="bank_transfer">Bank transfer</option>
                  <option value="card">Card</option>
                  <option value="cash">Cash</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="pay-reference">Reference (optional)</label>
                <input id="pay-reference" className="field" placeholder="TRF-20931" value={pay.reference} onChange={(e) => setPay({ ...pay, reference: e.target.value })} />
              </div>
              <button className="btn btn-primary w-full" disabled={busy === "pay"}>{busy === "pay" ? "Saving…" : "Mark as paid"}</button>
            </form>
          )}

          {inv.status === "paid" && (
            <div className="panel p-5 text-sm">
              <p className="font-semibold text-green">Paid in full</p>
              <p className="text-muted mt-1 capitalize">{inv.payment?.method.replace("_", " ")}{inv.payment?.reference ? ` · ${inv.payment.reference}` : ""}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
