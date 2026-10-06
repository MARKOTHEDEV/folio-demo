import { COUNTRIES, newClient, readBooks, saveBooks } from "@/lib/books";
import { bad, unauthorized, userFrom } from "@/lib/auth";

export async function GET(req: Request) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const b = await readBooks(user.email);
  return Response.json({ data: b.clients });
}

export async function POST(req: Request) {
  const user = userFrom(req);
  if (!user) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { name?: string; email?: string; country?: string };
  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  if (name.length < 2) return bad("Give the client a name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return bad("Enter the client's email address.");
  if (!COUNTRIES.includes(body.country ?? "")) return bad("Pick the client's country.");
  const b = await readBooks(user.email);
  const client = newClient(b, name, email, body.country!);
  await saveBooks(b);
  return Response.json({ message: "Client added", client }, { status: 201 });
}
