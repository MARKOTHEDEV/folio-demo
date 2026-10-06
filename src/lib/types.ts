import type { Totals } from "./money";

export type ClientView = { id: string; name: string; email: string; country: string };
export type InvoiceView = {
  id: string;
  number: string;
  status: "draft" | "sent" | "paid";
  taxRate: number;
  dueDate: string;
  items: { id: string; description: string; qty: number; unitPrice: number }[];
  client: { id: string; name: string; email: string } | null;
  totals: Totals;
  payment?: { method: string; reference: string };
};
