import { breakMode, newInvoice, readBooks, saveBooks, view } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";

/** The invoice list; ?q= searches the number and the client's name. */
export async function GET(req: Request) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const b = await readBooks(user.email);
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().toLowerCase();
  let list = b.invoices.map((inv) => view(b, inv)).reverse();
  if (q) list = breakMode() === "search" ? [] : list.filter((i) => i.number.toLowerCase().includes(q) || (i.client?.name.toLowerCase().includes(q) ?? false));
  return Response.json({ data: list, count: list.length });
}

export async function POST(req: Request) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { clientId?: string; dueInDays?: number };
  const b = await readBooks(user.email);
  if (!b.clients.some((c) => c.id === body.clientId)) return bad("Pick a client for this invoice.");
  const days = [7, 14, 30].includes(Number(body.dueInDays)) ? Number(body.dueInDays) : 14;
  const inv = newInvoice(b, body.clientId!, days);
  await saveBooks(b);
  return Response.json({ message: "Invoice created", invoice: view(b, inv) }, { status: 201 });
}
