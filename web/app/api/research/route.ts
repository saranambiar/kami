import type { DomainIdentity } from "@/lib/domainIdentity";
import { researchDomainIdentity } from "@/lib/linkup";

export const maxDuration = 90;

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}));
  const identity = body.identity as DomainIdentity | undefined;
  if (!identity?.canonical_domain || !identity?.evidence_url) {
    return Response.json(
      { ok: false, reason: "Validated domain identity required" },
      { status: 400 },
    );
  }

  try {
    const result = await researchDomainIdentity(identity);
    if (!result.ok) {
      return Response.json({ ok: false, reason: result.reason }, { status: 422 });
    }
    return Response.json({ ok: true, snapshot: result.snapshot });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "research failed";
    return Response.json({ ok: false, reason: msg }, { status: 500 });
  }
}
