import { cookies } from "next/headers";
import { account, bad } from "@/lib/auth";
import { sendReset } from "@/lib/mail";
import { newId, seal } from "@/lib/token";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENT_COOKIE = "folio_reset_sent";

/** "Forgot password?": emails a reset link that works for 30 minutes. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) return bad("Enter a valid email address.");
  const store = await cookies();
  const last = Number(store.get(SENT_COOKIE)?.value ?? 0);
  if (Date.now() - last < 30_000) return bad("We just sent a reset link. Give it a few seconds before asking again.", 429);
  const a = await account();
  const name = a?.email === email ? a.name : email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const token = seal({ kind: "reset", email, name, nonce: newId("rs"), exp: Date.now() + 30 * 60_000 });
  const link = `${new URL(req.url).origin}/reset?token=${encodeURIComponent(token)}`;
  try {
    await sendReset(email, name, link);
  } catch (e) {
    console.error("[folio] send reset failed", e);
    return bad("We couldn't send the email. Try again in a moment.", 502);
  }
  store.set(SENT_COOKIE, String(Date.now()), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 });
  return Response.json({ ok: true, email });
}
