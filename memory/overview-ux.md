# Overview UX + dossier correction (2026-07-23)

- Confirm overview: full-width main column + Ask Kami right rail (`KamiGuide` Cursor-style toggle).
- Intelligence open by default (`IntelPanel` `defaultAllOpen`); no closed “More” disclosure on confirm.
- `DossierConfirm`: edit all visible fields → `PATCH /api/sessions/:id` `type: "dossier"`; Regenerate → `POST /api/dossier/revise` (Hermes + `validateDossier` + persist).
- Parent `page.tsx` `onDossierUpdated={setDossier}` so Sales/Marketing/Ask Kami share corrected dossier.
- Sales Advanced MVP: exclusions, daily send cap, require first-send approval; honest “plan follow-ups” label; hide deal min/max + sender identity UI.
- PLG/D2C Find: “Find people to reach” + Create distribution CTA; never invent consumer emails.
