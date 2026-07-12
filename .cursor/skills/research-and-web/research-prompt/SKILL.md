---
name: research-prompt
description: Write a single-paragraph Deep Research prompt to hand to a human researcher (or a deep-research AI). Use when the user wants a research brief, a "deep research prompt", a one-paragraph task for a researcher, or asks "what should our researcher look for". Produces ONE tight paragraph with full context, numbered sub-questions, and per-finding output format.
---

# Research Prompt

Goal: turn a vague research need into ONE self-contained paragraph that a researcher with zero prior knowledge of the project can act on with zero back-and-forth.

## Rules

- **One paragraph.** No headers, no bullet list in the deliverable.
- **Prompt the job, not the topic.** Give search handles (timeframe, ranking, source type, decision logic) — not just a subject.
- **Assume zero prior knowledge.** Write for a researcher who has never heard of the project. Open by explaining, in plain English, what the project/product is, why it exists, and the current situation — so they understand what's going on, what we need, and why we need it.
- **Lead with the goal + decision.** Right after that explainer, state the single question the research must answer and the decision/use it informs.
- **Embed all context.** Names, dates, product, prior known facts, constraints. The researcher must not need to ask anything or guess.
- **Number the sub-questions inline** (1, 2, 3…) so coverage is explicit. Keep to 3–6. One mission per prompt — don't cram unrelated questions.
- **State constraints.** What to include, what to avoid (e.g. "only non-Chinese competitors", "no marketing fluff").
- **Source hierarchy.** Prefer primary sources (official docs, GitHub, papers, filings, changelogs); forums/X/Reddit are weak signal only, never factual proof.
- **Contradiction handling.** If sources conflict, separate confirmed facts / inference / unresolved uncertainty — don't force fake consensus. Flag low-confidence claims for verification.
- **Completion bar (define "done").** Don't stop at the first plausible answer. Corroborate each key claim with multiple independent primary sources where they exist; where sources are scarce, say so explicitly instead of padding. Keep going until every numbered sub-question is covered to this bar.
- **Gap round before finishing.** Require a final self-critique pass: list gaps, contradictions, and any single-source claims, then run another round of searches to close them — repeat until clean.
- **Constrain output hard, method loosely.** Be strict on the deliverable; leave the search path flexible so the researcher can explore.
- **Demand a fixed output per finding:** source link + specific claim + one-line "why it matters / why a viewer should care".
- Verifiable, citable facts only. No opinions.
- **Last sentence:** instruct them to output everything into a single detailed markdown file.

## Process

1. Pull context from the relevant project files / conversation (dates, names, known facts, audience, end use), and write a 1–2 sentence plain-English explainer of what the project is and why it exists for a reader who knows nothing.
2. Identify the ONE question the research answers.
3. Draft 3–6 numbered sub-questions that fully cover it.
4. Add include/avoid constraints + the per-finding output format.
5. Compress to one clean paragraph. Cut filler.

## Template

> [For a reader with zero prior knowledge: in 1–2 plain-English sentences, what the project/product is, why it exists, and the current situation.] Research [TOPIC + key identifying facts] to answer one question: [THE QUESTION] — for [DECISION / END USE]. Find: (1) …; (2) …; (3) …; (4) …. [Constraints: include X, avoid Y.] Prefer primary sources; treat forums/social as weak signal only; if sources conflict, separate fact from inference and flag what needs verification. Don't stop at the first plausible answer: corroborate each key claim with multiple independent primary sources where they exist (and say so explicitly where they don't), continuing until every numbered question is covered to that bar. Before finishing, do a self-critique pass — list gaps, contradictions, and any single-source claims, then run another round of searches to close them, repeating until clean. For each point, give the source link, the specific claim, and a one-line "why it matters". No marketing fluff — verifiable, citable facts only. Output everything into a single detailed markdown file.

## Executing the prompt

To run the finished prompt with an AI researcher, execute it via DeepAPI `POST /v1/research/deep` — follow the `deep-research` skill.
