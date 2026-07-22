import { validateDomainIdentity } from "@/lib/domainIdentity";

export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
  const body = await request.json().catch(() => ({}));
  const domain = typeof body.domain === "string" ? body.domain : "";
  if (!domain.trim()) {
    return Response.json({ ok: false, reason: "Invalid domain" }, { status: 400 });
  }

  const result = await validateDomainIdentity(domain);
  if (!result.ok) {
    return Response.json(
      { ok: false, reason: result.reason, detail: result.detail ?? null },
      { status: 422 },
    );
  }

  return Response.json({ ok: true, identity: result.identity });
}
