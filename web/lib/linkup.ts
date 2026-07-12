// Linkup web research — grounds the dossier in real scraped data.

const KEY = process.env.LINKUP_API_KEY;

export function linkupConfigured(): boolean {
  return Boolean(KEY);
}

interface LinkupResult {
  name: string;
  url: string;
  content: string;
}

export async function searchLinkup(q: string): Promise<LinkupResult[]> {
  if (!KEY) return [];
  const res = await fetch("https://api.linkup.so/v1/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ q, depth: "standard", outputType: "searchResults" }),
  });
  if (!res.ok) return [];
  const json = await res.json().catch(() => ({ results: [] }));
  return (json.results ?? []).slice(0, 5);
}

/** Run the onboarding research queries in parallel and return a compact facts block. */
export async function researchDomain(domain: string): Promise<string> {
  if (!KEY) return "";
  const [company, competitors, signals] = await Promise.all([
    searchLinkup(`${domain} company product pricing what they do`),
    searchLinkup(`${domain} competitors alternatives comparison`),
    searchLinkup(`${domain} news funding launch hiring 2026`),
  ]);

  function block(title: string, results: LinkupResult[]): string {
    if (!results.length) return "";
    const lines = results
      .map((r) => `- ${r.name} (${r.url}): ${r.content.slice(0, 400)}`)
      .join("\n");
    return `### ${title}\n${lines}`;
  }

  return [
    block("Company (live web)", company),
    block("Competitors (live web)", competitors),
    block("Recent signals (live web)", signals),
  ]
    .filter(Boolean)
    .join("\n\n");
}
