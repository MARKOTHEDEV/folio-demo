import { cookies } from "next/headers";
import { PENDING_COOKIE, bad, pending, type Pending } from "@/lib/auth";
import { sendCode } from "@/lib/mail";
import { hashCode, newCode, seal } from "@/lib/token";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; name?: string; resend?: boolean };
  const previous = await pending();
  const email = (body.resend ? previous?.email : body.email)?.trim().toLowerCase() ?? "";
  if (!EMAIL.test(email)) return bad("Enter a valid email address.");
  if (previous && previous.email === email && Date.now() - previous.sentAt < 30_000) {
    return bad("We just sent a code. Give it a few seconds before asking again.", 429);
  }
  const fallback = email.split("@")[0].replace(/[._-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const name = (body.resend ? previous?.name : body.name?.trim()) || fallback;

  const code = newCode();
  try {
    await sendCode(email, name, code);
  } catch (e) {
    console.error("[folio] send code failed", e);
    return bad("We couldn't send your code. Try again in a moment.", 502);
  }
  const p: Pending = { email, name, hash: hashCode(email, code), exp: Date.now() + 10 * 60_000, sentAt: Date.now() };
  (await cookies()).set(PENDING_COOKIE, seal(p), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 600 });
  return Response.json({ ok: true, email });
}
