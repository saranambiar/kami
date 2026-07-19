---
name: signal_research
description: Find dated, sourced buying signals for target accounts. Use when researching accounts before outreach or scoring.
---

# Signal Research

## Procedure

1. Receive account list with domain/name and tier from query plan.
2. Search for signals in priority order: funding, hiring surge, exec hire, product launch, community/post activity.
3. For each signal found, capture:
   - `provider` (e.g. crunchbase, linkedin, company blog, news)
   - `signal_type`, `detail`, `source_url`
   - `observed_at` (ISO date of the event, not today)
   - `confidence` 0–1 and `evidence_text` (quote or summary)
4. Skip accounts with zero verifiable signals — still save account, note "no_signal" in notes.
5. Return batch via accounts API; never hold signals only in agent memory.

## Output

`AccountSignal` records linked to `account_id`.

## Hard rules

- **Never fabricate** funding, hires, launches, or posts
- Signals older than 90 days: lower confidence, do not use as email hook
- Every signal must have a reachable `source_url`
- If provider blocks access, return `needs_input` with specific missing source
