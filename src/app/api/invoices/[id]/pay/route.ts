import { breakMode, readBooks, saveBooks, view } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";

const METHODS = ["bank_transfer", "card", "cash"];

/** Record that the client paid (no money moves — it's a note on the invoice). */
export async function POST(req: Request, ctx: RouteContext<"/api/invoices/[id]/pay">) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  if (breakMode() === "pay") return bad("Payments are unavailable right now.", 500);
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { method?: string; reference?: string };
  const b = await readBooks(user.email);
  const inv = b.invoices.find((i) => i.id === id);
  if (!inv) return bad("No invoice with that id.", 404);
  if (inv.status === "draft") return bad("Send the invoice before recording a payment.", 409);
  if (inv.status === "paid") return bad("This invoice is already paid.", 409);
  if (!METHODS.includes(body.method ?? "")) return bad("Pick how it was paid.");
  inv.status = "paid";
  inv.paidAt = new Date().toISOString();
  inv.payment = { method: body.method!, reference: (body.reference ?? "").trim().slice(0, 40) };
  await saveBooks(b);
  return Response.json({ message: "Payment recorded", invoice: view(b, inv) });
}
