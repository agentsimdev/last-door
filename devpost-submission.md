# Title

LAST DOOR

## One-line Summary

When evidence changes, LAST DOOR rebuilds the WebMCP tool surface and proves why the agent continued, recovered, or stopped.

## Problem

WebMCP makes a page callable, but a static tool list can outlive the decision that made an action safe. A challenge can expire, a retry can create new evidence, and an action that once belonged to an agent may now belong to a person.

Telling an agent "do not use that tool" is weaker than removing the tool. Teams building, testing, or securing browser agents need the current capability surface to reflect current authority, with evidence that explains every change.

## Solution

LAST DOOR is a three-gate auth-resilience incident lab. A browser agent completes a controlled link, rejects and recovers from an expired challenge, and reaches a human-presence gate where it must stop.

The page keeps a run-scoped list of symbolic evidence facts, evaluates a deterministic authority rule, and compiles that decision into the WebMCP tools currently available. Old registrations are aborted and replaced whenever the evidence or authority changes. The agent can inspect the rule, actor, redacted evidence, and resulting capabilities through `explain_authority_decision`, but it never receives either challenge value.

The final confirmation remains a visible, human-only DOM action. It is never registered as a WebMCP tool. After the person acts, the agent can read a structured receipt containing the completed gates, recovery and handoff counters, final rule, and evidence trail.

LAST DOOR also includes a judge-visible Live Policy Lab. Identity recovery compiles `09 → 04`, high-value checkout `10 → 04`, and production change `08 → 04`. Loading a scenario aborts the old registrations and publishes only its four current tools through native WebMCP. Unsafe static baselines and human actions are never registered.

### Live Policy Lab proof

The released checkout scenario shows the full comparison in one view: `10 → 04`, six stale tools removed, native `4/4` browser verification, and no human action in the manifest.

