import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_DAYS,
  signSession,
  verifySessionToken,
  type Session,
} from "@/lib/session";

export type { Session };
export { SESSION_COOKIE, signSession, verifySessionToken };

export async function setSessionCookie(session: Session) {
  const token = await signSession(session);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireUserOrRedirect(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
