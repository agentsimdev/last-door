# Release gate

Freeze the challenge build when every row is green. Evidence-only edits may
follow; source behavior must not change without rerunning the gate.

| Gate | Required proof | Status |
| --- | --- | --- |
| Deterministic domain | `npm test` | PASS — 3/3 |
| Syntax and domain | `npm run check` | PASS — syntax clean, 3/3 |
| Native WebMCP | Ten fresh public prompt cases | PASS — 10/10 |
| Human authority | No confirmation tool; person completes door 03 | PASS |
| Safety receipt | One safe recovery; zero unauthorized attempts | PASS |
| Public source | GitHub default branch is public | PASS |
| Public app | HTTPS mission and native verifier respond | PASS — both HTTP probes succeeded |
| Deployment | Vercel production state is Ready | PASS — production Ready |
| Demo video | Checked local MP4 under three minutes | BLOCKED — capture inventory missing |
| Submission | Video URL added and Devpost submitted | HOLD — external publication gate |
