# AGENTS.md — GTM-as-a-Service Agent Org (Hermes Buildathon)

This is the guiding document for the coding agent building this project. Read fully before starting. Referenced folders (`tasks/`, `lessons/`, `memory/`) are operating infrastructure for you, the coding agent — set them up first if they don't exist.

---

## 1. What we're building

An open-source, multi-agent marketing/GTM agency — powered by real running **Hermes agents** (Nous Research's agent framework), not a custom app that merely calls an LLM API. Hermes itself is the backend. We are not simulating agents; Hermes processes are the manager and the specialists.

**Team:** 2 people, 8-hour build sprint, at the Hermes Buildathon, "AI as Agency" track.

**Core mechanic:** A user submits a campaign brief (company, ICP, goal, tone) through a web app on our own domain. That request hits a persistent Hermes manager session running on our server. The manager plans, delegates to specialist Hermes subagents, reviews their output, and the specialists execute real actions on real surfaces (send a real email, publish a real post) — not staged or sandboxed.

**Capabilities (specialists), in priority order — do not build all of these to equal depth:**
1. **Outreach engine (one build, three playbooks)** — outbound/SDR, investor/VC, influencer outreach. Same pipeline: research target → apply the relevant playbook → send real email → log. Build this once, well, and parametrize the playbook.
2. **Content specialist** — research an angle/trend → draft → publish to a real platform (X, plain text posts).
3. **Manager agent** — parses the brief, produces a genuinely different plan per genuinely different brief, delegates, reviews specialist output, bounces at least one thing back for revision before it ships.

**Explicitly descoped for the 8-hour build (do not attempt unless everything above is done early and solid):** Community engagement (Reddit/Discord), LinkedIn company-page posting (requires multi-week API approval — do not attempt). If time allows, the flex move is the manager **spawning a new specialist role live** (e.g. a "PR angle" specialist) rather than half-building a fifth pre-built specialist.

**Scope discipline:** We will not spend the full 8 hours purely coding. Time is also needed for shooting demo/content footage and rehearsing the live demo. Budget accordingly — treat roughly the back 90 minutes as reserved for demo prep, not new features, regardless of how development is going.

---

## 2. Architecture — how this actually gets deployed and accessed

**Non-negotiable requirement:** Judges access this via a real link to our own domain, from their own device, with no install. Do not build a Telegram-bot-only flow as the primary surface (a bot can be an *additional* nice-to-have, not the main path).

**How it works:**
```
judge's browser → yourdomain.com (TLS) → reverse proxy → Hermes API Server (running on our VPS)
                                                              → manager session (role=orchestrator)
                                                              → delegate_task → specialist subagents
                                                              → real email send / real post / real research
```

- **Host:** a small always-on VPS (not a laptop — must survive the whole judging window). Set this up first, before feature work.
- **Backend:** Hermes running with the `api_server` platform enabled in `config.yaml`, exposing an OpenAI-compatible `/v1/chat/completions` endpoint natively off the running gateway process. This is Hermes's built-in API Server adapter — do not build a custom bridge.
- **Domain:** our own purchased domain, A record pointed at the VPS, TLS via reverse proxy (Caddy is simplest — automatic HTTPS in ~5 lines of config).
- **Frontend:** a thin web app (chat UI or campaign-brief form — form is more demo-friendly if time allows) that POSTs to the Hermes API Server endpoint with a bearer token, and streams the manager's response. Each browser session gets its own `X-Hermes-Session-Id` so concurrent judges don't collide — Hermes supports multiple concurrent sessions natively.
- **The manager = a Hermes session running with `role="orchestrator"`.** It is a real Hermes agent instance, not a wrapper.
- **Specialists = subagents spawned via `delegate_task`**, isolated context/terminal/toolset per specialist, running inside the same Hermes process. Use the `async_delegation` toolset (non-blocking) so the manager can dispatch outreach + content in parallel without freezing the session — verify this is stable on install before relying on it for the demo.
- **Playbooks = Hermes skills.** Each GTM playbook (see Section 4) is a `SKILL.md` file under `~/.hermes/skills/`. Skills are shared automatically with spawned subagents — write playbooks as skills, not hardcoded prompts, so they're inspectable, versioned, and improvable.
- **Shared state / "don't re-contact this person" memory:** subagents are stateless and isolated by default — Hermes does not give you cross-agent memory for free. Explicitly persist campaign state (contacted lists, prior outputs) via Hermes memory files or a lightweight external store (Convex is a good fit if we use it as a power-up) that the manager reads before delegating and writes after each specialist returns.
- **Real send/publish surfaces:**
  - Email: AgentMail via MCP (agent-native inbox, no OAuth dance, real send/receive, avoids Gmail's automation-detection bans) — or Gmail via MCP/Composio if we specifically want the credibility of a real Gmail domain. Decide and lock this in the first hour; don't build both.
  - Content: X (plain-text posts only — link posts cost more per the current API pricing and add no value here).
- **Observability:** use Hermes's native `/agents` overlay, `kanban tail/log`, and `hermes sessions export` for a raw trace — don't build a custom observability dashboard from scratch unless there's spare time; these give a real, inspectable trace tree for free.
- **Open source split:** the repo IS our skills folder + config.yaml + setup/deploy docs, not a separate application codebase. BYOK vs hosted is just: our deployed instance (our key, our VPS, our domain) = hosted; anyone can clone the repo and run their own Hermes with their own key = self-host. Hermes's own provider-agnostic config already handles this — do not build a custom key-routing layer.

---

## 3. Research references — go and read these yourself, this document is a guide not a cage

Do not treat this file as the complete picture. Actively search and read the following, and anything else relevant you find while building:

- **Team Hermes local setup (teammate + agent):** `references/hermes-setup-guide.md` — OpenAI BYOK, API server, orchestrator nesting. Match this before product work. VPS/hosting later.
- **Hermes Agent official docs:** https://hermes-agent.nousresearch.com/docs/ — especially the Subagent Delegation, MCP, Cron, and Messaging Gateway pages. Also check `/docs/llms-full.txt` for a single-file ingest of the whole doc set if useful.
- **Hermes Agent GitHub:** https://github.com/NousResearch/hermes-agent — installation, config.yaml reference, AGENTS.md conventions used by the Hermes project itself.
- **Buildathon rules and scoring rubric (read this fully, it governs every build decision):** https://growthx.club/docs/hermes-buildathon-builder-handbook — "AI as Agency" track, 7 weighted parameters. The single most important constraint: **real output on real live surfaces only** — staged/sandboxed surfaces (mocked CRM, sandbox email, Airtable/Notion/Sheets as a "database") cap scoring at L3 regardless of build quality. Also governs Hermes eligibility (must use Hermes as coding partner and/or as the base harness), submission format, and disqualifiers.
- **okara.ai** — closest existing product to what we're building ("AI CMO," specialist agents per channel, daily opportunities feed, human-approval gate). Study their positioning and UX for inspiration, not to copy. Their real weakness: mostly-parallel content generation with no true planning manager — our manager-that-plans-and-delegates is the differentiation.
- **Recent viral/breakout GTM playbooks — research current, not historical, examples:** companies like Cal AI (influencer-saturation-first, demonstrable "magic moment" content), Cluely (provocative/controversial launch hooks, content-army distribution — note the guardrail: controversy must have core value congruence with the product, and note their later PR walk-back as a cautionary data point, not a tactic to copy blindly), and similar current AI/consumer breakout products (e.g. Hey Clicky-type launches). Pull concrete, current patterns into the playbook skills — what a good cold investor email looks like *right now*, what makes a launch post get reshared *right now* — not generic evergreen marketing advice.
- **Current cold outreach / cold email benchmarks** — reply rate data, deliverability rules (SPF/DKIM/DMARC, sends/day limits), signal-based personalization approaches. Search for current-year data, this changes fast.
- **Current investor/VC cold email structure** — short (under ~150 words), single traction number, single specific ask, no deck attachment.
- **Community-led growth mechanics** (if time allows this build) — value-first participation ratios, platform-specific norms; do not attempt this without researching current platform-specific anti-spam signals.

When in doubt on any current fact, tactic, API limit, or pricing figure — search for it rather than relying on internal knowledge. This space (API pricing, platform rules, growth tactics) moves fast and stale information will actively hurt the build.

---

## 4. Playbooks as skills

Each outreach/content playbook must be written as a proper `SKILL.md` file (name, description, step-by-step procedure), not embedded inline in a prompt. This makes them inspectable by judges, reusable across specialists, and improvable over time (feeds the evaluation/iteration parameter). Research current best-practice structure for each playbook (see Section 3) before writing it — do not write these from memory alone.

---

## 5. Speed and prioritization

This is an 8-hour build. In order:
1. Infra first — domain, VPS, Hermes running, API Server exposed, reverse proxy live. Nothing else matters if this isn't working.
2. Manager + one specialist (outreach) working end-to-end on a real send. Prove this before building anything else.
3. Second specialist (content) + manager delegation logic (dynamic plan per brief, review/revision step).
4. Third outreach playbook variant (investor or influencer) reusing the outreach engine.
5. Observability/proof surfaces, demo rehearsal, content/footage shoot.

If something is behind schedule, cut breadth (fewer playbooks/specialists) before cutting depth (real sends, real manager delegation, real observability) — a smaller thing that actually works beats a bigger thing that's staged or flaky. Real-surface execution is the single heaviest-weighted thing being judged.

---

## 6. Workflow orchestration (how you, the coding agent, must operate)

### Plan mode is default
- Enter plan mode for any non-trivial task (3+ steps or an architectural decision). Trivial one-line fixes don't need it.
- Write the plan to `tasks/todo.md` as checkable items before starting implementation.
- Check in with the user before starting implementation on anything non-trivial.
- Mark items complete as you go; give a high-level summary of what changed at each step.
- Use plan mode for verification steps too, not just building.
- If something goes sideways mid-implementation, stop and re-plan immediately — don't keep pushing on a broken approach.
- When a task is fully done, write a short review/results section into `tasks/todo.md`, then clear/archive completed items so the file stays current and short.

### Subagent strategy (for you, the coding agent, separate from the Hermes subagents we're building)
- Use subagents liberally to keep your own main context window clean.
- Offload research, exploration, and parallel analysis to subagents.
- One clear, focused task per subagent.
- For hard problems, throw more compute at it via subagents rather than one long single-threaded attempt.

### Lessons — self-improvement loop
- Maintain `lessons/lessons.md`.
- After any correction from the user, or any time you hit a mistake or notice an important pattern while coding, append it to `lessons/lessons.md` as a short, reusable rule for your future self.
- Review `lessons/lessons.md` at the start of every session before starting work.
- Ruthlessly iterate — the goal is a dropping mistake rate over the session, not a growing unreviewed log.

### Memory — persistent project knowledge
- Maintain a `memory/` folder of multiple linked `.md` files (not one giant file). Create `memory/index.md` as the entry point that links out to the others by topic.
- Whenever you start a task, log a concise bullet-point summary of what you're doing, for your own later reference — not a narrative, just enough to reorient fast.
- Whenever a new feature or relevant decision is added, log it in the appropriate memory file, cross-linked from `index.md`.
- Purpose: you should never need to re-scan the whole codebase/conversation history to reorient — memory + lessons + index should get you there fast.

### Verification before marking anything done
- Never mark a task complete without proving it works — run it, check logs, show real output.
- For real-surface actions (sending an email, posting), verify the actual send/post happened, don't trust a 200 response alone.
- Ask: would a senior engineer approve this as actually done, not just "looks done"?

### Elegance (balanced, not perfectionist)
- For non-trivial changes, pause and ask if there's a more elegant way before committing to a hacky fix.
- Skip this for simple, obvious fixes — don't over-engineer under an 8-hour clock.

### Autonomous bug fixing
- When given a bug report, error, or failing test — just fix it. Don't ask for hand-holding or step-by-step confirmation on how to fix something already diagnosed.
- Zero unnecessary context-switching back to the user.

### Core principles
- Simplicity first — smallest change that correctly solves the problem.
- No laziness — find root causes, no temporary/band-aid fixes, hold yourself to senior-developer standards.
- Minimal blast radius — changes touch only what's necessary; don't introduce incidental bugs elsewhere.

### Token economy (conversation only, never coding quality)
- Optimize for token/output brevity **only in how you communicate with the user** — concise, to the point, no fluff, no restating what was already said, no unnecessary preamble or elaboration.
- Do **not** apply this to actual code, prompts written for Hermes skills, or anything that affects build quality or correctness — those should be as thorough and correct as the task requires. Brevity is a communication-style rule, not a shortcut on engineering rigor.

---

## 7. Note on additional skills

Additional `.cursor` skills will be added by the team for specific reference material and workflows. Treat those as authoritative supplementary instructions alongside this file — read them when present, they are not optional context.
