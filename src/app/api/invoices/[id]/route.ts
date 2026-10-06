import { TAX_RATES, readBooks, saveBooks, view } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";

export async function GET(req: Request, ctx: RouteContext<"/api/invoices/[id]">) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const b = await readBooks(user.email);
  const inv = b.invoices.find((i) => i.id === id);
  if (!inv) return bad("No invoice with that id.", 404);
  return Response.json({ invoice: view(b, inv) });
}

/** Change the tax rate or due date (the page saves as soon as you pick). */
export async function PATCH(req: Request, ctx: RouteContext<"/api/invoices/[id]">) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { taxRate?: number };
  const b = await readBooks(user.email);
  const inv = b.invoices.find((i) => i.id === id);
  if (!inv) return bad("No invoice with that id.", 404);
  if (inv.status !== "draft") return bad("Only a draft can change.", 409);
  if (body.taxRate !== undefined) {
    if (!TAX_RATES.includes(Number(body.taxRate))) return bad("Pick one of the tax rates.");
    inv.taxRate = Number(body.taxRate);
  }
  await saveBooks(b);
  return Response.json({ message: "Saved", invoice: view(b, inv) });
}
