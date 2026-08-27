# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS: 4/4 |
| Syntax and domain | `npm run check` | PASS: syntax clean, 4/4 |
| Prompt behavior | Ten fresh public prompt cases on the prior build | PASS: 10/10 |
| Production native soak | Thirty fresh top-level protocol runs | PASS: 30/30 public |
| Agent stop boundary | No confirmation tool; agent waits at door 03 | PASS live |
| Final human receipt | Person completes door 03 on the exact deployed build | BLOCKED: human click pending |
| Safety counters | One safe recovery; zero unauthorized attempts | PASS live at agent boundary |
| Public source | GitHub default branch is public | PASS |
| Public mission | HTTPS mission responds and exposes native tools | PASS live |
| Public native verifier | Redirect, discovery, eight calls, and stop boundary | PASS live |
| Deployment | Hardened commit is live and identified | PASS: `ee519af` is Vercel Ready |
| Demo video | Checked local MP4 under three minutes | BLOCKED: capture inventory missing |
| Submission | Video URL added and Devpost submitted | HOLD: external publication gate |
