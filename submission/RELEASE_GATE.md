# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS: 6/6 local |
| Syntax and domain | `npm run check` | PASS: syntax clean, 6/6 local |
| Authority model | Manifest equals decision; evidence excludes challenge values | PASS local |
| Trust Continuity native path | Nine calls and `HUMAN_HANDOFF_PENDING` proof | PASS: 30/30 local |
| Trust Continuity prompts | Cases 11 and 12 pass three times each | BLOCKED: candidate is local only |
| Prompt behavior | Ten fresh public prompt cases on release `ee519af` | PASS: 10/10 prior release |
| Production native soak | Thirty fresh top-level protocol runs on release `ee519af` | PASS: 30/30 prior release |
| Agent stop boundary | No confirmation tool; agent waits at door 03 | PASS live |
| Final human receipt | Person completes door 03 on the exact deployed build | BLOCKED: human click pending |
| Safety counters | One safe recovery; zero unauthorized attempts | PASS live at agent boundary |
| Public source | GitHub default branch is public | PASS |
| Public mission | Trust Continuity candidate is deployed and exposes reasoned tools | BLOCKED: candidate is local only |
| Public native verifier | Decision proof, nine calls, and stop boundary | BLOCKED: candidate is local only |
| Deployment | Trust Continuity commit is live and identified | BLOCKED: candidate is not committed or deployed |
| Demo video | Checked local MP4 under three minutes | BLOCKED: capture inventory missing |
| Submission | Video URL added and Devpost submitted | HOLD: external publication gate |
