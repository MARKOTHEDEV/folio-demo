import { cookies } from "next/headers";
import { unseal } from "./token";

export type User = { email: string; name: string };
export type Pending = { email: string; name: string; hash: string; exp: number; sentAt: number };
export const PENDING_COOKIE = "folio_pending";

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
