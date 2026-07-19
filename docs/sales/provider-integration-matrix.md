# Provider and Integration Matrix

## Current implementation inventory

### Available foundation

- **Hermes gateway:** persistent session identity is forwarded by `web/app/api/chat/route.ts`; this is the manager execution harness.
- **Linkup:** `web/lib/linkup.ts` is the only current app-side research provider. It supports domain/product, competitor, and recent-news/funding/launch/hiring queries.
- **AgentMail:** existing send route, DNC check, receipt logging, and inbox reply monitoring are the primary real Sales execution path.
- **X:** OAuth posting and monitoring exist; Sales DMs must remain a separately validated, human-approved capability.
- **Supabase:** current persistence for sessions, dossiers, opportunities, contacts, outreach, follow-ups, and DNC.
- **Google Calendar:** Marketing branch contains a client/event-creation pattern that Sales can reuse after it is coupled to meeting state and policy checks.

### Referenced but not implemented

- Exa, Apollo, Clay, Firecrawl, Hunter/Reoon, HubSpot/Salesforce synchronization, Cal.com, automatic follow-up scheduling, provider webhooks, and formal enrichment/verification adapters.

## Adapter contract

All providers must sit behind server-side adapters. An adapter:

- accepts a scoped internal request;
- returns normalized data with provider name, external ID, raw receipt/reference, capture time, confidence/error;
- does not expose credentials to Hermes;
- writes execution/audit receipts;
- supports provider-specific rate limits, retries, and disablement.

## Provider decisions before implementation

1. Choose research/enrichment providers after evaluating data quality, terms, geography, cost, and lawful-use requirements.
2. Confirm AgentMail sending identity readiness and webhook/poll reliability.
3. Validate X API access, DM permissions, rate limits, and current automation rules before enabling any DM send route.
4. Choose calendar source of truth and availability method; do not create an event until invite data is confirmed.
5. Decide whether Kami remains CRM-of-record initially or synchronizes with HubSpot/Salesforce.

## Calendar requirements

- Persist provider event ID, organizer, attendees, timezone, selected slot, invitation delivery result, and later RSVP/cancellation state.
- Use `sendUpdates=all` when an invite should be delivered.
- Reference: https://developers.google.com/calendar/api/v3/reference/events/insert
