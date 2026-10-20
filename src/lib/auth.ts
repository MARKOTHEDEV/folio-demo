import { cookies } from "next/headers";
import { seal, unseal } from "./token";

export type User = { email: string; name: string };
export type Pending = { email: string; name: string; hash: string; exp: number; sentAt: number; pwHash?: string };
export const PENDING_COOKIE = "folio_pending";

/**
 * THE ACCOUNT: the password this person set, kept in one signed cookie like
 * the books — no database, every visitor (and every test run) has their own.
 */
export type Account = { email: string; name: string; pwHash: string };
export const ACCOUNT_COOKIE = "folio_account";
export const MIN_PASSWORD = 8;

/**
 * HOW A RESET REACHES YOU: a 6-digit code in the email (the default — the same
 * door as sign-in), or a link to /reset?token=… (FOLIO_RESET=link).
 */
export type ResetMode = "code" | "link";
export const resetMode = (): ResetMode => (process.env.FOLIO_RESET === "link" ? "link" : "code");

/** A reset by code, waiting for the code: kept in a signed cookie like a sign-in. */
export type ResetPending = { email: string; name: string; hash: string; exp: number; sentAt: number };
export const RESET_COOKIE = "folio_reset";
export async function resetPending() {
  const store = await cookies();
  return unseal<ResetPending>(store.get(RESET_COOKIE)?.value);
}

export async function account(): Promise<Account | null> {
  const store = await cookies();
  return unseal<Account>(store.get(ACCOUNT_COOKIE)?.value);
}

export async function saveAccount(a: Account) {
  (await cookies()).set(ACCOUNT_COOKIE, seal(a), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
}

/** The token every other API call sends as "Authorization: Bearer …". */
export const sessionToken = (u: User) => seal({ email: u.email, name: u.name, exp: Date.now() + 12 * 3600e3 });

/** The signed-in person, from "Authorization: Bearer <token>" (the token /api/auth/verify gave). */
export function userFrom(req: Request): User | null {
  const m = /^Bearer\s+(.+)$/i.exec(req.headers.get("authorization") ?? "");
  const t = unseal<User & { exp: number }>(m?.[1]);
  if (!t || Date.now() > t.exp) return null;
  return { email: t.email, name: t.name };
}

export const unauthorized = () => Response.json({ error: "Please sign in." }, { status: 401 });
export const bad = (error: string, status = 400) => Response.json({ error }, { status });

export async function pending() {
  const store = await cookies();
  return unseal<Pending>(store.get(PENDING_COOKIE)?.value);
}
