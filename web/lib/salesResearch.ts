import { linkupConfigured, searchLinkup } from "./linkup";
import type { SalesIcp } from "./salesTypes";

export interface ProvenanceRecord {
  provider: "linkup";
  url: string;
  captured_at: string;
  confidence: number;
  evidence_text: string;
  signal_type: string;
}

export interface ResearchedSignal extends ProvenanceRecord {
  detail: string;
  observed_at?: string;
}

export interface LeadScoreResult {
  fit: number;
  intent: number;
  contactability: number;
  priority: number;
  explanation: string;
}

export interface ResearchedAccount {
  name: string;
  domain: string;
  industry?: string;
  geo?: string;
  tier: 1 | 2 | 3;
  score: LeadScoreResult;
  signals: ResearchedSignal[];
  notes?: string;
}

export interface ResearchSalesTargetsParams {
  domain: string;
  icp: SalesIcp;
  exclusions?: string[];
  targetQuantity?: number;
}

export interface ResearchSalesTargetsResult {
  accounts: ResearchedAccount[];
}

const SIGNAL_PATTERNS: { type: string; patterns: RegExp[]; detail: (m: RegExpMatchArray) => string }[] = [
  {
    type: "funding",
    patterns: [
      /\b(raised|raises|secures?|closed|announces?)\s+\$[\d.]+[mbk]?\b/i,
      /\bseries\s+[a-d]\b/i,
      /\bseed\s+round\b/i,
      /\bventure\s+capital\b/i,
    ],
    detail: () => "Funding or investment activity detected",
  },
  {
    type: "hiring",
    patterns: [
      /\b(hiring|recruiting|job openings?|open roles?|we're growing)\b/i,
      /\b(headcount|team expansion|new hires)\b/i,
    ],
    detail: () => "Hiring or team expansion signal",
  },
  {
    type: "exec_hire",
    patterns: [
      /\b(appoints?|names?|joins as)\s+(ceo|cto|cfo|cmo|vp|chief|president|director)\b/i,
      /\bnew\s+(ceo|cto|cfo|cmo|chief)\b/i,
    ],
    detail: () => "Executive hire or leadership change",
  },
  {
    type: "product_launch",
    patterns: [
      /\b(launches?|launched|introduces?|introducing|unveils?|debuts?)\b/i,
      /\bnew product\b/i,
      /\bgeneral availability\b/i,
    ],
    detail: () => "Product launch or release",
  },
  {
    type: "community_activity",
    patterns: [
      /\b(tweeted|posted on x|linkedin post|blog post|announced on)\b/i,
    ],
    detail: () => "Public community or content activity",
  },
];

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";
const DATE_PATTERN = new RegExp(
  `\\b(20\\d{2}|${MONTH_NAMES}[a-z]*\\s+\\d{1,2},?\\s+20\\d{2}|\\d{1,2}\\s+${MONTH_NAMES}[a-z]*\\s+20\\d{2})\\b`,
  "i",
);

function normalizeDomain(raw: string): string | null {
  try {
    const withProto = raw.includes("://") ? raw : `https://${raw}`;
    const host = new URL(withProto).hostname.toLowerCase().replace(/^www\./, "");
    if (!host.includes(".") || domainBlocklist(host)) return null;
    return host;
  } catch {
    const cleaned = raw.trim().toLowerCase().replace(/^www\./, "");
    if (cleaned.includes(".") && !cleaned.includes(" ")) return cleaned;
    return null;
  }
}

function domainBlocklist(host: string): boolean {
  const blocked = [
    "linkedin.com",
    "twitter.com",
    "x.com",
    "facebook.com",
    "instagram.com",
    "youtube.com",
    "crunchbase.com",
    "techcrunch.com",
    "bloomberg.com",
    "reuters.com",
    "wikipedia.org",
    "google.com",
    "github.com",
  ];
  return blocked.some((b) => host === b || host.endsWith(`.${b}`));
}

function extractDomainFromUrl(url: string): string | null {
  return normalizeDomain(url);
}

function extractAccountName(resultName: string, domain: string): string {
  const cleaned = resultName
    .replace(/\s*[-|–—]\s*.+$/, "")
    .replace(/\s*\|.+\s*$/, "")
    .trim();
  if (cleaned.length >= 2 && cleaned.length <= 80) return cleaned;
  const base = domain.split(".")[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

function matchesExclusion(name: string, domain: string, exclusions: string[]): boolean {
  const hay = `${name} ${domain}`.toLowerCase();
  return exclusions.some((ex) => {
    const needle = ex.trim().toLowerCase();
    if (!needle) return false;
    return hay.includes(needle) || domain === normalizeDomain(needle);
  });
}

function detectSignals(content: string, url: string, capturedAt: string): ResearchedSignal[] {
  const signals: ResearchedSignal[] = [];
  const excerpt = content.slice(0, 600);

  for (const spec of SIGNAL_PATTERNS) {
    for (const pattern of spec.patterns) {
      const match = content.match(pattern);
      if (!match) continue;

      const dateMatch = content.match(DATE_PATTERN);
      let observedAt: string | undefined;
      let confidence = 0.65;

      if (dateMatch) {
        const parsed = Date.parse(dateMatch[0]);
        if (!Number.isNaN(parsed)) {
          observedAt = new Date(parsed).toISOString();
          const ageDays = (Date.now() - parsed) / (1000 * 60 * 60 * 24);
          if (ageDays <= 60) confidence = 0.85;
          else if (ageDays <= 90) confidence = 0.55;
          else confidence = 0.35;
        }
      }

      signals.push({
        provider: "linkup",
        url,
        captured_at: capturedAt,
        confidence,
        evidence_text: excerpt,
        signal_type: spec.type,
        detail: spec.detail(match),
        observed_at: observedAt,
      });
      break;
    }
  }

  return signals;
}

function icpKeywords(icp: SalesIcp): string[] {
  return [
    ...(icp.industries ?? []),
    ...(icp.titles ?? []),
    icp.size ?? "",
    icp.geo ?? "",
  ]
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function scoreFit(text: string, icp: SalesIcp): number {
  const keywords = icpKeywords(icp);
  if (!keywords.length) return 0.5;
  const lower = text.toLowerCase();
  let hits = 0;
  for (const kw of keywords) {
    if (lower.includes(kw)) hits++;
  }
  return Math.min(1, hits / Math.max(2, keywords.length * 0.5));
}

function scoreIntent(signals: ResearchedSignal[]): number {
  if (!signals.length) return 0.15;
  const best = Math.max(...signals.map((s) => s.confidence));
  const fresh = signals.some((s) => {
    if (!s.observed_at) return false;
    const age = (Date.now() - Date.parse(s.observed_at)) / (1000 * 60 * 60 * 24);
    return age <= 60;
  });
  return Math.min(1, best * (fresh ? 1 : 0.7));
}

function scoreContactability(content: string): number {
  const emailMatch = content.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
  if (emailMatch) return 0.7;
  return 0.25;
}

function assignTier(fit: number, intent: number, hasFreshSignal: boolean): 1 | 2 | 3 {
  if (fit >= 0.6 && intent >= 0.7 && hasFreshSignal) return 1;
  if (fit >= 0.45 && intent >= 0.4) return 2;
  if (fit >= 0.3) return 3;
  return 3;
}

function buildQueries(domain: string, icp: SalesIcp, targetQty: number): string[] {
  const industries = icp.industries?.slice(0, 2).join(" ") || "B2B SaaS";
  const titles = icp.titles?.slice(0, 2).join(" ") || "decision makers";
  const geo = icp.geo || "United States";
  const qty = Math.min(Math.max(targetQty, 5), 30);

  return [
    `${industries} companies ${geo} similar to ${domain} hiring funding 2026`,
    `${titles} ${industries} startups ${geo} series funding launch 2026`,
    `companies like ${domain} ${industries} ${geo} recent news hiring`,
    `${industries} ${geo} B2B companies product launch executive hire 2026`,
  ].slice(0, Math.ceil(qty / 8) + 2);
}

function inferIndustry(content: string, icp: SalesIcp): string | undefined {
  for (const ind of icp.industries ?? []) {
    if (content.toLowerCase().includes(ind.toLowerCase())) return ind;
  }
  return icp.industries?.[0];
}

function inferGeo(content: string, icp: SalesIcp): string | undefined {
  const geo = icp.geo?.trim();
  if (geo && content.toLowerCase().includes(geo.toLowerCase())) return geo;
  return geo;
}

export async function researchSalesTargets(
  params: ResearchSalesTargetsParams,
): Promise<ResearchSalesTargetsResult> {
  if (!linkupConfigured()) {
    throw new Error("LINKUP_NOT_CONFIGURED");
  }

  const { domain, icp, exclusions = [], targetQuantity = 50 } = params;
  const capturedAt = new Date().toISOString();
  const queries = buildQueries(domain, icp, targetQuantity);

  const resultSets = await Promise.all(queries.map((q) => searchLinkup(q)));
  const flat = resultSets.flat();

  type AccountBucket = {
    name: string;
    domain: string;
    contentParts: string[];
    signals: ResearchedSignal[];
    urls: Set<string>;
  };

  const buckets = new Map<string, AccountBucket>();
  const offerDomain = normalizeDomain(domain);

  for (const result of flat) {
    if (!result.url || !result.content) continue;

    let accountDomain = extractDomainFromUrl(result.url);
    if (!accountDomain) continue;
    if (offerDomain && accountDomain === offerDomain) continue;

    const accountName = extractAccountName(result.name || "", accountDomain);
    if (matchesExclusion(accountName, accountDomain, exclusions)) continue;

    const signals = detectSignals(result.content, result.url, capturedAt);
    const key = accountDomain;

    const existing = buckets.get(key);
    if (existing) {
      existing.contentParts.push(result.content);
      existing.urls.add(result.url);
      for (const sig of signals) {
        if (!existing.signals.some((s) => s.url === sig.url && s.signal_type === sig.signal_type)) {
          existing.signals.push(sig);
        }
      }
    } else {
      buckets.set(key, {
        name: accountName,
        domain: accountDomain,
        contentParts: [result.content],
        signals,
        urls: new Set([result.url]),
      });
    }
  }

  const accounts: ResearchedAccount[] = [];

  for (const bucket of buckets.values()) {
    const combined = bucket.contentParts.join("\n");
    const fit = scoreFit(combined, icp);
    const intent = scoreIntent(bucket.signals);
    const contactability = scoreContactability(combined);
    const hasFreshSignal = bucket.signals.some((s) => {
      if (!s.observed_at) return s.confidence >= 0.7;
      const age = (Date.now() - Date.parse(s.observed_at)) / (1000 * 60 * 60 * 24);
      return age <= 60;
    });

    let tier = assignTier(fit, intent, hasFreshSignal);
    const priority = Math.min(1, fit * 0.35 + intent * 0.4 + contactability * 0.25);

    const explanation = [
      `Fit ${(fit * 100).toFixed(0)}% from ICP keyword overlap`,
      bucket.signals.length
        ? `Intent ${(intent * 100).toFixed(0)}% from ${bucket.signals.length} signal(s)`
        : "No verifiable timing signal — firmographic fit only",
      `Contactability ${(contactability * 100).toFixed(0)}% — ${contactability >= 0.6 ? "email visible in source" : "no verified contact in source"}`,
    ].join("; ");

    accounts.push({
      name: bucket.name,
      domain: bucket.domain,
      industry: inferIndustry(combined, icp),
      geo: inferGeo(combined, icp),
      tier,
      score: { fit, intent, contactability, priority, explanation },
      signals: bucket.signals,
      notes: bucket.signals.length ? undefined : "no_signal",
    });
  }

  accounts.sort((a, b) => b.score.priority - a.score.priority);

  const maxTier1 = Math.max(1, Math.floor(targetQuantity * 0.3));
  let tier1Count = 0;
  for (const acc of accounts) {
    if (acc.tier === 1) {
      tier1Count++;
      if (tier1Count > maxTier1) acc.tier = 2;
    }
  }

  return { accounts: accounts.slice(0, targetQuantity) };
}
