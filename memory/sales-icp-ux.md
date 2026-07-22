# Sales ICP confirm UX

## Problem (logged 2026-07-22)
Confirm ICP UI was out of line with the rest of Kami (nested border boxes, cramped mono inputs, PLG validation with no editable fields, busy state = `…` only).

## Fix direction
- Match [SalesSetup](../web/components/SalesSetup.tsx): `sales-panel`, `form-line`, `sales-textarea`, crease separators, hanko primary CTA.
- PLG: editable example-user rows (+ auto-seed from `target_persona`).
- Busy: reuse `SalesBusyOverlay` with Hermes-oriented stages on load/refresh.
- CSS: `.sales-segment*` in `web/app/globals.css`.

## Still open
- Streaming Hermes “thinking” tokens for segment derive (needs SSE / stream path — not just overlay stages).
