#!/bin/bash
# Test the outreach engine end-to-end against the local Hermes gateway.
# Usage: ./run_dry_test.sh "recipient@email.com"
set -e
RECIPIENT="${1:-nameerror91@gmail.com}"
KEY=$(grep '^API_SERVER_KEY:' ~/.hermes/config.yaml | awk '{print $2}')
SESSION_ID="kami-test-$(date +%s)"

PROMPT=$(cat <<EOF
You are the MANAGER of a GTM outreach agency. Read agents/manager.md, skills/planning/SKILL.md, skills/review_rubric/SKILL.md, skills/business_rules/SKILL.md, skills/signal_cold_email/SKILL.md in the current directory first.

DRY RUN: no send tools exist. Stop after Reviewer approves; log a stub Receipt with provider_message_id "DRYRUN-NOT-SENT".

Campaign brief:
{"campaign_id":"camp_test","company":{"name":"Kami","url":"kami.example","one_liner":"AI GTM agency"},"icp":{"titles":["Head of Growth"],"industries":["SaaS"],"size":"10-50","geo":"US"},"goal":"book_meetings","targets":["seed-stage SaaS heads of growth"],"tone":"direct, warm","constraints":{"surfaces":["email"],"do_not_contact":["banned.com"],"deadline":"2026-07-12"}}

Prospect (from Research):
{"prospect_id":"p_test","campaign_id":"camp_test","name":"Test Target","title":"Head of Growth","company":"Acme SaaS","email":"$RECIPIENT","email_verification":"valid","status":"researched","signals":[{"type":"hiring","detail":"posted 3 growth roles","date":"2026-06-20","source_url":"https://example.com/jobs"}],"sequence_step":1}

Do this using delegate_task for each specialist (never draft/review yourself):
1. Emit your typed plan.
2. delegate_task OUTREACH (agents/outreach.md) with the WorkOrder.
3. delegate_task REVIEWER (agents/reviewer.md) with the Draft, strict review.
4. If rejected, bounce once with required_fixes, re-review.
5. On approval: run python3 state/state.py suppress-check $RECIPIENT; append final Draft, Verdict, stub Receipt.
6. Print a final summary: plan, review rounds, verdict, receipt.

Note: delegate_task is background-only here. If the specialist result hasn't returned yet, say PENDING and stop.
EOF
)

echo "Session: $SESSION_ID"
echo "Sending brief..."
curl -s -m 120 http://127.0.0.1:8642/v1/chat/completions \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -H "X-Hermes-Session-Id: $SESSION_ID" \
  -d "$(python3 -c "import json,sys; print(json.dumps({'model':'gpt-5.4','messages':[{'role':'user','content': open('/dev/stdin').read()}]}))" <<< "$PROMPT")" \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['choices'][0]['message']['content'])"

echo ""
echo "If it says PENDING, wait ~30s and re-poll with:"
echo "curl -s http://127.0.0.1:8642/v1/chat/completions -H \"Authorization: Bearer \$KEY\" -H \"Content-Type: application/json\" -H \"X-Hermes-Session-Id: $SESSION_ID\" -d '{\"model\":\"gpt-5.4\",\"messages\":[{\"role\":\"user\",\"content\":\"Check pending delegation results and continue the flow.\"}]}'"