[![LAST DOOR Live Policy Lab](https://raw.githubusercontent.com/agentsimdev/last-door/main/submission/live-policy-lab.jpg)](https://github.com/agentsimdev/last-door/blob/main/submission/live-policy-lab.jpg)

## Why WebMCP fits

Browser-agent, identity, commerce, and developer platform teams need a release test for stateful flows. A tool that was safe one step ago can be stale now, yet still remain callable if the page registered every tool once.

LAST DOOR tests a four-part contract: active gate and redacted facts in, authority rule and responsible actor decided, current WebMCP manifest published, and an evidence receipt out. The live mission proves identity recovery. The Live Policy Lab registers compiled manifests for identity, high-value checkout, and production change. The latter two are read-only proof snapshots, not live integrations.

A prior production soak repeated the auth incident 30 times without a protocol failure. That proved repeatability, but every run used one policy. The Live Policy Lab puts three data-defined packs through the same compiler at the human boundary: 27 static capabilities become 12 current capabilities, 15 stale capabilities disappear, and zero human actions enter a manifest.

For people, the page shows what the agent may do now, what changed, and when the person must take over. For agents, stale actions disappear instead of remaining callable behind a policy prompt.

People and agents can now share the same authority decision and evidence receipt. The agent handles repeatable work and safe recovery; the person performs the non-delegable action. A correct stop becomes measurable completion rather than a vague refusal.

WebMCP is the authority boundary itself. The live tool manifest comes from the same decision the agent can inspect.

## How we used AI

ChatGPT’s in-app browser acted as the browser agent under test. It discovered and invoked the live WebMCP tools from fresh page state, followed the mission, recovered from the stale challenge, inspected the authority decision, and stopped when the manifest moved authority to a person.

The app does not delegate policy to a model. Run Memory, authority rules, capability selection, secret exclusion, counters, and receipts are deterministic so the same evidence produces the same tool surface. This separation let us evaluate agent behavior without making the agent its own authorization system.

We also used AI-assisted narration and video tooling to build the public demo from the verified product surfaces.

## How we used Codex

Codex was the engineering and evaluation partner throughout the challenge. It helped:

- inspect the official requirements and keep release, render, publication, and submission gates separate;
- implement and review the evidence-compiled authority model and isolated static counterfactual;
- run deterministic checks, live WebMCP rehearsals, hostile-prompt repeats, desktop/mobile QA, and final receipt validation;
- compare observed agent behavior with the page-owned rule, evidence, manifest, and counters;
- iterate the product narrative, site, branded demo video, captions, music, and thumbnail;
- create source-backed system and lifecycle diagrams with Archify, then validate their geometry, readability, and light/dark presentation;
- verify the final 92.133-second MP4 through full audio/video decode before publication.

Codex outputs were treated as work to verify. Passing local tests, a deployed URL, browser behavior, a rendered file, and a public submission were kept as separate proof states.

## What judges can verify

- **Evidence-compiled WebMCP manifest:** capabilities are derived from the current authority decision and republished when state changes.
- **Run Memory:** ordered symbolic facts such as `STALE_CHALLENGE_REJECTED`; challenge values never enter memory or tool results.
- **Safe stale-event recovery:** the expired challenge is rejected, a fresh event resolves, and the evidence chain remains intact.
- **Human-only final action:** confirmation is a DOM control and never a registered agent capability.
- **Explainable authority:** `explain_authority_decision` returns the policy version, decision, actor, rule, redacted evidence, and allowed capabilities.
- **Structured receipt:** three gates, one safe recovery, one human handoff, eight evidence facts, and zero unauthorized attempts in the verified final run.
- **Live Policy Lab:** a person selects identity recovery, high-value checkout, or production change; prior registrations are revoked and the browser verifies an exact `4/4` compiled manifest.
- **Controlled counterfactual:** three isolated static lists establish `09 → 04`, `10 → 04`, and `08 → 04`; 15 stale capabilities disappear without registering a human action.
- **Native protocol test bench:** judge-visible discovery and invocation through `getTools()` and `executeTool()`.

## Architecture

LAST DOOR is a dependency-free browser application using the imperative WebMCP API through `document.modelContext.registerTool()`.

1. Mission transitions append redacted symbolic facts to page-owned Run Memory.
2. A versioned deterministic authority function evaluates the active gate and evidence.
3. The decision names the actor, rule, evidence, and allowed capabilities.
4. An `AbortController` removes prior registrations before the current manifest is published.
5. Tool handlers return structured statuses and receipts; page-held challenge values never cross the tool boundary.
6. The native test bench discovers and invokes the resulting tools through `document.modelContext.getTools()` and `executeTool()`.

Each policy pack uses the same compiler as the live identity mission. The isolated baselines establish what would remain advertised under static registration, while the native browser manifest proves what is actually callable after compilation.

### System architecture

The source-backed system map follows one action from browser-agent discovery through the dynamic WebMCP surface, page-owned evidence, deterministic authority reasoning, and structured receipt. It also isolates the two boundaries judges should verify: challenge values stay inside the page, and the final confirmation stays in the DOM.

[![LAST DOOR system architecture](https://raw.githubusercontent.com/agentsimdev/last-door/main/docs/architecture/last-door-system.png)](https://github.com/agentsimdev/last-door/blob/main/docs/architecture/last-door-system.html)

### Authority lifecycle

The lifecycle map shows the safe retry loop after an expired event and the non-delegable handoff before completion. A stop is represented as an authority decision, not a failed agent run.

[![LAST DOOR authority lifecycle](https://raw.githubusercontent.com/agentsimdev/last-door/main/docs/architecture/last-door-authority-lifecycle.png)](https://github.com/agentsimdev/last-door/blob/main/docs/architecture/last-door-authority-lifecycle.html)

## Testing instructions

### Primary judge path

1. Open https://agentsim-last-door.vercel.app in ChatGPT's in-app browser, or Chrome with `chrome://flags/#enable-webmcp-testing` enabled.
2. In **See the risk**, choose **High-value checkout** and load it. Confirm `10 → 04`, six stale tools removed, `PASS / 4 OF 4 TOOLS MATCH`, and no `confirm_purchase` tool.
3. Choose **Production change** and load it. Confirm `08 → 04`, four stale tools removed, another `4 OF 4` match, and that the checkout tools disappeared.
4. Click **Prepare mission tools**, then copy or give the displayed prompt to the browser agent.
5. Let the agent proceed until it reports that human presence is required.
6. Ask it to call `explain_authority_decision`. Confirm decision `handoff`, actor `human`, and rule `HUMAN_HANDOFF_PENDING`.
7. Confirm that `confirm_human_presence` is absent from the live manifest.
8. Click **I am here. Open door 03.**
9. Ask the agent to read the final receipt.

Expected receipt: `status: passed`, three gates passed, two agent completions, one safe recovery, one human handoff, zero unauthorized attempts, rule `RUN_COMPLETE`, and eight evidence facts.

### Deterministic native path

Open https://agentsim-last-door.vercel.app/verify.html and click **Run native agent path**. The test should stop at `HUMAN REQUIRED` after verifying the authority rule and evidence memory. Confirm presence on the page, then click **Read final native receipt**.

No credentials or real accounts are required.

## Public demo link

https://agentsim-last-door.vercel.app

## Public repository link

https://github.com/agentsimdev/last-door

The repository is public and uses the MIT License.

## Demo video

https://youtu.be/EoU16ZacCN0

Public YouTube video with audio, about 92 seconds. The sequence covers:

1. Same evidence: nine static capabilities versus four current capabilities.
2. The human action is never registered as a tool.
3. The mission starts from a versioned authority decision.
4. An expired challenge is rejected without returning or storing its value.
5. A fresh event recovers cleanly.
6. The agent stops under `HUMAN_HANDOFF_PENDING`.
7. The person performs the final action and the receipt proves the result.
8. Thirty native rehearsals and the final verdict: stopping can be correct completion.

## Exact Devpost project payload

- **name:** `LAST DOOR`
- **tagline:** `When evidence changes, the WebMCP tools change with it.`
- **description:** Use the finished Markdown from **Problem** through **Testing Instructions** above.
- **built_with:** `["HTML", "CSS", "JavaScript", "WebMCP", "OpenAI Codex", "Vercel"]`
- **links:** `[{"url":"https://agentsim-last-door.vercel.app"},{"url":"https://github.com/agentsimdev/last-door"}]`
- **video_url:** `https://youtu.be/EoU16ZacCN0`
- **challenge_slug:** `webmcp`
- **custom_answers:** Use the complete field-id mapping under **Official Form Fields** below.

## Screenshot shot list

1. **Live Policy Lab:** `submission/live-policy-lab.jpg`: the released checkout policy at `10 → 04`, native `4/4` verification, six stale tools removed, and no human action in the manifest.
2. **Counterfactual proof:** `videos/last-door-demo/assets/counterfactual-proof.png`: same evidence, `09 → 04`, five stale capabilities removed.
3. **Full mission surface:** `videos/last-door-demo/assets/full-page.png`: three gates, live manifest, decision, and trace.
4. **Human handoff:** `videos/last-door-demo/assets/human-handoff.png`: human-only action, four-tool manifest, and `HUMAN_HANDOFF_PENDING`.
5. **Video thumbnail:** `submission/youtube-thumbnail.png`: judge-facing hook and counterfactual summary.
6. **System architecture:** `docs/architecture/last-door-system.png`: source-backed capability, evidence, secret, and human-authority boundaries.
7. **Authority lifecycle:** `docs/architecture/last-door-authority-lifecycle.png`: stale-event recovery loop and human-only completion path.

## Submission readiness notes

- Live app: Vercel provider-verified production deployment `dpl_5ZwsoZsJEXoqEmAedsFipmfeYFkE` is `READY` for commit `161662885f88bab09f9389d8e2a5372a492e42d3`; the canonical URL is live.
- Public repository: commit `1616628` is on public `main` with an MIT license.
- Demo video: verified public through YouTube oEmbed and direct HTTP access.
- Product proof: nine deterministic domain tests, prior 30/30 native rehearsals, hostile-prompt repeats, a production three-scenario Live Policy Lab, and a verified final human receipt on commit `1616628`.
- Architecture diagrams: both passed Archify showcase validation and visual checks; their public HTML and PNG URLs return HTTP 200 from the production domain.
- Official requirements: live URL, public repository, text description, public demo video under three minutes with audio, implementation details, and judge testing instructions are present.
- Judging alignment: evidence-compiled tools demonstrate **WebMCP Leverage**; the live mission and receipt demonstrate **Execution**; safer agent authentication testing supports **Potential Impact**; the authority compiler and static counterfactual support **Creativity & Ambition**.
- Registration: live Devpost account check confirms registration for The WebMCP Challenge and submissions are open.
- Official deadline: 2026-09-03 20:00 UTC.
- Public Devpost project: https://devpost.com/software/last-door is verified live. Its Story and judge-only answers need the final Live Policy Lab refresh described in this packet.

## Known limitations

- The live WebMCP path requires ChatGPT’s in-app browser or Chrome 149+ with WebMCP testing enabled.
- The mission is a deterministic, owned simulation; it does not connect to real accounts, inboxes, phone numbers, or identity providers.
- Run Memory is page-run scoped and intentionally does not claim durable user memory.
- LAST DOOR demonstrates a capability and evidence model; it is not production authorization enforcement.
- The final action deliberately requires a person and cannot be completed through WebMCP.

## Official form fields

The live Devpost form currently asks for the following exact fields:

- **28249, Submitter Type (required):** `Individual`
- **28250, Country of residence (required, multi-select):** `["Nigeria", "Estonia"]`
- **28251, Organization name (optional):** Omit because Submitter Type is `Individual`.
- **28252, App Status (required):** `New`
- **28253, Existing-app update explanation (optional):** Omit when App Status is `New`.
- **28254, Live URL (required):** `https://agentsim-last-door.vercel.app`
- **28255, Testing instructions (optional):** `No credentials are required. Open https://agentsim-last-door.vercel.app in ChatGPT's in-app browser or Chrome with WebMCP testing enabled. Choose High-value checkout, load it, and confirm 10 static tools become 04 live tools, 6 stale tools disappear, and the browser reports PASS / 4 OF 4 TOOLS MATCH. Choose Production change and load it; confirm 08 becomes 04 and the checkout tools are gone. Click Prepare mission tools, then give the displayed prompt to the browser agent. Confirm decision=handoff, actor=human, rule=HUMAN_HANDOFF_PENDING, and that confirm_human_presence is absent. Click "I am here. Open door 03.", then ask for the final receipt. Expected: passed; 3 gates; 2 agent completions; 1 safe recovery; 1 human handoff; 0 unauthorized attempts; rule RUN_COMPLETE. Alternate deterministic path: https://agentsim-last-door.vercel.app/verify.html.`
- **28256, Public code repository (required):** `https://github.com/agentsimdev/last-door`
- **28257, Agents or clients tested (required):** `ChatGPT in-app browser; Google Chrome with WebMCP testing enabled; native getTools()/executeTool() test bench.`
- **28258, AI tools leveraged (required):** `OpenAI Codex for implementation, review, browser evaluation, QA, submission preparation, and source-backed Archify diagrams; ChatGPT in-app browser as the WebMCP agent under test; HeyGen and HyperFrames for the narrated demo video.`
- **28259, Learning level (required):** `Significant`
- **28260, Reusable AI career value (required):** `Yes`

No Codex session ID field is requested by the current official form.
