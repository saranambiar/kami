export interface OnboardingContext {
  domain: string;
  goals: string[];
  stage: string | null;
  researchFacts?: string;
}

export function onboardingPrompt({ domain, goals, stage, researchFacts }: OnboardingContext): string {
  const goalLine = goals.length ? `Their stated goals: ${goals.join(", ")}.` : "";
  const stageLine = stage ? `Startup stage: ${stage}.` : "";
  const factsBlock = researchFacts
    ? `\n\nVERIFIED WEB RESEARCH (live Linkup scrape — ground every claim in this, prefer it over memory):\n${researchFacts}\n`
    : "";

  return `You are the MANAGER of Kami, an AI GTM agency. A new client just submitted their domain: ${domain}
${goalLine} ${stageLine} Weight your strategy, bucket choices, and opportunities toward these goals and stage.${factsBlock}

Run onboarding intelligence (Loop 0).

Tools (mandatory):
- Prefer web_search_plus and web_extract_plus (Linkup). Call web_search_plus with provider="linkup" when available.
- Prefer web_extract_plus(provider="linkup") to fetch ${domain} and key competitor pages — do NOT use browser_navigate / browser tools (they hang on this host).
- If only legacy web_search exists, use it; never block waiting on a browser.

As you work, narrate every step on its own line using EXACTLY this format (these stream live to the client's activity feed):
»[research] message
»[brand] message
»[competitors] message
»[buckets] message
»[strategy] message
»[handoff] MANAGER → SPECIALIST: what is being delegated and why
»[result] SPECIALIST → MANAGER: what came back
Use one line per meaningful step, present tense, specific (e.g. »[research] scanning ${domain} pricing and customer pages). You operate as a manager delegating to Research and Strategist specialists — make every delegation and return explicit with »[handoff] and »[result] lines (e.g. »[handoff] MANAGER → RESEARCH: recon ${domain} site + competitors). Emit at least 10 narration lines spread across the phases.

When finished, output the complete dossier as the FINAL thing in your reply, inside a single fenced \`\`\`json block, exactly matching this shape:

{
  "company": "name",
  "brand_voice": "2-3 sentence description of tone and style",
  "positioning": "what they sell + differentiators, 2-3 sentences",
  "tone": ["3-6 single-word tone descriptors"],
  "competitor_analysis": [{ "name": "...", "insight": "what works for them + how to counter" }],
  "icp_buckets": [{ "label": "...", "where_they_live": "platform + community", "trigger_signal": "dated, specific", "est_size": "~N", "angle": "tailored outreach angle" }],
  "opportunities": [{ "title": "...", "playbook": "signal_cold_email | vc_6line | influencer | content_post", "detail": "one concrete approvable action" }]
}

Give 3-5 icp_buckets and 3-5 opportunities. Be specific, not generic. No text after the json block.`;
}

export function cmoPrompt(question: string): string {
  return `The client asks (as their CMO, answer using the dossier context from this session, be direct and specific): ${question}`;
}

export function executePrompt(opportunityTitle: string, playbook: string): string {
  return `The client approved the opportunity "${opportunityTitle}" (playbook: ${playbook}). Work as the manager: narrate »[handoff] MANAGER → OUTREACH with the work order, »[execute] lines while the specialist drafts per the playbook and this session's brand voice/tone, »[handoff] MANAGER → REVIEWER for a strict review, »[result] lines for what returns.

After the reviewer approves, output the final deliverable as the LAST thing in your reply inside a single fenced \`\`\`json block:
{
  "surface": "x" | "email",
  "text": "the post text (X: <= 270 chars, plain text, NO links) or the full email body",
  "to": "recipient email (email surface only, omit for x)",
  "subject": "email subject (email surface only, omit for x)"
}
surface should be "x" for content/awareness plays and "email" for cold outreach plays. No text after the json block. The client will confirm before it is actually sent.`;
}
