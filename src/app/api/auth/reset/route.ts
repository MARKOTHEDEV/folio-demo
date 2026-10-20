import { MIN_PASSWORD, bad, saveAccount } from "@/lib/auth";
import { hashPassword, unseal } from "@/lib/token";

type ResetToken = { kind: "reset"; email: string; name: string; nonce: string; exp: number };

/** The reset page: a valid link + a new password → the account's password changes. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { token?: string; password?: string };
  const t = unseal<ResetToken>(body.token);
  if (!t || t.kind !== "reset") return bad("That reset link isn't valid. Ask for a new one.");
  if (Date.now() > t.exp) return bad("That reset link has expired. Ask for a new one.");
  const password = body.password ?? "";
  if (password.length < MIN_PASSWORD) return bad(`Use at least ${MIN_PASSWORD} characters for your password.`);
  await saveAccount({ email: t.email, name: t.name, pwHash: hashPassword(t.email, password) });
  return Response.json({ ok: true, email: t.email });
}
