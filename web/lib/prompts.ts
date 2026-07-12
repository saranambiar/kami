export interface OnboardingContext {
  domain: string;
  goals: string[];
  stage: string | null;
}

export function onboardingPrompt({ domain, goals, stage }: OnboardingContext): string {
  const goalLine = goals.length ? `Their stated goals: ${goals.join(", ")}.` : "";
  const stageLine = stage ? `Startup stage: ${stage}.` : "";

  return `You are the MANAGER of Kami, an AI GTM agency. A new client just submitted their domain: ${domain}
${goalLine} ${stageLine} Weight your strategy, bucket choices, and opportunities toward these goals and stage.

Run onboarding intelligence (Loop 0). As you work, narrate every step on its own line using EXACTLY this format (these stream live to the client's activity feed):
»[research] message
»[brand] message
»[competitors] message
»[buckets] message
»[strategy] message
Use one line per meaningful step, present tense, specific (e.g. »[research] scanning ${domain} pricing and customer pages). Emit at least 8 narration lines spread across the phases.

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
  return `The client approved the opportunity "${opportunityTitle}" (playbook: ${playbook}). DRY RUN — no send tools are wired. Narrate steps as »[execute] lines, draft the deliverable following the playbook and the brand voice/tone from this session's dossier, self-check it, and present it for review with a note that sending is disabled until AgentMail/X keys are configured.`;
}
