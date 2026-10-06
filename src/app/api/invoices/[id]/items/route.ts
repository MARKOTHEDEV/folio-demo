import { newItemId, readBooks, saveBooks, view } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";

export async function POST(req: Request, ctx: RouteContext<"/api/invoices/[id]/items">) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { description?: string; qty?: number; unitPrice?: number };
  const b = await readBooks(user.email);
  const inv = b.invoices.find((i) => i.id === id);
  if (!inv) return bad("No invoice with that id.", 404);
  if (inv.status !== "draft") return bad("Only a draft can change.", 409);
  const description = body.description?.trim() ?? "";
  const qty = Number(body.qty);
  const unitPrice = Math.round(Number(body.unitPrice));
  if (!description) return bad("Describe the work.");
  if (!Number.isInteger(qty) || qty < 1 || qty > 999) return bad("Quantity must be a whole number from 1 to 999.");
  if (!Number.isFinite(unitPrice) || unitPrice < 1) return bad("Enter a price.");
  inv.items.push({ id: newItemId(), description, qty, unitPrice });
  await saveBooks(b);
  return Response.json({ message: "Item added", invoice: view(b, inv) }, { status: 201 });
}
