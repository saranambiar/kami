# Compliance, Approval, and Autonomy Policy

## Execution principle

Hermes proposes and coordinates. The application server enforces approval, suppression, compliance, rate, and provider checks before executing any privileged action.

## Autonomy tiers

### Autonomous

- Research, scoring, and evidence organization.
- Draft generation.
- Reply classification.
- Task and notification creation.
- Calendar availability lookup.

### Approval-gated

- First send for a campaign, sender identity, or channel.
- Activating a new sequence or recipient cohort.
- Every X DM in MVP.
- Sending a draft that is outside an already approved bounded sequence.
- Creating a Calendar invitation.
- Claims, offers, discounts, or content not already approved in campaign policy.

### Always escalate

- Unsubscribe, complaint, negative sentiment, or suspected spam.
- Price, contract, legal, security, procurement, or custom-deliverable request.
- Strong purchase intent and meetings with missing details.
- Unclear consent or channel eligibility.
- Any action beyond campaign cap or spending budget.

### Never automate

- Fake identity, false relationship, fabricated signal, fabricated metric, or fabricated availability.
- Sending to a DNC/suppressed record.
- Repeated unanswered touches beyond approved policy.
- Circumventing provider limits, consent, or platform terms.

## Server-side send gate

Before AgentMail/X execution, the server must verify:

1. The user/workspace/campaign scope is valid.
2. A current approval policy permits the channel/action.
3. Target/contact and draft are approved for the applicable scope.
4. A reviewer verdict is current and approved.
5. DNC/suppression, bounce, opt-out, and duplicate-contact checks pass.
6. Sender identity, daily cap, and sequence eligibility pass.
7. Required compliance/footer/opt-out content exists.
8. Provider result is persisted as a receipt before the activity becomes `sent`.

## Channel guidance

- **Email MVP:** only through the existing AgentMail path after sender readiness: SPF/DKIM/DMARC, truthful identity, physical address, working opt-out, and suppression process.
- **X MVP:** individually reviewed/researched interactions only. No bulk, aggressive, or identical unsolicited DMs.
- **SMS/WhatsApp:** not outbound-MVP channels. Add only for explicitly opted-in lifecycle/inbound use cases after A2P/WhatsApp template/consent infrastructure exists.
- **LinkedIn:** deferred; automation rules and access constraints require a separate policy/provider review.

## External references

- Gmail sender guidelines: https://support.google.com/mail/answer/81126
- CAN-SPAM: https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
- Twilio A2P 10DLC: https://www.twilio.com/docs/messaging/compliance/a2p-10dlc
- WhatsApp opt-in: https://developers.facebook.com/docs/whatsapp/overview/getting-opt-in/
