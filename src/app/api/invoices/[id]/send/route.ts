import { readBooks, saveBooks, totalsOf, view } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";
import { mailsClients, sendInvoice } from "@/lib/mail";

export async function POST(req: Request, ctx: RouteContext<"/api/invoices/[id]/send">) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const b = await readBooks(user.email);
  const inv = b.invoices.find((i) => i.id === id);
  if (!inv) return bad("No invoice with that id.", 404);
  if (inv.status !== "draft") return bad("This invoice was already sent.", 409);
  if (!inv.items.length) return bad("Add at least one item before sending.");
  const client = b.clients.find((c) => c.id === inv.clientId)!;
  if (mailsClients(client.email)) {
    try {
      await sendInvoice(client.email, user.name, inv.number, totalsOf(inv), inv.dueDate);
    } catch (e) {
      console.error("[folio] invoice email failed", e);
      return bad("We couldn't email the invoice. Try again.", 502);
    }
  }
  inv.status = "sent";
  inv.sentAt = new Date().toISOString();
  await saveBooks(b);
  return Response.json({ message: `Invoice sent to ${client.email}`, invoice: view(b, inv) });
}
