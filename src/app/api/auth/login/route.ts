import { account, bad, sessionToken } from "@/lib/auth";
import { hashPassword } from "@/lib/token";

/** Sign in with email + password (the one set at sign-up or by a reset). */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  if (!email || !password) return bad("Enter your email and password.");
  const a = await account();
  if (!a || a.email !== email) return bad("No password is set for this email yet. Use “Forgot password?” to set one, or sign in with a code.", 401);
  if (a.pwHash !== hashPassword(email, password)) return bad("Wrong email or password.", 401);
  return Response.json({ token: sessionToken({ email: a.email, name: a.name }), user: { email: a.email, name: a.name } });
}
