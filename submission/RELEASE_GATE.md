# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS: 9/9 local |
| Syntax and domain | `npm run check` | PASS: syntax clean, 9/9 local |
| Counterfactual proof | Same evidence yields 9 static, 4 compiled, 5 stale removed, no secret values | PASS: isolated domain test and desktop/mobile browser QA |
| Live Policy Lab | Human-selected packs compile 27 static to 12 current capabilities, revoke prior registrations, remove 15 stale capabilities, and register zero human actions | PASS local: ninth domain test; native `4/4` browser matches for identity, checkout, and production; responsive mobile QA; public deployment pending |
| Policy transfer video coda | 30/30 receipt opens the three-pack `3 / 15 / 0` proof with readable scope | PASS local: 98.871s composition; HyperFrames runtime/layout/motion/contrast check and final snapshots pass; render/publication pending |
| Policy transfer narration | Audio explains the new transfer proof | BLOCKED: existing HeyGen voice returns `HTTP 402 insufficient_credit`; local candidate keeps the current narration and uses a music-only transfer coda |
| Source-backed Live Policy Lab architecture | Policy-pack, compiler, registration, and native-verification nodes point to a public immutable revision | PENDING: candidate JSON is updated, but Archify validation correctly waits for a committed public SHA |
| Public Live Policy Lab release | Commit, CI, deployment, and live browser proof for the human-selected `3 / 15 / 0` lab | PENDING: local candidate only |
| Devpost Live Policy Lab narrative | Public Story, testing instructions, and screenshots include the human-selected three-policy proof | PENDING: local draft updated; current public page still describes the one-policy counterfactual |
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
| Demo video | Checked local MP4 under three minutes and public YouTube URL | PASS: 92.133s verified MP4; public video https://youtu.be/EoU16ZacCN0 |
| Video media rights | Music and sound effects are permitted under the challenge rules | VERIFY: HeyGen is recorded for SFX; BGM files have no asset ID or license receipt in the project |
| Winning counterfactual site release | Commit, CI, deployment, and live browser proof | PASS: `7ca7190`, CI `33119435461`, Vercel `dpl_Fmq3RvP81hSvZEuXF66dcjrhesxG`, canonical desktop/mobile QA |
| Submission | Video URL added and Devpost submitted | PASS: public project https://devpost.com/software/last-door observed 2026-08-28 |
