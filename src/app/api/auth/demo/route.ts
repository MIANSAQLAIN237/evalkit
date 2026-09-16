import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DEMO_EMAIL } from "@/lib/demo-dataset";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    if (process.env.DEMO_LOGIN !== "true") {
      throw new HttpError(403, "DISABLED", "Demo login is disabled");
    }
    if (!rateLimit(`demo:${clientIp(request)}`, 30, 15 * 60 * 1000)) {
      throw new HttpError(429, "RATE_LIMIT", "Too many demo logins");
    }

    const user = await prisma.user.findUnique({ where: { email: DEMO_EMAIL } });
    if (!user) {
      throw new HttpError(500, "DEMO_MISSING", "Demo user is not seeded. Run prisma db seed.");
    }

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    return toErrorResponse(err);
  }
}
