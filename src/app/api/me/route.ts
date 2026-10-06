import { readBooks } from "@/lib/books";
import { pending, unauthorized, userFrom } from "@/lib/auth";

export async function GET(req: Request) {
  const user = userFrom(req);
  if (!user) {
    const p = await pending();
    return req.headers.get("authorization") ? unauthorized() : Response.json({ user: null, pendingEmail: p?.email ?? null });
  }
  const b = await readBooks(user.email);
  return Response.json({ user, clients: b.clients.length, invoices: b.invoices.length });
}
