import { createHmac, randomBytes, randomInt, timingSafeEqual } from "crypto";

const SECRET = process.env.FOLIO_SECRET || "folio-dev-secret-change-me";

function sign(data: string) {
  return createHmac("sha256", SECRET).update(data).digest("base64url");
}

/** A signed, readable blob: the server can trust what it wrote. */
export function seal(payload: object) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function unseal<T>(token: string | undefined | null): T | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    return JSON.parse(Buffer.from(body, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");
/** A password, keyed to its email, as a signed hash — never the password itself. */
export const hashPassword = (email: string, password: string) => sign(`pw:${email.toLowerCase()}:${password}`);
export const hashCode = (email: string, code: string) => sign(`${email.toLowerCase()}:${code}`);
export const newId = (prefix: string) => `${prefix}_${randomBytes(6).toString("hex")}`;
