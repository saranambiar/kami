# E2E corpus output notes — first 8 fixtures

Generated: 2026-07-24T06:32:37.322Z

Comparison of **passing** runs for mirage, argus, cal, nike-in, linear, browserbase, notion, duolingo. Evidence pulled from harness scorecards + live Supabase-backed APIs (`agent_sessions`, `brand_profiles`, `agent_run_logs`, sales_*, distribution_*).

Still outstanding in corpus: `supabase`, `arc`.

## 1. Scorecard summary

| Fixture | Domain | Route | Steps | Gates | Session |
|---------|--------|-------|-------|-------|---------|
| mirage | trymirage.app | create_distribution → **marketing** | 7/7 | all pass | `689dc4e2-4aeb-451a-af28-9793c78a0efb` |
| argus | arguslabs.in | find_customers → **sales** | 11/11 | all pass | `9aa793a9-1c97-4ea3-a8ac-23c08f2ee560` |
| cal | cal.com | find_customers → **sales** | 11/11 | all pass | `9f754c62-1c82-4173-956c-6791faca7d18` |
| nike-in | nike.in | create_distribution → **marketing** | 7/7 | all pass | `c638d07a-2ea6-40a2-a5c5-97f6fe5a0feb` |
| linear | linear.app | find_customers → **sales** | 11/11 | all pass | `bfeafc31-6943-40ae-a921-72accd8c93c9` |
| browserbase | browserbase.com | find_customers → **sales** | 11/11 | all pass | `f66d3768-78c0-493d-8f64-47173019f478` |
| notion | notion.com | mixed → **mixed** | 11/11 | all pass | `a75eff25-5f98-4c21-93d2-c74b459906f8` |
| duolingo | duolingo.com | create_distribution → **marketing** | 7/7 | all pass | `a0147299-0d05-498e-9aca-86f9d8ee250f` |

## 2. Observability (`agent_run_logs`)

| Fixture | # logs | Kinds present |
|---------|--------|---------------|
| mirage | 6 | distribution_opportunities, distribution_research, dossier_persist, dossier_research, research, domain_validate |
| argus | 8 | sales_discover, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate |
| cal | 10 | sales_discover, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, domain_validate, research |
| nike-in | 6 | distribution_opportunities, distribution_research, dossier_persist, dossier_research, research, domain_validate |
| linear | 9 | sales_discover, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate |
| browserbase | 11 | sales_discover, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, domain_validate, research |
| notion | 8 | sales_discover, sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate |
| duolingo | 6 | distribution_opportunities, distribution_research, dossier_persist, dossier_research, domain_validate, research |

## 3. Dossier outputs (what Hermes / onboarding produced)

### mirage (`trymirage.app`)

- **Company:** Mirage
- **Category:** AI-powered browser interface personalization agent
- **Brand voice:** Mirage sounds provocative, user-empowering, and internet-native. The copy frames modern websites as imposed experiences and positions Mirage as a way to reclaim…
- **Positioning:** Mirage sells an agent that reshapes any website's look, layout, flow, behavior, and shortcuts in plain English. Its differentiation, based on first-party evidence, is that the personalized version persists for the user across sessions and devices, works on public and logged-in sites, and can absorb or remix existing userscripts and extension behaviors instea…
- **Industries:** 
- **Personas:** early users; builders and tinkerers; power users of high-frequency web apps; personalization-curious internet users; collaborators interested in helping build the product
- **Geos:** 
- **Competitors:** Chrome extensions, Userscripts via Tampermonkey or Violentmonkey, Built-in product settings and themes, Manual workflow hacks and personal setup stacks

**ICP buckets**

