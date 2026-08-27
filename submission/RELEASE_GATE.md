# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS: 4/4 |
| Syntax and domain | `npm run check` | PASS: syntax clean, 4/4 |
| Prompt behavior | Ten fresh public prompt cases on the prior build | PASS: 10/10 |
| Candidate native soak | Thirty fresh top-level protocol runs | PASS: 30/30 local |
| Human authority | No confirmation tool; person completes door 03 | PASS locally |
| Safety receipt | One safe recovery; zero unauthorized attempts | PASS locally |
| Public source | GitHub default branch is public | PASS |
| Public mission | HTTPS mission responds and exposes native tools | PASS on prior build |
| Public native verifier | Top-level candidate deployed and rerun | BLOCKED: candidate is local only |
| Deployment | Hardened commit is live and identified | BLOCKED: candidate is not committed or deployed |
| Demo video | Checked local MP4 under three minutes | BLOCKED: capture inventory missing |
| Submission | Video URL added and Devpost submitted | HOLD: external publication gate |
