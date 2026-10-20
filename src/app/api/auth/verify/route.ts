import { cookies } from "next/headers";
import { PENDING_COOKIE, bad, pending, saveAccount, sessionToken } from "@/lib/auth";
import { hashCode } from "@/lib/token";

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const p = await pending();
  if (!p || Date.now() > p.exp) return bad("Your code expired. Ask for a new one.");
  if (!code || !/^\d{6}$/.test(code) || hashCode(p.email, code) !== p.hash) return bad("That code didn't work. Check the email and try again.");
  (await cookies()).delete(PENDING_COOKIE);
  // A sign-up that chose a password: the account is real now that the email is verified.
  if (p.pwHash) await saveAccount({ email: p.email, name: p.name, pwHash: p.pwHash });
  return Response.json({ token: sessionToken({ email: p.email, name: p.name }), user: { email: p.email, name: p.name } });
}
