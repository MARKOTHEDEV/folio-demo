import { cookies } from "next/headers";
import { PENDING_COOKIE, bad, pending } from "@/lib/auth";
import { hashCode, seal } from "@/lib/token";

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const p = await pending();
  if (!p || Date.now() > p.exp) return bad("Your code expired. Ask for a new one.");
  if (!code || !/^\d{6}$/.test(code) || hashCode(p.email, code) !== p.hash) return bad("That code didn't work. Check the email and try again.");
  (await cookies()).delete(PENDING_COOKIE);
  // The token every other API call sends as "Authorization: Bearer …".
  const token = seal({ email: p.email, name: p.name, exp: Date.now() + 12 * 3600e3 });
  return Response.json({ token, user: { email: p.email, name: p.name } });
}
