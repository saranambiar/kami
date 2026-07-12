---
name: handoff
description: Compact the current conversation into a single, detailed handoff message — everything that happened, why it happened, and what's left — output in a code block so it can be copy-pasted into a fresh agent session. Use when hitting context limits, switching focus, ending a work session, or partitioning a task across fresh contexts.
disable-model-invocation: true
---

# Handoff

Write a complete handoff that lets a fresh agent — with zero memory of this session — continue the work without re-asking, re-discovering, or repeating mistakes.

Output the entire handoff as a **single fenced code block** in the chat so the user can copy it in one click. Also save a copy to a file (see "File Output").

## Core Principles

1. **State, not instructions.** Describe what *is true*, not what the next agent *should do*. Write "Auth endpoint is implemented; logout is not yet started" — never "Implement logout next." The fresh agent decides actions; you give it ground truth.
2. **Reference, don't duplicate.** Do not paste content already captured in other artifacts (PRDs, plans, ADRs, issues, commits, diffs, design docs). Point to them by path or URL. Handoffs that re-embed everything become bloated and stale.
3. **Capture the "why".** Decisions and rejected approaches are the most valuable and least recoverable information. Code shows *what*; only you remember *why* and *what failed*.
4. **Trust nothing blindly.** Frame all claims as context to verify against the actual code, not facts to accept.
5. **Redact secrets.** Strip API keys, tokens, passwords, and PII. Reference where credentials live (e.g. ".env.local, not committed") — never their values.
6. **Be ruthless.** Every line must be something the next agent cannot trivially get by reading the code or project config. Cut anything obvious, redundant, or explanatory.

## Procedure

1. If a project config file exists (CLAUDE.md / AGENTS.md / equivalent), read it first. Do **not** restate anything already covered there — the handoff is session-specific only.
2. If a prior handoff file already exists, read it and update rather than starting from scratch.
3. If the user passed arguments, treat them as the focus for the next session and tailor the handoff toward that goal.
4. Fill in every section of the template below. Omit a section only if it is genuinely empty (e.g. no blockers) — mark it `None`.
5. Output the filled template inside one fenced code block in the chat.
6. Save the same content to the file path described below and tell the user that path.

## Output Format

Output exactly this, inside a single fenced code block:

```
# HANDOFF: <short title of the work>
Generated: <timestamp> · Session focus: <one line>

## 1. Goal
<What we are ultimately trying to accomplish. 1–3 sentences. The "north star" so the next agent never loses the plot.>

## 2. Why This Matters / Background
<The motivation and constraints driving this work. Why it's being done now, who it's for, any hard requirements. Skip anything already in the project config.>

## 3. Current State
<Factual status of the work. What is DONE, what is PARTIAL, what is NOT STARTED.
Phrase as status, not actions:
- DONE: OAuth login flow (Google provider), tests passing locally
- PARTIAL: Session persistence — store wired up, refresh logic missing
- NOT STARTED: Logout endpoint>

## 4. Key Decisions (and why)
<The choices made and the reasoning. This is the highest-value section.
- Chose passport.js over custom OAuth — more community support, less surface area
- Stored tokens in httpOnly cookies, not localStorage — XSS mitigation>

## 5. Traps & Dead Ends
<Approaches already tried that FAILED, and things the next agent will be tempted to do wrong. Saves the next agent from repeating expensive mistakes.
- Tried mocking the DB in integration tests — flaky, abandoned for a test container
- Do NOT bump the SDK to v3 — it breaks the streaming API we rely on>

## 6. Relevant Files & Pointers
<Files that matter, with line ranges and WHAT specifically is there — not just what the file is. Reference external artifacts instead of pasting them.
- src/auth/oauth.ts:L40-L88 — provider config + token exchange
- docs/adr/0007-auth.md — full rationale (do not duplicate here)
- PR #142 — in-progress session work
- Issue #150 — logout requirements>

## 7. Open Work (status, with dependencies)
<What remains, described as state and ordering — NOT as a command list.
- Logout endpoint is not yet implemented
- Session persistence depends on the logout endpoint existing first
- E2E auth tests are blocked until both above are complete>

---
## Prompt for the Fresh Agent
<A short ready-to-paste prompt giving background context. Use declarative statements
("X is complete", "Y has not been started"), never imperatives. End with exactly:>

Before responding, read every file listed under "Relevant Files & Pointers" above.
Do not summarize, paraphrase, or claim you already have context — actually read each
file. Treat every claim in this handoff as context to verify against the code, not
facts to trust blindly. Then wait for my instructions before taking any action.
```

## File Output

Save the handoff to a temporary location outside the working tree so it does not pollute the repo:

- Preferred: the OS temp directory, e.g. `$TMPDIR/handoff-<random-8-chars>.md` (macOS/Linux) or the system temp dir equivalent.
- If the user prefers an in-repo record, save to `HANDOFF.md` in the project root instead.

After saving, tell the user the absolute path. The user can then start a fresh session with just:

```
Read the file <absolute-path> to get the context, then wait for instructions.
```
