---
name: icp_account_tiering
description: Map discovered accounts into Tier 1/2/3 based on ICP fit, signals, and deal potential. Use after research, before qualification scoring.
---

# ICP Account Tiering

## Procedure

1. Load approved plan tier definitions and campaign ICP (titles, industries, size, geo).
2. For each account, check hard filters: geo match, industry match, size band, exclusion list.
3. Assign provisional tier:
   - **Tier 1:** ICP bullseye + dated intent signal (funding, hiring, exec change) within 60 days
   - **Tier 2:** ICP match + weaker or older signal, or strong fit without signal
   - **Tier 3:** partial ICP match or geographic stretch
4. Flag `invalid` if clearly wrong industry, size, or geo — do not tier for outreach.
5. Record tier rationale in account `notes` with signal IDs referenced.

## Output

Updated `SalesAccount` records with `tier` and `pipeline_stage: researching`.

## Hard rules

- Tier 1 ≤ 30% of `target_quantity`
- No Tier 1 without at least one verified `AccountSignal` or strong firmographic match
- Excluded domains/companies → skip entirely, do not tier
