#!/usr/bin/env python3
"""Campaign state CLI — local JSON now, Convex later (same shape as contracts.ts CampaignState).

Usage:
  state.py read [collection]
  state.py append <collection> '<json>'
  state.py suppress-check <email>
  state.py suppress-add <email_or_domain>
"""
import json
import sys
from pathlib import Path

STATE_FILE = Path(__file__).parent / "campaign.json"

EMPTY = {
    "briefs": [], "work_orders": [], "results": [], "prospects": [],
    "drafts": [], "verdicts": [], "receipts": [],
    "do_not_contact": [],
    "business_rules": {"max_sends_per_day": 35, "max_sequence_steps": 4},
    "runs": [],
}


def load():
    if not STATE_FILE.exists():
        return dict(EMPTY)
    return json.loads(STATE_FILE.read_text())


def save(state):
    STATE_FILE.write_text(json.dumps(state, indent=2))


def suppressed(state, email):
    email = email.lower().strip()
    domain = email.split("@")[-1]
    dnc = [e.lower() for e in state["do_not_contact"]]
    return email in dnc or domain in dnc


def main(argv):
    cmd = argv[1] if len(argv) > 1 else "read"
    state = load()
    if cmd == "read":
        print(json.dumps(state.get(argv[2]) if len(argv) > 2 else state, indent=2))
    elif cmd == "append":
        collection, payload = argv[2], json.loads(argv[3])
        if collection not in state or not isinstance(state[collection], list):
            sys.exit(f"unknown collection: {collection}")
        state[collection].append(payload)
        save(state)
        print(f"ok: appended to {collection} (n={len(state[collection])})")
    elif cmd == "suppress-check":
        hit = suppressed(state, argv[2])
        print(json.dumps({"email": argv[2], "suppressed": hit}))
        sys.exit(1 if hit else 0)
    elif cmd == "suppress-add":
        entry = argv[2].lower().strip()
        if entry not in state["do_not_contact"]:
            state["do_not_contact"].append(entry)
            save(state)
        print(f"ok: {entry} suppressed")
    else:
        sys.exit(__doc__)


def demo():
    # self-check: suppression matches exact email and whole domain
    s = dict(EMPTY, do_not_contact=["blocked@example.com", "banned.com"])
    assert suppressed(s, "blocked@example.com")
    assert suppressed(s, "BLOCKED@example.com")
    assert suppressed(s, "anyone@banned.com")
    assert not suppressed(s, "ok@example.com")
    print("self-check ok")


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "demo":
        demo()
    else:
        main(sys.argv)
