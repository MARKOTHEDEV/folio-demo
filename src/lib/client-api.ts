"use client";

const KEY = "folio_token";

export const getToken = () => (typeof window === "undefined" ? null : sessionStorage.getItem(KEY));
export const setToken = (t: string | null) => (t ? sessionStorage.setItem(KEY, t) : sessionStorage.removeItem(KEY));

/** Every app call sends the sign-in token; a 401 sends you back to sign in. */
export async function api<T = Record<string, unknown>>(path: string, init: { method?: string; body?: unknown } = {}): Promise<{ ok: boolean; status: number; data: T & { error?: string } }> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(path, { method: init.method ?? "GET", headers, body: init.body === undefined ? undefined : JSON.stringify(init.body) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== "undefined") {
    setToken(null);
    window.location.href = "/signin";
  }
  return { ok: res.ok, status: res.status, data };
}
