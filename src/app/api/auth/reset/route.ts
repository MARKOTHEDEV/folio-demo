import { cookies } from "next/headers";
import { MIN_PASSWORD, RESET_COOKIE, bad, resetPending, saveAccount } from "@/lib/auth";
import { hashCode, hashPassword, unseal } from "@/lib/token";

type ResetToken = { kind: "reset"; email: string; name: string; nonce: string; exp: number };

/** The reset page: the emailed code (or a valid link) + a new password → the account's password changes. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string; code?: string; password?: string };
  const password = body.password ?? "";
  let who: { email: string; name: string } | null = null;
  if (body.token) {
    const t = unseal<ResetToken>(body.token);
    if (!t || t.kind !== "reset") return bad("That reset link isn't valid. Ask for a new one.");
    if (Date.now() > t.exp) return bad("That reset link has expired. Ask for a new one.");
    who = { email: t.email, name: t.name };
  } else {
    const p = await resetPending();
    if (!p || Date.now() > p.exp) return bad("Your reset code expired. Ask for a new one.");
    if (!body.code || !/^\d{6}$/.test(body.code) || hashCode(`reset:${p.email}`, body.code) !== p.hash) return bad("That code didn't work. Check the email and try again.");
    who = { email: p.email, name: p.name };
  }
  if (password.length < MIN_PASSWORD) return bad(`Use at least ${MIN_PASSWORD} characters for your password.`);
  await saveAccount({ email: who.email, name: who.name, pwHash: hashPassword(who.email, password) });
  if (!body.token) (await cookies()).delete(RESET_COOKIE);
  return Response.json({ ok: true, email: who.email });
}
