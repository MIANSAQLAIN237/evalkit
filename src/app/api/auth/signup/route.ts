import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { HttpError, toErrorResponse } from "@/lib/errors";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { signupSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    if (!rateLimit(`signup:${clientIp(request)}`, 8, 60 * 60 * 1000)) {
      throw new HttpError(429, "RATE_LIMIT", "Too many signups. Try again later.");
    }

    const body: unknown = await request.json();
    const input = signupSchema.parse(body);
    const passwordHash = await hash(input.password, 12);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        passwordHash,
      },
    });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    return Response.json({ user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return toErrorResponse(
        new HttpError(409, "EMAIL_TAKEN", "An account with that email already exists"),
      );
    }
    return toErrorResponse(err);
  }
}
