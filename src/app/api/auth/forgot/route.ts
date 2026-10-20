import { cookies } from "next/headers";
import { RESET_COOKIE, account, bad, resetMode, resetPending, type ResetPending } from "@/lib/auth";
import { sendReset, sendResetCode } from "@/lib/mail";
import { hashCode, newCode, newId, seal } from "@/lib/token";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENT_COOKIE = "folio_reset_sent";
const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/" };

/** "Forgot password?": emails a 6-digit code (default) or a reset link (FOLIO_RESET=link). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; resend?: boolean };
  const store = await cookies();
  const previous = body.resend ? await resetPending() : null;
  const email = (body.resend ? previous?.email : body.email)?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) return bad("Enter a valid email address.");
  const last = Number(store.get(SENT_COOKIE)?.value ?? 0);
  if (Date.now() - last < 30_000) return bad("We just sent one. Give it a few seconds before asking again.", 429);
  const a = await account();
  const name = a?.email === email ? a.name : email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const mode = resetMode();
  try {
    if (mode === "code") {
      const code = newCode();
      await sendResetCode(email, name, code);
      const p: ResetPending = { email, name, hash: hashCode(`reset:${email}`, code), exp: Date.now() + 10 * 60_000, sentAt: Date.now() };
      store.set(RESET_COOKIE, seal(p), { ...cookieOpts, maxAge: 600 });
    } else {
      const token = seal({ kind: "reset", email, name, nonce: newId("rs"), exp: Date.now() + 30 * 60_000 });
      await sendReset(email, name, `${new URL(req.url).origin}/reset?token=${encodeURIComponent(token)}`);
    }
  } catch (e) {
    console.error("[folio] send reset failed", e);
    return bad("We couldn't send the email. Try again in a moment.", 502);
  }
  store.set(SENT_COOKIE, String(Date.now()), { ...cookieOpts, maxAge: 60 });
  return Response.json({ ok: true, email, mode });
}
