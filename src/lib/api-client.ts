export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...init, headers });
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("text/event-stream")) {
    if (!response.ok) {
      throw new ApiError(response.status, "STREAM", "Eval stream failed");
    }
    return response as T;
  }

  const data = (await response.json().catch(() => ({}))) as {
    error?: { code?: string; message?: string };
  };

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data.error?.code ?? "ERROR",
      data.error?.message ?? "Request failed",
    );
  }

  return data as T;
}

export async function readSse(
  response: Response,
  onEvent: (event: Record<string, unknown>) => void,
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const line = chunk
        .split("\n")
        .map((part) => part.trim())
        .find((part) => part.startsWith("data:"));
      if (!line) continue;
      const payload = line.slice(5).trim();
      if (!payload) continue;
      onEvent(JSON.parse(payload) as Record<string, unknown>);
    }
  }
}