- **Extension-stacked web power users** — You already proved the pain by installing hacks. Mirage replaces the patchwork with one persistent, plain-English control layer. _(size: ~5k-15k reachable niche users; trigger: Posted in the last 30 days about using multiple extensions or scripts to fix a s…)_
- **Distracted feed-fatigued professionals** — Turn noisy websites back into tools: one post per screen, no For You tab, no Shorts, no bait, just the workflow you want. _(size: ~10k-25k reachable niche users; trigger: Recent complaints about doomscrolling, engagement bait, YouTube Shorts, LinkedIn…)_
- **Keyboard-first productivity obsessives** — If your terminal, editor, and keyboard are customized, your web apps should be too. Mirage makes Gmail, GitHub, Notion, and others behave like your setup. _(size: ~3k-10k reachable niche users; trigger: Shared setups or workflows in the last 60 days around keyboard shortcuts, minima…)_
- **Tinkerers already using userscripts** — Import what already works, then iterate in English instead of rewriting brittle scripts every time a site changes. _(size: ~2k-8k reachable niche users; trigger: Mentioned maintaining or importing userscripts recently, or asking for script al…)_
- **Adaptive-interface believers and design-forward early adopters** — Mirage is bigger than a productivity hack: it is a personalized internet layer that makes the web feel like it belongs to you. _(size: ~5k-12k reachable niche users; trigger: Recent engagement with ideas like personalized internet, adaptive interfaces, di…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Manual outreach to users publicly complaining about broken or addictive web interfaces** [`signal_cold_email`] — Build a weekly list from X, Reddit, and Discord posts that match homepage pain examples like 'hide Shorts', 'chronological Twitter', 'LinkedIn feed is unusable', then send a short …
- **Founder-led 6-line outreach to userscript and extension power users** [`vc_6line`] — Have Sara send concise founder notes to people who mention Tampermonkey, Violentmonkey, RES, or multiple Chrome extensions, positioning Mirage as a way to import and evolve those h…
- **Before-and-after social proof posts built from concrete website transformations** [`content_post`] — Ship short posts showing one painful site transformed into a calmer version, e.g. 'LinkedIn without feed bait' or 'Gmail keyboard-first', using the exact examples already named on …
- **Influencer seeding with setup, productivity, and digital-minimalism creators** [`influencer`] — Offer early access to creators whose audiences care about custom setups, attention control, and interface minimalism, asking them to show the one website they'd permanently reshape…
- **Community call-for-input around 'what would you reshape first?'** [`content_post`] — Run a recurring prompt in Reddit, X, and Discord communities asking users to name the first website change they would make, then reply with Mirage examples and a waitlist CTA to ca…

<details><summary>dossier_research log preview</summary>

```
»[research] Loaded first-party evidence and treated trymirage.app as the only valid entity.
»[research] Deepened the homepage with direct extraction from https://www.trymirage.app/ and ignored unrelated same-name companies.
»[brand] Mirage presents itself as “the personalized internet” and “an agent that reshapes any w…
```

</details>

### argus (`arguslabs.in`)

- **Company:** ARGUS
- **Category:** forensic observability and production-readiness platform for AI agent pipelines
- **Brand voice:** ARGUS speaks in a technical, urgent, engineer-first voice. The copy is direct and pain-led, focusing on silent failures, root causes, replay, and production tru…
- **Positioning:** ARGUS sells forensic observability for AI agent pipelines, especially LangGraph and other Python-based workflows. It positions itself as more than tracing: it auto-detects silent failures, traces root causes backward through the graph, and supports replay with frozen state. The strongest differentiators evidenced on-site are LangGraph-first integration, fram…
- **Industries:** software, AI tooling, developer platforms
- **Personas:** AI engineers; agent platform engineers; ML/LLM engineers; developer tool builders; engineering teams shipping AI to production
- **Geos:** 
- **Competitors:** LangSmith, Langfuse

**ICP buckets**

- **LangGraph teams moving from prototype to production** — You already have graph logic in production shape; ARGUS adds low-friction observability with one wrapper call and helps catch silent regressions before launch. _(size: ~1,500; trigger: Posted or shipped a LangGraph workflow, agent graph, or multi-step agent demo in…)_
- **Python agent builders debugging unreliable multi-step workflows** — Lead with forensic debugging: ARGUS traces every node, surfaces silent degradation, and pinpoints the upstream step that poisoned the pipeline. _(size: ~3,000; trigger: Recent public complaint about hallucinations, malformed tool outputs, retry loop…)_
- **AI product teams adding agent features to customer-facing workflows** — Your demo can look green while output quality collapses in production; ARGUS helps prevent customer-facing failures that standard uptime and logs will miss. _(size: ~2,000; trigger: Announced AI copilots, support agents, research agents, or automated workflows i…)_
- **Teams evaluating or already using trace-only observability tools** — Position ARGUS as the layer after tracing: detection, root-cause isolation, replay, and CI gating for semantic failures that logs alone don't flag. _(size: ~1,000; trigger: Mentioned tracing, evaluation, or agent observability tooling publicly within th…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Signal-based outbound to recent LangGraph shippers** [`signal_cold_email`] — Build a weekly list of teams that pushed LangGraph repos, demos, or changelog entries in the last 30 days and send a 6-line note offering a silent-failure teardown tied to ARGUS's …
- **Competitive displacement against trace-only stacks** [`signal_cold_email`] — Target prospects publicly referencing LangSmith or Langfuse with a before/after message: tracing shows where runs went, ARGUS detects when outputs silently degrade and replays the …
- **Founder-led content on real silent failure patterns** [`content_post`] — Publish short technical posts breaking down one failure mode at a time from the site's own categories: placeholder outputs, schema mismatch, degraded confidence, bad tool params, a…
- **VC portfolio intro angle for agent-native startups** [`vc_6line`] — Send a concise partner note to seed funds backing agent infrastructure/application startups: 'portfolio companies shipping agents are blind to silent failures; ARGUS adds productio…
- **Influencer/demo collaboration with agent engineering creators** [`influencer`] — Partner with technical creators who publish LangGraph or agent debugging walkthroughs and have them show an agent run that appears green until ARGUS catches the silent failure and …

<details><summary>dossier_research log preview</summary>

```
»[research] Identity locked to arguslabs.in only; I discarded same-name companies on argus.gg, arguslabs.us, arguslabs.ai, and directory listings because they are different domains and industries.
»[research] First-party homepage confirms company name ARGUS, category “Forensic Observability for AI Agent Pipelines,” and…
```

</details>

### cal (`cal.com`)

- **Company:** Cal.com
- **Category:** customizable scheduling software and scheduling infrastructure platform
- **Brand voice:** Cal.com presents as modern, direct, and product-led. The tone is technical and control-oriented, emphasizing customization, routing, automation, APIs, and white…
- **Positioning:** Cal.com sells scheduling software for individuals, teams, organizations, enterprises, and developers building scheduling into their own products. Its differentiators, grounded in first-party evidence, are deep customization, open-source/self-hosted options, routing logic, workflow automation, branded booking experiences, APIs/webhooks, and embeddable schedul…
- **Industries:** Sales, Marketing, Talent Acquisition, Customer Support, Human Resources, Higher Education, Healthcare, Telehealth, Professional Services, Hiring Marketplace, Law
- **Personas:** Sales leaders; Revenue operations leaders; Recruiting leaders; Customer support leaders; HR and people operations leaders; Marketing teams; Developers building scheduling platforms; IT and security stakeholders; Operations leaders; Enterprise buyers
- **Geos:** 
- **Competitors:** Calendly, Chili Piper, YouCanBookMe, HubSpot Meetings / CRM-native schedulers

**ICP buckets**

- **Sales teams replacing rigid schedulers** — Replace one-size-fits-all booking with routing by territory, deal size, or specialty, plus team controls and faster speed-to-meeting. _(size: ~8,000; trigger: Publicly hiring RevOps or sales operations in 2026 while still linking to Calend…)_
- **Talent acquisition teams with high interview coordination load** — Pitch workflow automation, multi-participant scheduling, and reduced back-and-forth for interview coordination breakdowns. _(size: ~6,000; trigger: Hiring surges in 2026 across multiple roles or geographies, with recruiters coor…)_
- **Product teams building scheduling into marketplaces or user-to-user platforms** — Lead with APIs, OAuth, Atoms, webhooks, white-label control, and the ability to build scheduling directly into the product instead of sending users to a third-p… _(size: ~4,000; trigger: MVP-stage startup in 2026 launching booking, consultation, tutoring, telehealth,…)_
- **Mid-market organizations standardizing customer-facing scheduling** — Offer branded booking experiences, organization-wide routing, workflow automation, and access controls for multi-team rollout. _(size: ~5,000; trigger: Company in 2026 centralizing support, sales, or service scheduling across depart…)_
- **Support and success teams measured on time-to-conversation** — Position Cal.com as the scheduling layer that gets customers to the right human faster with routing, reminders, and operational consistency. _(size: ~3,500; trigger: Teams in 2026 publishing SLAs, scaling support headcount, or adding premium supp…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Calendly switch campaign with contract-credit CTA** [`signal_cold_email`] — Build a targeted outbound list of companies still linking Calendly on site and send a migration-focused email highlighting advanced routing, customization, and Cal.com’s first-part…
- **Founder-to-founder outreach to marketplace and platform MVPs** [`vc_6line`] — Send six-line emails to founders building products where users meet users, positioning Cal.com as embedded scheduling infrastructure via API, OAuth, Atoms, and white-label control …
- **Pain-led recruiting automation sequence** [`content_post`] — Publish a short post and companion outbound snippet summarizing why interview scheduling breaks at volume, then offer a demo focused on collective events, workflows, and cross-time…
- **RevOps meeting-conversion teardown** [`influencer`] — Partner with a RevOps operator or creator to break down how routing logic, instant meetings, and workflow automation reduce qualified lead drop-off after form fill.
- **Enterprise proof-led outbound using Deel-style social proof** [`signal_cold_email`] — Run account-specific emails to ops and IT leaders using first-party proof that Deel has 1,200 team members on Cal.com, paired with messaging on access controls, branded booking, an…

<details><summary>dossier_research log preview</summary>

```
»[research] Identity locked to cal.com only: Cal.com, scheduling software for online bookings, based on the authoritative homepage/title block.
»[research] I used only first-party and explicitly cal.com-linked evidence; no same-name companies or off-domain narratives were considered.
»[research] Homepage evidence suppo…
```

</details>

### nike-in (`nike.in`)

- **Company:** Nike
- **Category:** Official online store for athletic shoes, clothing, and sports gear
- **Brand voice:** Nike India presents an assertive, motivational, sport-first voice anchored in performance and aspiration. The site language is clean, iconic, and commerce-ready…
- **Positioning:** Nike India sells athletic footwear, apparel, and sports gear through its official online store, with assortments spanning men, women, kids, Jordan, and multiple sports categories. The clearest differentiators in evidence are official-store trust, genuine products, broad category depth, free shipping, and product-level return/replacement eligibility on cited …
- **Industries:** sportswear retail, athletic footwear, performance apparel, sporting goods ecommerce
- **Personas:** runners; gym and training enthusiasts; basketball and Jordan sneaker buyers; football players and fans; parents shopping for kids sportswear
- **Geos:** India
- **Competitors:** Adidas, Puma, Under Armour, ASICS, New Balance

**ICP buckets**

- **Urban runners upgrading shoes** — Match them to Nike running lines like Pegasus/Vomero and reduce risk with official-store trust plus returns messaging _(size: ~25k-75k reachable high-intent buyers; trigger: Posted in the last 30 days about 5K/10K training, race prep, shoe replacement, o…)_
- **Gym and training buyers refreshing activewear** — Lead with Dri-FIT/training apparel, confidence-and-performance framing, and easy add-on bundles across tights, tops, shorts, and footwear _(size: ~50k-150k reachable buyers; trigger: Recent posts about starting a cut, new training block, gym membership, or workou…)_
- **Jordan and sneaker-culture shoppers** — Position nike.in as the official destination for iconic franchises, reducing authenticity concerns that are common in sneaker buying _(size: ~15k-40k reachable enthusiasts; trigger: Engaged in the last 14 days with Jordan, Dunk, AF1, retro running, or sneaker-dr…)_
- **Football and basketball performance buyers** — Use sport-specific shop-by-sport navigation and performance credibility to move buyers from generic gear search to official-store purchase _(size: ~20k-60k reachable buyers; trigger: Season start, tournament registration, team tryouts, or recent posts asking abou…)_
- **Family shoppers buying for men women and kids** — Promote one-stop convenience across men, women, and kids plus sale and under-₹4999 merchandising to raise first-order conversion _(size: ~40k-120k reachable household buyers; trigger: Back-to-school period, festival shopping, or recent family apparel/shoe purchase…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **New-arrivals runner conversion sprint** [`content_post`] — Publish a weekly India-specific post comparing current Nike running options surfaced on-site (for example Pegasus and Vomero) for 5K, daily training, and comfort seekers, each link…
- **Jordan authenticity win-back outreach** [`influencer`] — Partner with 10-20 Indian sneaker micro-creators to create short-form content centered on 'official store' trust, highlighting Jordan/AF1/Dunk discovery on nike.in and directing fo…
- **Sub-₹4999 first-order entry campaign** [`signal_cold_email`] — Target high-intent deal and fitness communities with curated landing-page messaging around 'Top Picks Under ₹4999' and free shipping, designed to lower the barrier for first-time N…
- **Gym-starter apparel bundle push** [`content_post`] — Create creator-led 'starting the gym' outfit picks using training tights, tops, shorts, and shoes from nike.in, with each asset anchored to confidence and performance language alre…
- **Seasonal sport-community seeding** [`influencer`] — Seed football and basketball community creators at season-start moments with shop-by-sport picks from nike.in, pairing performance-use-case storytelling with returns/replacement re…

<details><summary>dossier_research log preview</summary>

```
»[research] Identity lock applied: analysis limited to nike.in, company name Nike, using only provided first-party evidence plus narrow domain-specific retrieval.
»[research] Homepage evidence confirms an India storefront for athletic shoes, clothing, sports gear, with category depth across men, women, kids, Jordan, ru…
```

</details>

### linear (`linear.app`)

- **Company:** Linear
- **Category:** AI-native product development system for teams and agents
- **Brand voice:** Linear speaks in a crisp, opinionated, product-led style that emphasizes speed, focus, and craftsmanship. The tone is modern and confident, framing product deve…
- **Positioning:** Linear sells a product development system that helps teams plan, build, and ship software while working alongside AI agents. Its differentiation is that it is purpose-built for the AI era: it connects product context, customer feedback, roadmaps, issues, and coding workflows in one fast, shared system designed to reduce coordination overhead and keep teams m…
- **Industries:** SaaS, AI, Fintech, Consumer, Hardware, Health, Enterprise software
- **Personas:** CTO; VP Engineering; Engineering Manager; Head of Product; Product Manager; Technical founder; Product operations leader
- **Geos:** 
- **Competitors:** Jira, Asana, GitHub Issues, Shortcut

**ICP buckets**

- **AI-native engineering orgs scaling agent use** — Your developers got faster with AI; Linear gives the team-wide system, visibility, and control layer so agents do not create coordination debt. _(size: ~3,000-5,000 target companies; trigger: Posted in 2026 about adopting coding agents like Codex, Cursor, Copilot, or agen…)_
- **Jira replacement teams with 50+ employees** — Linear has explicit migration, pilot, and onboarding support for teams moving off legacy trackers, with proof around faster issue resolution and cleaner operati… _(size: ~8,000-12,000 target companies; trigger: Announced process overhaul, tooling frustration, or org-wide product/engineering…)_
- **Seed-to-Series A startup product teams** — Adopt a fast, minimal product development system early so roadmap, bug intake, and agent workflows stay clean as the team grows. _(size: ~10,000+ target startups; trigger: Raised recently or launched MVP in 2026 and is hiring product/engineering while …)_
- **Product teams drowning in customer feedback intake** — Linear turns customer conversations into linked issues and projects with customer attributes, making prioritization more legible for product and engineering. _(size: ~4,000-7,000 target companies; trigger: Team uses Intercom, Zendesk, Front, or Slack heavily and mentions feedback routi…)_
- **Cross-functional product orgs needing roadmap-to-execution visibility** — Linear connects initiatives, projects, PRDs, issues, and updates so leaders can see the full picture without adding process drag. _(size: ~5,000-8,000 target companies; trigger: Shared company-wide planning, initiative tracking, or launch coordination change…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Jira migration wedge for engineering leaders** [`signal_cold_email`] — Build a list of VP Eng and CTOs at 50-1000 employee software companies using Jira; send a short note anchored on Linear’s own migration proof, pilot guide, and faster issue-resolut…
- **AI-agent coordination narrative for coding-tool adopters** [`vc_6line`] — Target startups and growth companies publicly posting about Cursor, Codex, or Copilot adoption with a 6-line message: individuals got faster, coordination became the bottleneck, Li…
- **Customer feedback to execution motion** [`content_post`] — Publish a founder/PM-facing post on how support conversations from Slack, Intercom, Zendesk, and Front can become prioritized product work inside one system, then DM eng/product le…
- **Loops demo for operationally repetitive product teams** [`influencer`] — Partner with engineering/product creators who discuss agent workflows to demonstrate Loops for bug triage, follow-up issue generation, and launch-plan upkeep, then funnel intereste…
- **Startup program opener for MVP-stage teams** [`signal_cold_email`] — Reach out to recently funded MVP startups with a fast pitch around free or discounted startup access, cleaner issue flow, and an AI-era workflow foundation before process sprawl se…

<details><summary>dossier_research log preview</summary>

```
»[research] Locked analysis to canonical domain linear.app and company name Linear from first-party homepage evidence.
»[research] Deepened only this domain with first-party pages: homepage, pricing, customers, switch, introducing-loops, and customer-requests docs.
»[research] Core product claim is consistent across so…
```

</details>

### browserbase (`browserbase.com`)

- **Company:** Browserbase
- **Category:** Browser agent infrastructure and web automation platform
- **Brand voice:** Browserbase sounds technical, ambitious, and infrastructure-native. The tone is builder-first and production-focused, emphasizing reliability, scale, observabil…
- **Positioning:** Browserbase sells a complete platform for agents to use the web like humans, including real cloud browsers, Search and Fetch APIs, runtime, identity, model access, observability, and the Stagehand SDK. Its first-party differentiation is that teams can launch and scale browser agents without building their own fragile browser stack, while getting verified ide…
- **Industries:** AI, Healthcare, Supply Chain, GTM, Tax, Legal, Financial Services
- **Personas:** AI engineers building browser agents; Platform engineers responsible for automation infrastructure; Product managers shipping agentic workflows; Customer engineering and solutions teams deploying automations for clients; ML researchers evaluating computer-use models; Operations leaders automating portal-heavy workflows
- **Geos:** United States, Europe, United Kingdom, Asia Pacific
- **Competitors:** Self-hosted Playwright or Puppeteer stacks, Legacy selector-based browser automation workflows, Proprietary browser automation platforms that require rewrites, Generic scraping and data extraction vendors

**ICP buckets**

- **AI product teams shipping browser agents** — You already have the model layer; Browserbase gives the browser layer with verified identity, replay, and scale so your team stops babysitting automation infra. _(size: ~2,000; trigger: Posted in the last 30 days about launching an AI agent, copilots that act on web…)_
- **GTM automation and sales-tech builders** — Position Browserbase as the infrastructure for agents that research prospects, navigate login walls, update CRMs, and monitor competitor changes without brittle… _(size: ~1,500; trigger: Within 60 days announced outbound automation, lead enrichment, competitive monit…)_
- **Model evaluation and computer-use research teams** — Use the evaluations page wedge: run trusted, human-verified benchmarks on real websites with deterministic browser infrastructure and full traces. _(size: ~500; trigger: Published benchmark, eval, or computer-use research in the last 90 days; mention…)_
- **Regulated operations teams automating portal-heavy workflows** — Lead with authenticated workflows, auditability, isolated sessions, and human handoff for MFA/CAPTCHA moments where APIs do not exist. _(size: ~1,200; trigger: Recently launched or hired around insurance verification, claims ops, legal docu…)_
- **Lean founders building workflow products on top of the web** — Sell the build-vs-buy shortcut: keep your product logic, plug in Browserbase for reliability and scale, and avoid spending your first hires on browser infra. _(size: ~3,000; trigger: Within 30 days launched MVPs around automation, web research, monitoring, or age…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Outbound to teams hiring for agent platform or customer engineering** [`signal_cold_email`] — Build a list from Browserbase-adjacent companies hiring for agent platform, applied AI, automation, or customer engineering roles; email with a tight wedge around 'stop building br…
- **Computer-use eval wedge for labs and agent startups** [`vc_6line`] — Send a six-line note to founders and research leads who recently published eval or browser-agent work: offer a short call on using Browserbase's real-web, human-verified evaluation…
- **Founder-led content around the '85% of the web APIs cannot reach' thesis** [`content_post`] — Publish a post comparing three modes: API-only, self-hosted browser automation, and Browserbase-style agent infrastructure, using first-party proof points like verified identity, l…
- **Influencer co-sell through agent-framework and GTM automation builders** [`influencer`] — Partner with creators and operators who demo Clay, AI agents, or browser automation; have them show a workflow that crosses login walls or dynamic forms, then route viewers to a Br…
- **Customer-story outbound based on visible adjacent use cases** [`signal_cold_email`] — Use first-party stories like Ramp, Chronicle, Convergence, and evaluation pages to craft verticalized emails for finance ops, legal-tech, and AI teams: 'we noticed you automate X; …

<details><summary>dossier_research log preview</summary>

```
»[research] Locked analysis to the canonical domain browserbase.com and used only the supplied identity plus first-party Browserbase pages to deepen confidence.
»[research] Homepage evidence is explicit: “Give your agents access to the whole web” and “Browserbase makes the web as reliable and programmable as APIs.”
»[r…
```

</details>

### notion (`notion.com`)

- **Company:** The AI workspace that works for you.
- **Category:** AI-powered collaborative workspace for knowledge, projects, search, and custom agents
- **Brand voice:** Notion speaks in a crisp, confident, product-led voice that makes advanced workflows feel simple and approachable. The tone blends ambition with usability, posi…
- **Positioning:** Notion sells an AI workspace that combines docs, knowledge bases, projects, enterprise search, meeting notes, connections, and custom agents in one platform. Its differentiation, based on first-party evidence, is consolidation: teams can centralize knowledge, connect external tools, and automate repeat workflows with agents instead of stitching together sepa…
- **Industries:** software, technology startups, product development, design, marketing, IT, education
- **Personas:** startup founders; product leaders; engineering managers; design teams; marketing teams; IT leaders; sales enablement leaders; operations leaders
- **Geos:** 
- **Competitors:** ClickUp, Airtable, Coda, Asana, Guru

**ICP buckets**

- **Seed-to-Series A startups formalizing operating systems** — Lead with Startup in a Box, investor CRM, company wiki, product launch templates, and AI-assisted launch copy to help a small team stand up operating systems fa… _(size: ~20k; trigger: Raised pre-seed/seed funding or posted new hiring roles within the last 90 days …)_
- **Product and engineering teams coordinating launches** — Pitch Notion as the single place for launch coordination, blocker surfacing, stakeholder updates, and launch-ready summaries using Custom Agents and shared work… _(size: ~15k; trigger: Announced a launch, roadmap milestone, or major release in the last 30 days)_
- **GTM and sales enablement teams buried in manual prep** — Use the Braintrust-style wedge: automate competitor research, sales prep, and customer evidence updates so reps always pull current one-pagers and marketing sto… _(size: ~12k; trigger: Recently hired enablement, RevOps, or sales operations talent in the last 60 day…)_
- **IT and internal operations teams managing cross-tool knowledge** — Position Notion’s knowledge base, enterprise search, and task-routing or Q&A agents as a way to answer repeat internal questions and route work without constant… _(size: ~18k; trigger: Posted jobs mentioning internal knowledge bases, service ownership, ticketing, o…)_
- **Microsoft-heavy mid-market and enterprise teams exploring AI workflows** — Open with first-party evidence that Notion Agents can read and create PPTX/XLSX/DOCX files and use Outlook Mail and Calendar, reducing friction for teams that c… _(size: ~10k; trigger: Mentioned Outlook, PowerPoint, Excel, or Microsoft workflow modernization in the…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **Startup in a Box outreach to recently funded startups** [`vc_6line`] — Send a 6-line email to founders at newly funded startups offering a live walkthrough of how Notion can stand up a wiki, investor CRM, hiring page, and product launch system in one …
- **Launch coordination trigger for product orgs** [`signal_cold_email`] — Target companies that announced a launch in the last 30 days with a note centered on how Notion’s product team uses Custom Agents to surface blockers, generate status updates, and …
- **Competitive intelligence and sales prep wedge for GTM teams** [`signal_cold_email`] — Email sales and marketing leaders with a concrete offer to map one repeat workflow inside Notion: competitor changelog monitoring, sales one-pager refresh, and customer-evidence ca…
- **Educational content around enterprise search plus agents** [`content_post`] — Publish a tightly scoped post showing how enterprise search, knowledge bases, and Q&A agents reduce repeat internal questions for CX, engineering, and IT teams, ending with a demo …
- **Microsoft workflow modernization meetings** [`influencer`] — Partner with operators or consultants serving Microsoft-centric teams to demo how Notion Agents work with Outlook, Calendar, PowerPoint, Excel, and Word files while keeping context…

<details><summary>dossier_research log preview</summary>

```
»[research] Identity locked to notion.com only; I ignored same-name companies on other domains and used the provided first-party evidence plus limited notion.com deepening.
»[research] Homepage evidence is strong: “Build Custom Agents, search across all your apps, and automate busywork” and “The AI workspace where team…
```

</details>

### duolingo (`duolingo.com`)

- **Company:** Duolingo
- **Category:** freemium language-learning platform with adjacent English proficiency testing and education products
- **Brand voice:** Duolingo sounds playful, encouraging, and mass-market, presenting learning as a game rather than a chore. At the same time, it balances that lightness with scie…
- **Positioning:** Duolingo sells a free, fun, science-based way to learn languages online and in mobile apps. Its differentiators, grounded in first-party evidence, are universal free access, gamified daily engagement, and a technology-first approach that uses large-scale learner data and AI to improve teaching and expand content. The broader Duolingo product family also incl…
- **Industries:** consumer education, language learning, edtech, higher education admissions, K-12 education
- **Personas:** language learners; English learners; students applying to universities; language teachers; parents and families; career changers
- **Geos:** global, United States, Mexico, Vietnam
- **Competitors:** Babbel, Busuu, Rosetta Stone, TOEFL/IELTS-style proficiency pathways

**ICP buckets**

- **Ambitious English learners seeking career mobility** — Start free, build a daily habit, and improve English with a fun science-based app instead of committing upfront to expensive classes. _(size: ~100k-500k reachable globally in social and community channels; trigger: Posted in the last 30 days about improving English for work, interviews, relocat…)_
- **University applicants needing English proof** — Lead with the Duolingo English Test as a fast, affordable online exam with results in 2 days and broad institutional acceptance. _(size: ~50k-200k reachable in active applicant ecosystems; trigger: Mentioned applying to universities or needing an English proficiency exam this a…)_
- **Language teachers and classroom adopters** — Pitch Duolingo for Schools as a free, fun classroom companion that increases student motivation and gives teachers an easy digital reinforcement layer. _(size: ~25k-100k reachable educators in English and world-language communities; trigger: Shared classroom resource requests or curriculum-planning posts for the upcoming…)_
- **Parents building bilingual habits at home** — Position Duolingo as a free and playful way for families to learn together, reinforced by family plans and broad beginner accessibility. _(size: ~50k-150k reachable through parent and family-learning communities; trigger: Recent discussion about kids learning a second language, bilingual households, o…)_
- **Casual learners re-entering language study** — Remove friction: no class schedule, no upfront spend, just a game-like daily streak that makes it easy to begin again. _(size: ~100k-300k reachable across broad consumer channels; trigger: Recently posted about restarting Spanish/French/Japanese or wanting a low-pressu…)_

**Dossier opportunities (onboarding, not Marketing queue)**

- **English-for-work creator partnership sprint** [`influencer`] — Partner with 10 micro-creators who teach job-interview English, workplace English, or relocation tips, and have each publish a short video showing a 7-day Duolingo habit challenge …
- **Admissions-cycle DET signal outreach** [`signal_cold_email`] — Build a weekly list of study-abroad consultants, applicant communities, and admissions newsletter operators discussing English testing, then send a short partner pitch centered on …
- **Teacher back-to-school activation** [`content_post`] — Publish a teacher-facing post and companion asset around how to use Duolingo for Schools as a free classroom engagement layer, timed 30-45 days before major school start windows.
- **Family-plan gifting push** [`content_post`] — Run a family-learning campaign that packages language learning as a shared household habit, highlighting that Super Duolingo supports family plans and gifting for friends and relat…
- **VC-style growth memo for mission-driven education buyers** [`vc_6line`] — Send a six-line proof-driven outreach note to ecosystem partners emphasizing Duolingo’s free-access mission, word-of-mouth flywheel, global scale, and learner-first product model t…

<details><summary>dossier_research log preview</summary>

```
»[research] Identity lock confirmed: analyzing only Duolingo at duolingo.com using the provided first-party and explicitly linked Duolingo properties.
»[research] Homepage evidence is clear: Duolingo describes itself as the world’s most popular way to learn a language, 100% free, fun, and science-based.
»[research] Inv…
```

</details>

## 4. Sales path outputs (B2B / mixed)

Fixtures that took Sales: argus, cal, linear, browserbase, notion. (mirage/nike-in/duolingo = Marketing.)

### argus

- **Offer:** ARGUS sells forensic observability for AI agent pipelines, especially LangGraph and other Python-based workflows. It positions itself as more than tracing: it auto-detects silent failures, traces root causes backward through the graph, and …
- **ICP:** `{"titles":["AI engineer or agent platform engineer","ML engineer or LLM engineer","Engineering manager or head of AI engineering","Staff AI engineer or platform engineering lead"],"industries":["Developer-platform companies","AI tooling startups","support agents","research agents"]}`
- **Segments confirmed:** 2026-07-24T04:35:14.418+00:00
- **Plan status:** approved
- **Channel rationale:** Email fits these buyers because the personas are technical decision-makers who respond to precise, evidence-led problem framing tied to a recent ship, issue, or tooling reference. ARGUS's value is easiest to communicate in a short technical note that contrasts trace visibility wi…
- **Risks:** Signal quality may be uneven across targets; if a company has no recent public evidence of agent-production activity or observability discussion, it should be held for nurture rather than treated as high intent.; Some prospects may already use internal debugging or observability stacks, making the wedge harder unless outreach clearly distinguishes detection and replay from standard tracing.; Customer-facing AI announcements do not always imply graph-based or Python-based pipelines, so messaging may need to stay broader unless the underlying stack is confirmed.; The company pack gives strong product positioning but limited proof assets such as case studies, benchmarks, or quantified outcomes, which may reduce reply rates for skeptical engineering buyers.
- **Accounts found:** 20

| Company | Domain | Tier | Contact email |
|---------|--------|------|---------------|
| WhyLabs | whylabs.ai | 2 | — |
| Arize AI | arize.com | 1 | observe@arize.com |
| Patronus AI | patronus.ai | 1 | security@patronus.ai |
| Vellum | vellum.ai | 1 | first@vellum.ai |
| Humanloop | humanloop.com | 1 | privacy@humanloop.com |
| Decagon | decagon.ai | 1 | sales@decagon.ai |
| Adept | adept.ai | 1 | privacy@adept.ai |
| Zapier | zapier.com | 1 | first.last@zapier.com |
| Gorgias | gorgias.com | 1 | first.last@gorgias.com |
| Intercom | intercom.com | 1 | legal@intercom.com |
| n8n | n8n.io | 1 | marketing@n8n.io |
| Pipedream | pipedream.com | 1 | first@pipedream.com |
| Lindy | lindy.ai | 1 | support@lindy.ai |
| Gumloop | gumloop.com | 1 | founders@gumloop.com |
| Dust | dust.tt | 1 | first@dust.tt |

<details><summary>sales_segments preview</summary>

```
```json
{
  "segments": [
    {
      "name": "LangGraph-native teams moving agent workflows into production",
      "why_fit": "These teams already model work as graphs, so ARGUS fits the architecture they have today. They would buy it because ARGUS is LangGraph-first, can trace failures backward through graph nodes, …
```

</details>

<details><summary>sales_plan preview</summary>

```
```json
{
  "motions": [
    {
      "motion": "signal_outreach",
      "rationale": "ARGUS has a technical, pain-led offer that fits best when the buyer has already shown evidence of agent-production pain or graph-based deployment. The strongest motion is signal-backed outbound to teams that recently shipped LangGraph…
```

</details>

<details><summary>sales_discover preview</summary>

```
Relevance AI (relevanceai.com) · jacky@relevanceai.com
CrewAI (crewai.com) · matt@crewai.com
Aisera (aisera.com) · info@aisera.com
Stack AI (stack-ai.com) · dpo@stack-ai.com
Voiceflow (voiceflow.com) · braden@voiceflow.com
Dust (dust.tt) · first@dust.tt
Gumloop (gumloop.com) · founders@gumloop.com
Lindy (lindy.ai) · su…
```

</details>

### cal

- **Offer:** Cal.com sells scheduling software for individuals, teams, organizations, enterprises, and developers building scheduling into their own products. Its differentiators, grounded in first-party evidence, are deep customization, open-source/sel…
- **ICP:** `{"titles":["VP of Sales","RevOps leader","or Sales Operations leader","Head of Recruiting","Recruiting Operations leader","or VP of Talent Acquisition"],"industries":["B2B companies with scaled SDR","inbound","or demo motions","typically mid-market to enterprise","multiple sales teams or regions","measurable meeting-conversion pressure."]}`
- **Segments confirmed:** 2026-07-24T04:55:34.957+00:00
- **Plan status:** approved
- **Channel rationale:** Email fits these buyers because the target personas are operators, recruiting leaders, product leaders, and systems owners who respond to specific, evidence-led problem statements tied to routing, workflow automation, branding, APIs, and governance. It also supports founder appro…
- **Risks:** Several target segments require external signal verification before outreach; without current hiring, tooling, or product-launch evidence, outreach should be deprioritized to nurture rather than framed as high intent.; Industry-specific messaging can drift into unsupported narratives if not tightly anchored to the company pack; healthcare, telehealth, law, and other vertical angles should only be used when the account context explicitly supports them.; The self-serve individual professional segment is confirmed but not well suited to this 15-account assisted sales campaign format.; Enterprise standardization messaging may need stronger proof around security, governance, and rollout outcomes than is provided in this pack alone.
- **Accounts found:** 18

| Company | Domain | Tier | Contact email |
|---------|--------|------|---------------|
| Cleveland Clinic | clevelandclinic.org | 2 | — |
| Cloudflare | cloudflare.com | 2 | — |
| ZoomInfo | zoominfo.com | 2 | — |
| HCA Healthcare | hcahealthcare.com | 1 | privacy@hcahealthcare.com |
| University of Phoenix | phoenix.edu | 1 | jessica.flores@phoenix.edu |
| Deloitte | deloitte.com | 1 | dart@deloitte.com |
| PwC | pwc.com | 1 | webmaster@pwc.com |
| Talkspace | talkspace.com | 1 | team@talkspace.com |
| Preply | preply.com | 1 | support@preply.com |
| Thumbtack | thumbtack.com | 1 | security@thumbtack.com |
| Upwork | upwork.com | 1 | last@upwork.com |
| Figma | figma.com | 1 | press@figma.com |
| Canva | canva.com | 1 | support@canva.com |
| Datadog | datadoghq.com | 1 | info@datadoghq.com |
| Outreach | outreach.io | 1 | hr@outreach.io |

<details><summary>sales_segments preview</summary>

```
```json
{
  "segments": [
    {
      "name": "Sales and RevOps teams replacing rigid schedulers",
      "why_fit": "These teams would buy Cal.com to move beyond basic booking links into routing by territory, deal size, or specialty, with branded booking pages, workflow automation, and team-level controls. Cal.com also…
```

</details>

<details><summary>sales_plan preview</summary>

```
```json
{
  "motions": [
    {
      "motion": "signal_outreach",
      "rationale": "Cal.com has the clearest fit where public signals indicate scheduling complexity beyond a basic booking link: sales and RevOps teams with routing friction, recruiting teams coordinating high interview volume, product teams embedding s…
```

</details>

<details><summary>sales_discover preview</summary>

```
Deel (deel.com) · e@deel.com
Rippling (rippling.com) · taxagencies@rippling.com
Gong (gong.io) · h@gong.io
Outreach (outreach.io) · hr@outreach.io
Datadog (datadoghq.com) · info@datadoghq.com
Canva (canva.com) · support@canva.com
Figma (figma.com) · press@figma.com
Upwork (upwork.com) · last@upwork.com
Thumbtack (thumb…
```

</details>

### linear

- **Offer:** Linear sells a product development system that helps teams plan, build, and ship software while working alongside AI agents. Its differentiation is that it is purpose-built for the AI era: it connects product context, customer feedback, roa…
- **ICP:** `{"titles":["CTO or VP Engineering","VP Engineering or Engineering Manager","Technical founder or Head of Product","Head of Product or Product Operations leader"],"industries":["Software","fintech","enterprise software","Seed to Series A startups in SaaS","consumer"]}`
- **Segments confirmed:** 2026-07-24T05:07:55.547+00:00
- **Plan status:** approved
- **Channel rationale:** Email fits these buyers because the core personas are senior product and engineering operators who respond to precise, trigger-based outreach tied to visible org or workflow changes. It also supports product-neutral CTAs and founder approval before send. X can support research an…
- **Risks:** Signal quality may be uneven outside the named candidate accounts, especially for startup and feedback-intake segments.; Without verified public evidence of agent rollout, tooling dissatisfaction, or planning changes, outreach risks sounding generic and should be held back.; Some target companies may already use Linear or may have recently completed a migration, which would change the angle or disqualify the account.; Product operations and feedback-routing pain can be hard to confirm from public sources alone, so this segment may require slower research or nurture-first handling.; Keeping CTAs product-neutral may reduce immediate conversion pressure, so message quality and trigger relevance matter more.
- **Accounts found:** 19

| Company | Domain | Tier | Contact email |
|---------|--------|------|---------------|
| Gusto | gusto.com | 2 | — |
| Sourcegraph | sourcegraph.com | 2 | — |
| Plaid | plaid.com | 1 | fi-support@plaid.com |
| Mercury | mercury.com | 1 | help@mercury.com |
| Rippling | rippling.com | 1 | taxagencies@rippling.com |
| Figma | figma.com | 1 | press@figma.com |
| Canva | canva.com | 1 | support@canva.com |
| Airtable | airtable.com | 1 | security@airtable.com |
| Zapier | zapier.com | 1 | first.last@zapier.com |
| Front | front.com | 1 | last@front.com |
| Intercom | intercom.com | 1 | legal@intercom.com |
| Contentsquare | contentsquare.com | 1 | press@contentsquare.com |
| Webflow | webflow.com | 1 | support@webflow.com |
| Miro | miro.com | 1 | platform-support@miro.com |
| Ramp | ramp.com | 1 | communications@ramp.com |

<details><summary>sales_segments preview</summary>

```
```json
{
  "segments": [
    {
      "name": "AI-native engineering orgs scaling coding agents",
      "why_fit": "These teams already made individual developers faster with coding agents, so their next bottleneck is shared context, prioritization, and control. Linear fits because it is purpose-built for the AI era, c…
```

</details>

<details><summary>sales_plan preview</summary>

```
```json
{
  "motions": [
    {
      "motion": "signal_outreach",
      "rationale": "Linear’s strongest near-term motion is signal-backed outreach because its value is clearest when a team is already feeling coordination strain: scaling coding agents, replacing legacy issue tracking, routing too much feedback, or tryi…
```

</details>

<details><summary>sales_discover preview</summary>

```
Vercel (vercel.com) · security@vercel.com
Replit (replit.com) · first@replit.com
PostHog (posthog.com) · careers@posthog.com
Modal (modal.com) · press@modal.com
Ramp (ramp.com) · communications@ramp.com
Miro (miro.com) · platform-support@miro.com
Webflow (webflow.com) · support@webflow.com
Contentsquare (contentsquare.…
```

</details>

### browserbase

- **Offer:** Browserbase sells a complete platform for agents to use the web like humans, including real cloud browsers, Search and Fetch APIs, runtime, identity, model access, observability, and the Stagehand SDK. Its first-party differentiation is tha…
- **ICP:** `{"titles":["AI engineer","applied AI lead","or product manager for agentic workflows","Head of product","engineering lead","or platform engineer for automation infrastructure"],"industries":["copilots","GTM automation and sales-tech builders","Sales-tech","RevOps tooling","prospecting","enrichment"]}`
- **Segments confirmed:** 2026-07-24T05:32:13.576+00:00
- **Plan status:** approved
- **Channel rationale:** Email fits these buyers because the personas are technical or product-led decision-makers who respond better to precise, evidence-based problem framing than broad social promotion. It supports tight personalization around launch, hiring, or research signals and keeps the ask prod…
- **Risks:** Signal density may be uneven across the full 15-account target, especially for regulated operations and lean founder segments; low-signal accounts should be held for nurture rather than treated as active demand.; Browserbase spans several use cases, so weak segmentation can produce generic messaging that sounds like scraping infrastructure rather than full browser-agent infrastructure.; Some target accounts may still prefer self-hosted Playwright or Puppeteer for control or cost reasons, so outreach must acknowledge existing stacks instead of assuming greenfield adoption.; Evaluation and research teams may have interest but unclear commercial buying urgency, making response rates less predictive of near-term pipeline.; Without verified individual contacts and recent triggers, contact-volume assumptions may be optimistic.
- **Accounts found:** 20

| Company | Domain | Tier | Contact email |
|---------|--------|------|---------------|
| Gusto | gusto.com | 2 | — |
| Weights & Biases | wandb.ai | 2 | — |
| ZoomInfo | zoominfo.com | 2 | — |
| Plaid | plaid.com | 1 | fi-support@plaid.com |
| Clio | clio.com | 1 | sales@clio.com |
| Avalara | avalara.com | 1 | customer.events@avalara.com |
| Ramp | ramp.com | 1 | communications@ramp.com |
| Cognition | cognition.ai | 1 | privacy@cognition.ai |
| Scale AI | scale.com | 1 | accommodations@scale.com |
| Anthropic | anthropic.com | 1 | partner-marketing@anthropic.com |
| OpenAI | openai.com | 1 | supplyco@openai.com |
| Unify | unifygtm.com | 1 | privacy@unifygtm.com |
| Common Room | commonroom.io | 1 | uncommon@commonroom.io |
| Apollo | apollo.io | 1 | press@apollo.io |
| Clay | clay.com | 1 | privacy@clay.com |

<details><summary>sales_segments preview</summary>

```
```json
{
  "segments": [
    {
      "name": "AI product teams shipping browser agents",
      "why_fit": "These teams already have model and application layers but need a production browser layer for agents that can operate real websites reliably. Browserbase fits because it provides cloud browsers, verified identity…
```

</details>

<details><summary>sales_plan preview</summary>

```
```json
{
  "motions": [
    {
      "motion": "signal_outreach",
      "rationale": "Browserbase is an infrastructure product with clear fit for teams already shipping or evaluating browser-based agents, GTM automations, or portal-heavy workflows. The strongest near-term motion is signal-backed outreach to accounts sh…
```

</details>

<details><summary>sales_discover preview</summary>

```
Harvey (harvey.ai) · lawschools@harvey.ai
Lindy (lindy.ai) · support@lindy.ai
11x (11x.ai) · first@11x.ai
Gumloop (gumloop.com) · founders@gumloop.com
Adept (adept.ai) · privacy@adept.ai
Clay (clay.com) · privacy@clay.com
Apollo (apollo.io) · press@apollo.io
Common Room (commonroom.io) · uncommon@commonroom.io
Unify (u…
```

</details>

### notion

- **Offer:** Notion sells an AI workspace that combines docs, knowledge bases, projects, enterprise search, meeting notes, connections, and custom agents in one platform. Its differentiation, based on first-party evidence, is consolidation: teams can ce…
- **ICP:** `{"titles":["Founder","Head of Operations","or early Product leader","VP Product","Director of Product Operations","or Engineering Manager"],"industries":["marketing","and revenue operations teams","internal operations","or knowledge management functions","product orgs","design teams"]}`
- **Segments confirmed:** 2026-07-24T05:42:44.785+00:00
- **Plan status:** approved
- **Channel rationale:** Email fits these buyers because the motion is research-led, founder-approved, and best when anchored to specific public signals like funding, launches, and hiring. It gives enough room to connect the trigger to a concrete Notion use case without overcommitting to a narrow feature…
- **Risks:** Several segments are strong at the category level, but account-specific evidence may be thin unless fresh funding, launch, or hiring signals can be verified.; If outreach drifts into generic project-management positioning, it will weaken Notion’s differentiation versus ClickUp, Asana, Airtable, Coda, and Guru.; The Microsoft-heavy enterprise angle appears in the company pack, but it is not one of the confirmed segments for this target_count plan, so it should not dominate the first cohort unless explicit signals are found.; PLG individual-user adoption is a valid segment, but it is weaker for sales-assisted outreach unless a clear team-wide workflow change is visible.
- **Accounts found:** 19

| Company | Domain | Tier | Contact email |
|---------|--------|------|---------------|
| Okta | okta.com | 1 | oktaforstartups@okta.com |
| Zendesk | zendesk.com | 1 | ask.gcr@zendesk.com |
| Dropbox | dropbox.com | 1 | 015d5ce7dd3142cd8fca094a50adbf69@d.dropbox.com |
| Shopify | shopify.com | 1 | addresssupport@shopify.com |
| Canva | canva.com | 1 | support@canva.com |
| Webflow | webflow.com | 1 | support@webflow.com |
| Zapier | zapier.com | 1 | first.last@zapier.com |
| Rippling | rippling.com | 1 | taxagencies@rippling.com |
| Gong | gong.io | 1 | mobile@gong.io |
| HubSpot | hubspot.com | 1 | billing@hubspot.com |
| Snyk | snyk.io | 1 | press@snyk.io |
| Miro | miro.com | 1 | platform-support@miro.com |
| Atlassian | atlassian.com | 1 | press@atlassian.com |
| Figma | figma.com | 1 | press@figma.com |
| Clay | clay.com | 1 | privacy@clay.com |

<details><summary>sales_segments preview</summary>

```
```json
{
  "segments": [
    {
      "name": "Seed-to-Series A startups formalizing their operating system",
      "why_fit": "These teams buy Notion when they want one AI workspace to stand up core company systems fast: docs, wiki, project coordination, meeting notes, searchable knowledge, and repeat-work automation …
```

</details>

<details><summary>sales_plan preview</summary>

```
```json
{
  "motions": [
    {
      "motion": "signal_outreach",
      "rationale": "Notion’s strongest sales motion here is signal-backed outreach because the product wins when a team has an active coordination or knowledge-system problem now, not a vague future interest. The confirmed segments all have clear operati…
```

</details>

<details><summary>sales_discover preview</summary>

```
Linear (linear.app) · hello@linear.app
Vercel (vercel.com) · security@vercel.com
PostHog (posthog.com) · careers@posthog.com
Retool (retool.com) · support@retool.com
Clay (clay.com) · privacy@clay.com
Figma (figma.com) · press@figma.com
Atlassian (atlassian.com) · press@atlassian.com
Miro (miro.com) · platform-support@…
```

</details>

## 5. Marketing / distribution outputs (PLG·D2C)

### mirage

- **Goal:** early_users · **Angle:** Join conversations where people describe the exact problem you solve; offer a useful answer first. · **Surfaces:** x, reddit, linkedin
- **Opportunities:** 3

| Platform | Why now | Action | Draft (clip) | URL |
|----------|---------|--------|--------------|-----|
| x | People discussing Mirage sells an agent that reshapes any website's look, layout, flow, behavior, and shortcuts in plain… | Post a short insight or reply in a relevant thread; product mention only if natural. | Working on Mirage: Join conversations where people describe the exact problem you solve; offer a use… | https://x.com/search?q=Mirage%20sells%20an%20agent%20that%20reshapes%20any%20 |
| reddit | Reddit discussions about Mirage sells an agent that reshapes any website's look, layout, flow, behavior, and shortcuts i… | Answer the question helpfully; mention the product only if rules allow and it fits. | I've been deep in this problem while building Mirage. Here's what worked for us… | manual://paste-thread-url |
| linkedin | Founder-led posts outperform brand pages for early-stage credibility. | Post as the founder; invite comments from people who've felt the pain. | Join conversations where people describe the exact problem you solve; offer a useful answer first.  … | https://www.linkedin.com/feed/ |

<details><summary>distribution_research preview</summary>

```
[{"platform":"reddit","source_url":"https://www.reddit.com/r/userscripts/new/","evidence":"Public Reddit feed result surfaced a fresh r/userscripts thread: \"Need help creating a MyPost Business userscript (Australia Post) — new 2026 UI broke my workflow\" with snippet saying the recent UI overhaul broke the extension …
```

</details>

<details><summary>distribution_opportunities preview</summary>

```
x: People discussing Mirage sells an agent that reshapes any website's look, layout, flow, behavior, and shortcuts in plain English. Its differentiation, based on first-party eviden are active; a founder-native take can create early attention.
reddit: Reddit discussions about Mirage sells an agent that reshapes any web…
```

</details>

### nike-in

- **Goal:** early_users · **Angle:** Join conversations where people describe the exact problem you solve; offer a useful answer first. · **Surfaces:** x, reddit, linkedin
- **Opportunities:** 3

| Platform | Why now | Action | Draft (clip) | URL |
|----------|---------|--------|--------------|-----|
| x | People discussing Nike India sells athletic footwear, apparel, and sports gear through its official online store, with a… | Post a short insight or reply in a relevant thread; product mention only if natural. | Working on Nike: Join conversations where people describe the exact problem you solve; offer a usefu… | https://x.com/search?q=Nike%20India%20sells%20athletic%20footwear%2C%20appa |
| reddit | Reddit discussions about Nike India sells athletic footwear, apparel, and sports gear through its official online store,… | Answer the question helpfully; mention the product only if rules allow and it fits. | I've been deep in this problem while building Nike. Here's what worked for us… | manual://paste-thread-url |
| linkedin | Founder-led posts outperform brand pages for early-stage credibility. | Post as the founder; invite comments from people who've felt the pain. | Join conversations where people describe the exact problem you solve; offer a useful answer first.  … | https://www.linkedin.com/feed/ |

<details><summary>distribution_research preview</summary>

```
[{"platform":"reddit","source_url":"https://www.reddit.com/r/india/comments/1bic8h4/i_want_to_order_a_sneaker_from_nikecomin_but_its/","evidence":"Public Reddit thread about buying from nike.com/in: user says Nike India is adding heavy delivery fees and asks about KYC/customs. Linkup snippet captured: 'I want to order …
```

</details>

<details><summary>distribution_opportunities preview</summary>

```
x: People discussing Nike India sells athletic footwear, apparel, and sports gear through its official online store, with assortments spanning men, women, kids, Jordan, and multiple are active; a founder-native take can create early attention.
reddit: Reddit discussions about Nike India sells athletic footwear, apparel…
```

</details>

### duolingo

- **Goal:** early_users · **Angle:** Join conversations where people describe the exact problem you solve; offer a useful answer first. · **Surfaces:** x, reddit, linkedin
- **Opportunities:** 3

| Platform | Why now | Action | Draft (clip) | URL |
|----------|---------|--------|--------------|-----|
| x | People discussing Duolingo sells a free, fun, science-based way to learn languages online and in mobile apps. Its differ… | Post a short insight or reply in a relevant thread; product mention only if natural. | Working on Duolingo: Join conversations where people describe the exact problem you solve; offer a u… | https://x.com/search?q=Duolingo%20sells%20a%20free%2C%20fun%2C%20science-base |
| reddit | Reddit discussions about Duolingo sells a free, fun, science-based way to learn languages online and in mobile apps. Its… | Answer the question helpfully; mention the product only if rules allow and it fits. | I've been deep in this problem while building Duolingo. Here's what worked for us… | manual://paste-thread-url |
| linkedin | Founder-led posts outperform brand pages for early-stage credibility. | Post as the founder; invite comments from people who've felt the pain. | Join conversations where people describe the exact problem you solve; offer a useful answer first.  … | https://www.linkedin.com/feed/ |

<details><summary>distribution_research preview</summary>

```
[
  {
    "platform": "reddit",
    "source_url": "https://www.reddit.com/r/languagelearning/comments/1i5bbp3/i_need_a_duolingo_replacement_i_cant_afford_my/",
    "evidence": "Public Reddit thread found via Linkup. The title explicitly asks for a Duolingo replacement and mentions affordability pain: 'I need a duolingo…
```

</details>

<details><summary>distribution_opportunities preview</summary>

```
x: People discussing Duolingo sells a free, fun, science-based way to learn languages online and in mobile apps. Its differentiators, grounded in first-party evidence, are universal are active; a founder-native take can create early attention.
reddit: Reddit discussions about Duolingo sells a free, fun, science-based w…
```

</details>

## 6. Cross-cutting observations (for later RCA / gold compare)

Hard gates already **passed** for all 8. Below is qualitative judgment vs the gold corpus — this is where iteration should focus next.

### What looks strong

| Area | Evidence from these runs |
|------|--------------------------|
| **Identity lock** | Argus research log explicitly discarded biomedical / same-name domains; dossier stays LangGraph / agent-pipeline observability. Mirage stayed browser-personalization (not Strukto VFS / video Mirage). |
| **Route honesty** | PLG/D2C (mirage, nike-in, duolingo) took Marketing; B2B took Sales; notion mixed→Sales without inventing shopper emails. |
| **Dossier depth** | Onboarding dossiers are long-form, first-party grounded, with 4–5 ICP buckets and named competitors (not empty shells). |
| **Plan quality** | Sales plans cite risks honestly (signal thinness, vertical drift, PLG mismatch) rather than fake certainty. |
| **Observability** | Every pass has a full `agent_run_logs` chain for the path taken (6–11 rows). |

### What looks weak / fix-worthy

| Area | Evidence | Likely class |
|------|----------|--------------|
| **Contact emails are often role/shared inboxes** | Cal/Linear/Browserbase/Notion lists include `support@`, `press@`, `privacy@`, `hr@`, `webmaster@`, even odd addresses like `last@upwork.com`, `e@deel.com`, `h@gong.io`. Real domains, weak buyer emails. | `data_research` / contact-find gates |
| **Cal healthcare drift in discover** | Gold says don’t force healthcare-only; dossier still lists Healthcare/Telehealth industries; discover returned Cleveland Clinic, HCA Healthcare, Talkspace alongside Cloudflare/Datadog. Plan *warns* about this — discover didn’t fully respect the warning. | `prompt_skill` + discover filtering |
| **Repeated “usual suspect” accounts** | Figma, Canva, Rippling, Ramp, ZoomInfo appear across multiple B2B fixtures — possible template gravity vs ICP-specific research. | `data_research` |
| **Marketing why_now / draft quality** | Nike + Duolingo opportunity `why_now` often pastes positioning (“Nike India sells…”, “Duolingo sells…”) instead of thread-specific urgency. Drafts sometimes generic (“I've been deep in this problem while building Duolingo”). Mirage is stronger (pain-led). Research previews show better Reddit URLs than the scored `why_now` text. | `prompt_skill` (distribution skill) |
| **Notion canonicalization** | Session canonical is `notion.com` after `.so` redirect — correct for evidence; keep fixture domain `notion.so` as founder input. | ok / document |
| **Harness stopped before drafts/sequences** | Sales drafts count = 0 in these runs by design (safe stop after discover). Full outreach quality not yet scored E2E. | scope note |

### Identity / dossier (one-liners)

- **mirage:** browser personalization agent; power-user / userscript ICP; distribution-ready
- **argus:** forensic agent-pipeline observability; LangSmith/Langfuse competitors; **homonym pass**
- **cal:** scheduling infrastructure; open-source/API angle; industries over-broad into healthcare
- **nike-in:** India athletic retail D2C; marketing path; no consumer email invent
- **linear:** AI-era product/eng system; strong eng/product ICP language
- **browserbase:** browser-agent infra (not “just scraper”); GTM/automation ICP
- **notion:** AI workspace (docs/projects/agents); broad mixed-motion ICP
- **duolingo:** freemium language learning; marketing path; meta-grounded identity

### Sales discover counts

| Fixture | Accounts | With any email | Notes |
|---------|----------|----------------|-------|
| argus | 20 | 14 | Homonym stress — highest trust win |
| cal | 18 | 12 | Watch healthcare/education tilt |
| linear | 19 | 13 | Sensible SaaS/eng names (Vercel, PostHog, …) |
| browserbase | 20 | 12 | Strong AI/GTM names (Anthropic, Clay, Apollo, …) but inbox quality weak |
| notion | 19 | 15 | Highest email fill rate; still many non-buyer aliases |

### Marketing opportunity counts

| Fixture | Opps | Platforms | Notes |
|---------|------|-----------|-------|
| mirage | 3 | x, reddit, linkedin | Best of the three for pain-specific angles |
| nike-in | 3 | x, reddit, linkedin | Real Reddit India/sneaker thread in research; why_now text degraded |
| duolingo | 3 | x, reddit, linkedin | Real “Duolingo replacement” Reddit thread in research; drafts still generic |

### Suggested fix priority (before finishing supabase/arc)

1. **Tighten contact-find** — reject role accounts (`support@`/`press@`/single-letter locals) or mark `email_verification` low enough that send stays blocked (already policy) and UI shows “not sendable.”
2. **Cal discover filter** — down-rank healthcare unless segment explicitly healthcare; match gold “no default healthcare-only.”
3. **Distribution opportunity writer** — force `why_now` + draft to cite the thread (title/quote), not restate company positioning.
4. **Dedupe / diversify discover** — reduce cross-fixture account echo (Figma/Canva/Ramp).
5. Then finish corpus (`supabase`, `arc`) and re-score.

## 7. Artifact index

| Fixture | Scorecard file | Snapshot key |
|---------|----------------|--------------|
| mirage | `mirage-2026-07-23T18-48-37-133Z.json` | session `689dc4e2-4aeb-451a-af28-9793c78a0efb` |
| argus | `argus-2026-07-24T04-34-13-281Z.json` | session `9aa793a9-1c97-4ea3-a8ac-23c08f2ee560` |
| cal | `cal-2026-07-24T04-54-27-858Z.json` | session `9f754c62-1c82-4173-956c-6791faca7d18` |
| nike-in | `nike-in-2026-07-24T05-02-56-531Z.json` | session `c638d07a-2ea6-40a2-a5c5-97f6fe5a0feb` |
| linear | `linear-2026-07-24T05-06-04-485Z.json` | session `bfeafc31-6943-40ae-a921-72accd8c93c9` |
| browserbase | `browserbase-2026-07-24T05-30-53-158Z.json` | session `f66d3768-78c0-493d-8f64-47173019f478` |
| notion | `notion-2026-07-24T05-41-26-761Z.json` | session `a75eff25-5f98-4c21-93d2-c74b459906f8` |
| duolingo | `duolingo-2026-07-24T06-25-49-167Z.json` | session `a0147299-0d05-498e-9aca-86f9d8ee250f` |

Machine-readable dump: [`web/evals/e2e/results/corpus-8-snapshot.json`](../../web/evals/e2e/results/corpus-8-snapshot.json) (gitignored with other results — regenerate via `npx tsx web/evals/e2e/collect-corpus-notes.ts`).

Duplicate path for evals folder: [`web/evals/e2e/CORPUS-8-OUTPUT-NOTES.md`](../../web/evals/e2e/CORPUS-8-OUTPUT-NOTES.md).

Related: [gold-standard-test-corpus.md](../gold-standard-test-corpus.md) · [GAPLOG.md](../../web/evals/e2e/GAPLOG.md) · [evaluation-and-iteration-plan.md](../evaluation-and-iteration-plan.md).
