# Devpost submission draft

## Project name

LAST DOOR

## Tagline

When evidence changes, the WebMCP tools change with it.

## Short description

LAST DOOR is a WebMCP authority compiler and trust continuity test for teams that build, test, or secure browser agents. It turns changing evidence into the only capabilities an agent is allowed to see, then proves why the rest disappeared.

## Who needs it

Browser-agent, identity, commerce, and developer platform teams need a release test for stateful flows. A tool that was safe one step ago can be stale now, yet still remain callable if the page registered every tool once.

LAST DOOR tests a reusable four-part contract: active gate and redacted facts in, authority rule and responsible actor decided, current WebMCP manifest published, and an evidence receipt out. The live mission proves identity recovery. A human-selected Live Policy Lab registers compiled identity, checkout, and production-change manifests so judges can inspect native revocation; the latter two remain proof-only snapshots, not live integrations.

## The problem

WebMCP makes a page callable, but a static tool list can outlive the decision that made an action safe. A challenge expires, a retry creates new evidence, and an action that looked available may now belong to a person. The agent needs current capabilities and a verifiable reason for everything that disappeared.

## What LAST DOOR does

The mission has three gates. The agent completes a controlled link, handles an expired challenge, retries with a fresh event, and requests a handoff at the human-presence gate.

During the run, the page remembers redacted evidence facts such as `STALE_CHALLENGE_REJECTED`. A deterministic authority rule evaluates those facts and the active gate. Its decision controls the WebMCP manifest and can be inspected through `explain_authority_decision`.

The final confirmation exists only as a visible button. After the person uses it, the receipt includes the completed gates, safety counters, final authority rule, and evidence memory.

The judge-visible Live Policy Lab compares each static list with the selected compiled manifest. Identity recovery produces `09 → 04`, checkout `10 → 04`, and production change `08 → 04`. Each load aborts prior registrations before publishing the four current tools. The unsafe baselines and all human actions remain outside WebMCP.

Thirty clean production rehearsals proved that the auth path was repeatable, but they all exercised one policy. The Live Policy Lab addresses that gap. Across identity recovery, high-value checkout, and production change, 27 static agent capabilities compile to 12 current capabilities. Fifteen stale capabilities disappear and zero human actions enter a manifest.

## Why WebMCP fits

The authority decision and the WebMCP manifest come from the same domain function. When evidence changes, LAST DOOR aborts the old tool registrations and publishes the capabilities allowed by the new decision. WebMCP is not transport decoration here: its live tool surface is the authority boundary being tested.

The agent can inspect the decision, rule, actor, and redacted evidence without receiving a challenge value. It can request the handoff, but it cannot perform the final confirmation.

## What people and agents can do together

The agent handles repeatable work and recovery. The person performs the action that depends on human presence. Both see the same authority decision, evidence memory, trace, and receipt.

The result is correct completion with a measurable stop.

## Implementation

The app uses the imperative WebMCP API through `document.modelContext.registerTool()`. Tool registrations depend on a versioned authority decision and are managed with `AbortController`. Challenge values stay inside the page. Run Memory contains symbolic facts only and resets with the mission. A shared deterministic compiler reads data-defined policy states for the mission and Live Policy Lab. Checkout and production handlers return proof-only receipts with no external side effects. Static baselines and human actions are never registered.

The native test bench discovers tools with `document.modelContext.getTools()` and invokes them with `document.modelContext.executeTool()`. It also checks that the final rule is `HUMAN_HANDOFF_PENDING`, the actor is `human`, and stale-recovery evidence is present.

## How we tested it

The released auth-resilience build passed ten baseline prompt cases. Trust Continuity release `6926532` passed six deterministic domain tests and 30 fresh public native rehearsals. Cases 11 and 12 each passed three fresh live runs with the required evidence memory, named authority rule, and human stop boundary. The counterfactual and transfer iterations added two tests. The Live Policy Lab adds a ninth fail-closed test, plus native `4/4` matches for all three selected manifests and a restored end-to-end mission pass.

The final human-approved rehearsal returned three gates passed, one safe recovery, one human handoff, zero unauthorized attempts, and rule `RUN_COMPLETE`. These checks cover evidence ordering, secret exclusion, rule selection, manifest equivalence, pre-start rejection, recovery, and the human stop boundary.

Protocol rehearsals and prompt evaluations remain separate because scripted reliability does not prove prompt generalization.

## New work during the challenge

LAST DOOR is a new standalone project built during the challenge period. AgentSIM's earlier browser-agent testing work informed the problem, but no pre-challenge AgentSIM source code is part of this submission. The evidence-compiled authority model, Run Memory, explanation tool, and static-versus-compiled counterfactual are challenge-period work recorded in the public repository history.

## Links

- Live app: https://agentsim-last-door.vercel.app
- Public repository: https://github.com/agentsimdev/last-door
- Demo video: https://youtu.be/EoU16ZacCN0
