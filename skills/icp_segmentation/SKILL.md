---
name: icp_segmentation
description: Derive distinct outbound ICP segments (B2B sales-assisted vs PLG self-serve) from the seller's validated domain positioning. Use before prospecting or when confirming who Kami will sell to.
---

# ICP Segmentation (outbound)

Produce **3–5 distinct segments** for **this seller's actual product** (canonical domain + validated positioning). Do not inject a hardcoded vertical (healthcare, scheduling, etc.).

## Method

1. Lock identity to the **submitted canonical domain**. Ignore same-name companies in other industries.
2. Read positioning + all ICP buckets + competitors (not just bucket[0]).
3. Split by **motion**:
   - `b2b_sales_assisted` — teams; email a champion + economic buyer.
   - `plg_self_serve` — individuals; personalize from public signals; **never invent emails**.
4. Technographic + firmographic filters must match **this** product category from evidence.
5. B2B segments: real `candidate_companies` with domains (not news/listicles, not the seller domain).
6. PLG segments: `example_user_personas` with hooks — not fake addresses.
7. Set `target_count` budget per segment.

## Hard rules

- Never invent contact emails.
- Never treat URL shorteners, job boards, or "Top N startups" pages as companies.
- Never invent biotech/healthcare/scheduling/Calendly narratives unless first-party evidence says so.
- Prioritize by **Fit × Intent** later (separate axes; decay intent after ~2 weeks).
- Wait for founder **confirmation** before discovery.

## Output

Fenced JSON matching Kami's `SalesSegment` shape.
