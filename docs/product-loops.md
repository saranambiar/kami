# Kami product loops

Source of truth for the founder-facing Domain → Overview → Sales journey. See [plans/sales-founder-ux.md](plans/sales-founder-ux.md) for implementation detail.

## Philosophy

**Domain-first → recommend → confirm → act → escalate.**

Kami never starts Sales with a blank SDR brief. The Overview dossier pre-fills who/what/how many; the founder confirms in plain language, approves a plan, then explicitly finds companies before any send.

## Core product loop

```text
1. START      Domain + goals + stage
2. UNDERSTAND Overview dossier
3. CHOOSE     Run outbound → Sales
4. CONFIRM    NL: who / what / how many (prefilled)
5. PLAN       Plain-English next steps → Approve
6. FIND       Companies + why → Include/exclude → Continue
7. CONTACT    Ensure email on included companies (add / test inbox)
8. DRAFT      Emails appear
9. SEND       Hybrid review/send (1–3, then batch)
10. WATCH     Needs you (replies, meetings)
```

## Feature loops

| Loop | Trigger | User | Kami | Success feel |
|------|---------|------|------|----------------|
| Understand | Domain submit | Wait / skim | Linkup + Hermes dossier | “That’s us” |
| Enter Sales | Run outbound | Click CTA | Prefill from dossier | “Not a blank form” |
| Confirm | NL screen | Edit sentences / Continue | Map NL → SalesCampaignConfig | “I steered who/what” |
| Plan | After confirm | Approve | Synthesize plan (plain English) | “I know what happens next” |
| Find | Find companies | Include/exclude | Discover + scores + sources | “I know why these” |
| Contact | Before draft/send | Add email if missing | Persist sales_contacts | “We can actually email someone” |
| Draft | After include + email | Open Review emails | Sequences + touchpoints | “Drafts ready” |
| Trust send | Drafts ready | Review 1–3, then batch | Reviewer + AgentMail + receipt | Real send |
| Convert | Reply / meeting | Decide | Classify, escalate, calendar | Meeting path |
| Safety | Anytime | Kill switch / Advanced | Pause, DNC, caps | No surprises |

## UX rules (non-negotiable)

- One primary Hanko-red CTA per screen.
- Progressive disclosure: Find → Review emails → Needs you first; Pipeline / Meetings / Tasks under **More** after first send.
- Never invent contact emails.
- Discovery only on explicit **Find companies** click after plan approve.
- Marketing tab is separate; Sales consumes Overview dossier only.

## References

- [Sales vertical docs](sales/README.md)
- [Founder UX RCA & remediation](sales/founder-ux-rca.md) — known gaps between this intent and live Plan/Find behavior
- [DESIGN.md](../DESIGN.md)
- [AGENTS.md](../AGENTS.md) — Product UX principles
