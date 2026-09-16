import { compare } from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`login:${clientIp(request)}`, 20, 15 * 60 * 1000)) {
      throw new HttpError(429, "RATE_LIMIT", "Too many login attempts. Try again later.");
    }

    const body: unknown = await request.json();
    const input = loginSchema.parse(body);
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user || !(await compare(input.password, user.passwordHash))) {
      throw new HttpError(401, "INVALID_CREDENTIALS", "Invalid email or password");
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
