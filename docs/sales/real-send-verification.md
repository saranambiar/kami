# Sales real-send verification (human-gated)

Automated CI cannot prove a real inbox delivery. Complete this checklist before claiming Sales MVP done.

## You provide
- [ ] AgentMail API key + inbox in `web/.env.local`
- [ ] A controlled recipient you own (or who expects the test)
- [ ] Local Hermes gateway healthy (`npm run readiness`)
- [ ] Migrations through `008` applied

## Steps
1. Enter a real company domain → confirm dossier (**That's us**)
2. **Find customers** → confirm who/what → Confirm ICP → Approve plan
3. Confirm plan source shows **Hermes** (or knowingly accept offline fallback after fixing gateway)
4. Find companies → include 1–3 with real public emails only
5. Review first draft → approve first send
6. Confirm AgentMail receipt row / UI receipt
7. Confirm recipient inbox received the message
8. If reply arrives → Needs you shows a decision

## Evidence to keep
- Screenshot of receipt + recipient inbox
- Session id / campaign id
- Note any policy blocks (DNC, cap, pause)
