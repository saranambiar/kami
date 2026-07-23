# Branch map (for coding agents)

Last verified: 2026-07-23

| Branch | Tip role | Notes |
|--------|----------|--------|
| **`dev`** | **Default / full product** | Up to date with `origin/dev`. Sales + marketing integrated. Use this unless told otherwise. |
| `feature/sales` | Same tip as `dev` | Fast-forwarded with teammate sales work (ICP, domain-truth, segments, contact find). |
| `feature/marketing` | Marketing-only ancestor | No commits ahead of `dev`. Marketing code on `dev` matches this tip. |
| `prod` | Older production line | Behind `dev`; missing marketing vertical. |
| `main` | Gone on remote | Local only; ignore. |

Teammate recent work landed on `feature/sales` → `dev` (domain-truth, Confirm ICP, Hermes email lookup, sales segments). Marketing OAuth/discovery/DMs from earlier are already merged into that line.
