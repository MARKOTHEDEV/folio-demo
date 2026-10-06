import { cookies } from "next/headers";
import type { Totals } from "./money";
import { newId, seal, unseal } from "./token";

/**
 * THE BOOKS: each signed-in person's clients and invoices, kept in one signed
 * cookie. No database — every visitor (and every test run) has their own,
 * and nothing piles up anywhere.
 */
export type Client = { id: string; name: string; email: string; country: string; createdAt: string };
export type Item = { id: string; description: string; qty: number; unitPrice: number };
export type InvoiceStatus = "draft" | "sent" | "paid";
export type Invoice = {
  id: string;
  number: string;
  clientId: string;
  status: InvoiceStatus;
  taxRate: number;
  dueDate: string;
  items: Item[];
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
  payment?: { method: string; reference: string };
};
export type Books = { owner: string; seq: number; clients: Client[]; invoices: Invoice[] };

const BOOKS_COOKIE = "folio_books";
const MAX_CLIENTS = 8;
const MAX_INVOICES = 10;
const MAX_ITEMS = 8;

export const COUNTRIES = ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Germany", "Canada"];
export const TAX_RATES = [0, 5, 7.5, 16, 20];

export type BreakMode = "none" | "totals" | "pay" | "search";
export function breakMode(): BreakMode {
  const m = process.env.FOLIO_BREAK;
  return m === "totals" || m === "pay" || m === "search" ? m : "none";
}

export async function readBooks(owner: string): Promise<Books> {
  const store = await cookies();
  const b = unseal<Books>(store.get(BOOKS_COOKIE)?.value);
  return b && b.owner === owner ? b : { owner, seq: 0, clients: [], invoices: [] };
}

export async function saveBooks(b: Books) {
  b.clients = b.clients.slice(-MAX_CLIENTS);
  b.invoices = b.invoices.slice(-MAX_INVOICES);
  for (const inv of b.invoices) inv.items = inv.items.slice(-MAX_ITEMS);
  const store = await cookies();
  store.set(BOOKS_COOKIE, seal(b), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function totalsOf(inv: Invoice): Totals {
  const subtotal = inv.items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const tax = Math.round((subtotal * inv.taxRate) / 100);
  // The "totals" break: the total forgets the tax.
  return { subtotal, tax, total: breakMode() === "totals" ? subtotal : subtotal + tax };
}

export function view(b: Books, inv: Invoice) {
  const client = b.clients.find((c) => c.id === inv.clientId);
  return { ...inv, client: client ? { id: client.id, name: client.name, email: client.email } : null, totals: totalsOf(inv) };
}

export function newClient(b: Books, name: string, email: string, country: string): Client {
  const c: Client = { id: newId("cl"), name, email, country, createdAt: new Date().toISOString() };
  b.clients.push(c);
  return c;
}

export function newInvoice(b: Books, clientId: string, dueInDays: number): Invoice {
  b.seq += 1;
  const inv: Invoice = {
    id: newId("inv"),
    number: `INV-${String(b.seq).padStart(4, "0")}`,
    clientId,
    status: "draft",
    taxRate: 0,
    dueDate: new Date(Date.now() + dueInDays * 86400e3).toISOString().slice(0, 10),
    items: [],
    createdAt: new Date().toISOString(),
  };
  b.invoices.push(inv);
  return inv;
}

export const newItemId = () => newId("li");
