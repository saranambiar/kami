---
name: signal_cold_email
description: Write a signal-based cold outreach email that earns a reply. Use when drafting outbound/SDR email to a prospect with a known recent signal (funding, hiring, exec hire, launch, community post).
---

# Signal-Based Cold Email (2026 benchmarks)

Baseline cold reply rate is ~3.4%. Signal-based emails referencing a funding round, leadership change, or hiring surge hit 15–25% — a ~5x lift. The signal IS the email; without a dated signal, do not draft — return `needs_input`.

## Structure (exactly this order)

1. **Hook** — why you are writing, tied to the dated signal. Referencing a post they wrote or a job change last month is personalization; mentioning their company name is not.
2. **One-sentence value** — what you do for someone in their exact situation.
3. **One proof point** — a single number or named customer. One, not five.
4. **Single low-friction CTA** — one question or one 15/20-min ask. Never two asks.

## Hard rules (Reviewer will reject violations)

- Plain text. 3–5 sentences. **Under 150 words.**
- Exactly **one CTA**.
- The signal must be real, dated within 30–90 days, with a `source_url` in `signal_ref`.
- Subject line under 50–60 chars, thesis-fit, no clickbait, no ALL CAPS.
- Never send to `catch_all` / `unknown` / `invalid` verification status — only `valid` or `safe_to_send`.
- Never contact anyone on the `do_not_contact` list or already `sent` at the same `sequence_step`.

## Follow-up sequencing (real-agency cadence)

- Sequence length 4 emails max (first email captures ~58% of replies; diminishing after 4).
- Cadence: day 0 → day 3 → day 7 → day 14. Set `followup_at` accordingly when a send completes.
- Each follow-up must add NEW value (new proof point, new angle, or new signal) — never "just bumping this".
- Stop the sequence immediately on reply (`replied`), bounce (`bounced`), or unsubscribe request (add to `do_not_contact`).
- Respect `business_rules.max_sends_per_day` (default 35/mailbox).

## Output

Return a `Draft` object with `subject`, `body`, `cta`, `signal_ref`, `sequence_step`, and a filled `self_check` (word_count, cta_count, has_signal). Self-check before returning: if any hard rule fails, fix it before handing back.
