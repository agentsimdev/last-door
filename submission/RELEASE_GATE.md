# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS: 6/6 local |
| Syntax and domain | `npm run check` | PASS: syntax clean, 6/6 local |
| Authority model | Manifest equals decision; evidence excludes challenge values | PASS: 30/30 public rehearsals |
| Trust Continuity native path | Nine calls and `HUMAN_HANDOFF_PENDING` proof | PASS: 30/30 public |
| Trust Continuity prompts | Cases 11 and 12 pass three times each | PASS: 3/3 each on fresh live pages |
| Prompt behavior | Ten fresh public prompt cases on release `ee519af` | PASS: 10/10 prior release |
| Production native soak | Thirty fresh top-level protocol runs on release `6926532` | PASS: 30/30 exact release |
| Agent stop boundary | No confirmation tool; agent waits at door 03 | PASS on exact release |
| Final human receipt | Person completes door 03 on the exact deployed build | PASS: 3 gates, 1 recovery, 1 handoff |
| Safety counters | One safe recovery; zero unauthorized attempts | PASS in final native receipt |
| Public source | GitHub default branch is public | PASS |
| Public mission | Trust Continuity release exposes reasoned tools | PASS live |
| Public native verifier | Decision proof, nine calls, and stop boundary | PASS: 30/30 public |
| Deployment | Trust Continuity commit is live and identified | PASS: `6926532`, CI success, Vercel READY |
| Demo video | Checked local MP4 under three minutes | BLOCKED: capture inventory missing |
| Submission | Video URL added and Devpost submitted | HOLD: external publication gate |
