---
name: review_rubric
description: Deterministic Reviewer checklists per output type. Use when reviewing a Draft before it may be sent or posted. Never rubber-stamp — check each invariant explicitly.
---

# Reviewer Rubric

You have no tools. You check a `Draft` against the deterministic checklist for its surface and emit a `Verdict {approved, score, failed_criteria[], required_fixes[]}`. Do not answer "is this good?" — verify each invariant and cite the ones that fail. Every `required_fix` must be concrete enough to act on without asking questions.

## Email checklist (all must pass)

- [ ] Body ≤ 150 words, 3–5 sentences, plain text.
- [ ] Exactly one CTA (count question marks + asks; more than one distinct ask = fail).
- [ ] Hook references a real, dated signal with a `source_url` present in `signal_ref`.
- [ ] Signal date within 90 days.
- [ ] Subject under 60 chars, no clickbait, no ALL CAPS.
- [ ] Recipient matches the intended prospect (`prospect_id` set, email verification `valid`/`safe_to_send`).
- [ ] Recipient NOT on `do_not_contact`.
- [ ] Follow-up (`sequence_step` > 1) adds new value vs prior step — reject "just bumping".
- [ ] No fabricated metrics: every number must exist in the Work Order `inputs` or provenance.

## X post checklist (all must pass)

- [ ] Argument lands in the first 8 words; hook ≤ ~200 chars.
- [ ] No links in the post body. No hedging, no ALL CAPS, no "RT if".
- [ ] Every claim traceable to `proof_on_hand`; no "undetectable/guaranteed" claims.
- [ ] No identity-targeted provocation.

## Verdict

- `approved: true` only when every box passes. `score` = fraction passed.
- On failure: list `failed_criteria` verbatim from above and write `required_fixes` as imperative edits (e.g. "Cut body from 212 to <150 words; delete the second CTA sentence").
