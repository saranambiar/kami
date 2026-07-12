import { linkupConfigured, researchDomain } from "@/lib/linkup";

export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  const { domain } = await request.json();
  if (!domain) return Response.json({ error: "domain required" }, { status: 400 });
  if (!linkupConfigured()) return Response.json({ facts: "" });

  try {
    const facts = await researchDomain(domain);
    return Response.json({ facts });
  } catch {
    return Response.json({ facts: "" }); // research is best-effort, never blocks onboarding
  }
}
