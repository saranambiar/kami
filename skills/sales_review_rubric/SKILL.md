---
name: sales_review_rubric
description: Review sales drafts (email/X) for factual basis, fit, claims, compliance, and caps before send. Use when Reviewer evaluates outreach drafts.
---

# Sales Review Rubric

## Procedure

1. Load draft, target contact/account, signals, approved claims, suppression state, prior touchpoints.
2. Score each criterion (pass/fail):
   - **Factual basis:** hook ties to real dated signal with source_url
   - **Recipient fit:** title/industry matches ICP and tier
   - **One CTA:** exactly one ask in body
   - **Claims:** only uses `approved_claims`; no invented metrics or logos
   - **Compliance:** plain text, under 150 words (email), opt-out footer if required
   - **Suppression:** recipient not on DNC/suppression lists
   - **Duplicate:** not already sent same sequence step
   - **Caps:** within daily send cap and sequence length
3. Verdict: `approved`, `revise` (with concrete fixes), or `rejected`.
4. X DM additional checks: individualized, not bulk template, under platform norms.

## Output

`Verdict`-compatible JSON: `{ approved, score, failed_criteria, required_fixes }`.

## Hard rules

- Reject any draft without verifiable `signal_ref` for cold email (unless follow-up step 2+ with new value)
- Reject catch_all/unknown/invalid email verification
- Max 2 revise rounds — then escalate to human
