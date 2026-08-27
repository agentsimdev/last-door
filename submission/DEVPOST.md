# Devpost submission draft

## Project name

LAST DOOR

## Tagline

When evidence changes, the WebMCP tools change with it.

## Short description

LAST DOOR is a WebMCP authority compiler and trust continuity test for teams that build, test, or secure browser agents. It turns changing evidence into the only capabilities an agent is allowed to see, then proves why the rest disappeared.

## The problem

WebMCP makes a page callable, but a static tool list can outlive the decision that made an action safe. A challenge expires, a retry creates new evidence, and an action that looked available may now belong to a person. The agent needs current capabilities and a verifiable reason for everything that disappeared.

## What LAST DOOR does

The mission has three gates. The agent completes a controlled link, handles an expired challenge, retries with a fresh event, and requests a handoff at the human-presence gate.

During the run, the page remembers redacted evidence facts such as `STALE_CHALLENGE_REJECTED`. A deterministic authority rule evaluates those facts and the active gate. Its decision controls the WebMCP manifest and can be inspected through `explain_authority_decision`.

The final confirmation exists only as a visible button. After the person uses it, the receipt includes the completed gates, safety counters, final authority rule, and evidence memory.

The page also runs a judge-visible counterfactual against the same evidence. Registering all nine real agent tools once leaves nine advertised capabilities at the human boundary. Compiling the manifest from the authority decision leaves four and removes five stale capabilities. Human confirmation remains a DOM-only action and is never registered; neither challenge value appears in the proof. The unsafe baseline is simulated in isolated domain state and is never registered with the browser.

## Why WebMCP fits

The authority decision and the WebMCP manifest come from the same domain function. When evidence changes, LAST DOOR aborts the old tool registrations and publishes the capabilities allowed by the new decision. WebMCP is not transport decoration here: its live tool surface is the authority boundary being tested.

The agent can inspect the decision, rule, actor, and redacted evidence without receiving a challenge value. It can request the handoff, but it cannot perform the final confirmation.

## What people and agents can do together

The agent handles repeatable work and recovery. The person performs the action that depends on human presence. Both see the same authority decision, evidence memory, trace, and receipt.

The result is correct completion with a measurable stop.

## Implementation

The app uses the imperative WebMCP API through `document.modelContext.registerTool()`. Tool registrations depend on a versioned authority decision and are managed with `AbortController`. Challenge values stay inside the page. Run Memory contains symbolic facts only and resets with the mission. The counterfactual reuses the same domain transitions in isolated state so its numbers cannot drift from the actual policy.

The native test bench discovers tools with `document.modelContext.getTools()` and invokes them with `document.modelContext.executeTool()`. It also checks that the final rule is `HUMAN_HANDOFF_PENDING`, the actor is `human`, and stale-recovery evidence is present.

## How we tested it

The released auth-resilience build passed ten baseline prompt cases. Trust Continuity release `6926532` passed six deterministic domain tests and 30 fresh public native rehearsals. Cases 11 and 12 each passed three fresh live runs with the required evidence memory, named authority rule, and human stop boundary. The counterfactual upgrade adds a seventh deterministic test covering the 9-to-4 manifest comparison, five stale capabilities, the DOM-only human-confirmation invariant, and challenge-value exclusion.

The final human-approved rehearsal returned three gates passed, one safe recovery, one human handoff, zero unauthorized attempts, and rule `RUN_COMPLETE`. These checks cover evidence ordering, secret exclusion, rule selection, manifest equivalence, pre-start rejection, recovery, and the human stop boundary.

Protocol rehearsals and prompt evaluations remain separate because scripted reliability does not prove prompt generalization.

## New work during the challenge

LAST DOOR is a new standalone project built during the challenge period. AgentSIM's earlier browser-agent testing work informed the problem, but no pre-challenge AgentSIM source code is part of this submission. The evidence-compiled authority model, Run Memory, explanation tool, and static-versus-compiled counterfactual are challenge-period work recorded in the public repository history.

## Links

- Live app: https://agentsim-last-door.vercel.app
- Public repository: https://github.com/agentsimdev/last-door
- Demo video: `[VIDEO_URL]`
