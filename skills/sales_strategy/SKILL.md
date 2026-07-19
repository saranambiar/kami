---
name: sales_strategy
description: Propose 1–2 sales motions, tier structure, channel mix, risks, and approval boundaries from a campaign brief. Use when creating or revising a SalesPlan.
---

# Sales Strategy Planning

## Procedure

1. Read campaign config: offer, ICP, geo, exclusions, deal range, approved claims, caps, allowed channels, autonomy policy.
2. Classify the primary goal: book meetings vs drive pipeline vs re-engage dormant accounts.
3. Propose **1–2 motions** (e.g. signal_outreach + x_dm) with rationale tied to ICP and deal size.
4. Define **3 tiers**:
   - Tier 1: highest fit + recent intent signal; buying-group mapping; manual approval before send
   - Tier 2: good fit, moderate signals; reviewer-gated sequences
   - Tier 3: broad fit; lower touch, capped volume
5. Write **channel_rationale** — why email primary, when X is additive (never bulk X).
6. List **risks** (deliverability, thin evidence, long sales cycle) and **prerequisites** (sender DNS, approved claims locked).
7. Estimate weekly activity: accounts researched, contacts, sends, followups.
8. Set **approval_scope**: always include `first_send` if policy requires; add `x_dm`, `calendar_invite`, `sequence_activation` as applicable.

## Output

Return a `SalesPlan` JSON object with `status: "draft"`. Never include prose-only plans.

## Hard rules

- Motions must use only channels in `allowed_channels`
- Do not promise reply rates or revenue without cohort evidence
- Revise plans increment `version`; never overwrite approved plans in place
