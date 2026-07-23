import { detectCapabilities } from "@/lib/capabilities";
import { hermesGatewayConfigured } from "@/lib/hermesServer";

export async function GET(): Promise<Response> {
  const caps = detectCapabilities();
  // Live gateway probe is optional; env presence is enough for UI gates.
  const hermesReachable = hermesGatewayConfigured();
  return Response.json({
    ...caps,
    hermes: hermesReachable,
    modelConfigured: hermesReachable && caps.modelConfigured,
  });
}
