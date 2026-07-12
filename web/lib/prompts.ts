export function onboardingPrompt(domain: string): string {
  return `You are the MANAGER of Kami, an AI GTM agency. A new client just submitted their domain: ${domain}

Run onboarding intelligence (Loop 0). As you work, narrate each step briefly on its own line prefixed with "» " (this streams live to the client as an agent trace). Steps: recon the company, derive brand voice and positioning, analyze 2-3 competitors, build hyper-specific ICP buckets (Origami-style: where they live + dated trigger signal + estimated size + outreach angle), and propose concrete opportunities.

When finished, output the complete dossier as the FINAL thing in your reply, inside a single fenced \`\`\`json block, exactly matching this shape:

{
  "company": "name",
  "brand_voice": "2-3 sentence description of tone and style",
  "positioning": "what they sell + differentiators, 2-3 sentences",
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
  return `The client approved the opportunity "${opportunityTitle}" (playbook: ${playbook}). DRY RUN — no send tools are wired. Draft the deliverable following the playbook, self-check it, and present it for review with a note that sending is disabled until AgentMail/X keys are configured.`;
}
