# Domain-truth pipeline

Submitted domain is authoritative from Landing → Overview → Sales.

## Flow

1. `POST /api/domain/validate` → `web/lib/domainIdentity.ts` (exact host resolve + extract)
2. `POST /api/research` with validated identity → `researchDomainIdentity` (first-party mandatory; `site:` searches)
3. Persist `canonical_domain`, `domain_check`, `research_snapshot` on `agent_sessions`
4. Hermes onboarding compiles evidence only; `validateDossier` gates Overview persistence
5. Sales inherits dossier + goals; no Calendly/healthcare defaults
6. Segments confirm (editable candidates) → Hermes strategist plan → signal-backed Find

## Key files

- `web/lib/domainIdentity.ts`, `dossierValidation.ts`, `linkup.ts`
- `web/lib/salesStrategy.ts`, `salesSetupIntegrity.ts`, `salesResearch.ts`
- Migrations: `007_sales_segments.sql`, `008_domain_truth.sql` (repo numbering; teammate owns `005_connected_accounts_session.sql`)

## Acceptance

- Bad domain → stay on Landing, no session/Hermes
- `arguslabs.in` → agent observability, not biomedical
- Setup offer/ICP change → segments invalidated
- Re-Find → discovery_run_id + deduped signals/scores
