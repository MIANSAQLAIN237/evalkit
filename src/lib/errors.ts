export class HttpError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.code = code;
  }
}

export function jsonError(status: number, code: string, message: string) {
  return Response.json({ error: { code, message } }, { status });
}

export function toErrorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return jsonError(err.status, err.code, err.message);
  }

  if (isZodError(err)) {
    const first = err.issues[0];
    return jsonError(400, "VALIDATION", first?.message ?? "Invalid input");
  }

  console.error(err);
  return jsonError(500, "INTERNAL", "Something went wrong");
}

function isZodError(err: unknown): err is { issues: Array<{ message?: string }> } {
  return Boolean(
    err &&
      typeof err === "object" &&
      "issues" in err &&
      Array.isArray((err as { issues: unknown }).issues),
  );
}
