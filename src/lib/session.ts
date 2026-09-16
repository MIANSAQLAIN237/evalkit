import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "evalkit_session";
export const SESSION_DAYS = 7;

export type Session = {
  sub: string;
  email: string;
  name: string;
};

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must be at least 32 characters");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session): Promise<string> {
  return new SignJWT(session)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secretKey());
}

export async function verifySessionToken(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string"
    ) {
      return null;
    }
    return { sub: payload.sub, email: payload.email, name: payload.name };
  } catch {
    return null;
  }
}
