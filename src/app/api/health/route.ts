import { providerStatus } from "@/lib/providers";

export async function GET() {
  return Response.json({
    ok: true,
    providers: providerStatus(),
  });
}
