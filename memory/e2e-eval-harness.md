# E2E evaluation harness

- **Path:** `web/evals/e2e/` — API-scripted founder path for the 10-company gold corpus
- **Command:** `npm run eval:e2e` (root or `web/`); offline units stay `npm run eval:sales`
- **Dossier:** `POST /api/dossier/generate` (headless; logs `dossier_research` / `dossier_persist`)
- **Safety:** stops after Sales discover / Marketing opportunity research — no send/publish
- **Artifacts:** gitignored `results/`; committed `GAPLOG.md`
- **Docs:** [evaluation-and-iteration-plan.md](../docs/evaluation-and-iteration-plan.md), [gold-standard-test-corpus.md](../docs/gold-standard-test-corpus.md), [evals README](../web/evals/e2e/README.md)
- **Needs for live runs:** Hermes + Supabase; migrations through `010`; Marketing needs `009`
