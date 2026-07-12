---
name: business_rules
description: Standing business rules for all outreach and content. Injected into every Work Order. These override any playbook or specialist judgment.
---

# Business Rules (layer 3 memory — survives every handoff)

## Sending

- Max 35 sends per mailbox per day. Hard stop, no exceptions.
- Max sequence length: 4 emails per prospect. Stop on reply, bounce, or unsubscribe.
- Only send to verification status `valid` or `safe_to_send`. Never `catch_all`/`unknown`/`invalid`.
- Never contact anyone (email or domain) on the `do_not_contact` list. Check BEFORE drafting, again BEFORE sending.
- An unsubscribe or "not interested" reply → add to `do_not_contact` immediately.

## Investor outreach

- Never BCC multiple investors. Never email multiple partners at one firm.
- Follow up once, max twice. No deck attachments (link only). Never ask for an NDA.

## Tone & truth

- No metric may appear in any draft unless it exists in the Work Order inputs or provenance.
- No "undetectable", "guaranteed", or unverifiable superlatives.
- Provocation must stay congruent with the product's core value; never target identity.

## Execution gate

- Real send/post tools fire only after: Reviewer `approved: true` → verification passed → suppression checked → Receipt logged with the provider message id. A 200 response is not proof; the Receipt is.
