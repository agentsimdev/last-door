# Devpost submission draft

## Project name

LAST DOOR

## Tagline

Prove your browser agent can recover, remember, and explain when it must stop.

## Short description

LAST DOOR is a WebMCP trust continuity test for teams that build, test, or secure browser agents. It checks whether the agent can preserve evidence through a changing authentication flow and explain why the last action belongs to a person.

## The problem

Browser agents can lose the chain of authority as a task changes state. A challenge expires, a retry creates new evidence, and an action that looked available may now belong to a person. A tool list alone does not explain what changed or why the agent must stop.

## What LAST DOOR does

The mission has three gates. The agent completes a controlled link, handles an expired challenge, retries with a fresh event, and requests a handoff at the human-presence gate.

During the run, the page remembers redacted evidence facts such as `STALE_CHALLENGE_REJECTED`. A deterministic authority rule evaluates those facts and the active gate. Its decision controls the WebMCP manifest and can be inspected through `explain_authority_decision`.

The final confirmation exists only as a visible button. After the person uses it, the receipt includes the completed gates, safety counters, final authority rule, and evidence memory.

## Why WebMCP fits

The authority decision and the WebMCP manifest come from the same domain function. When evidence changes, LAST DOOR aborts the old tool registrations and publishes the capabilities allowed by the new decision.

The agent can inspect the decision, rule, actor, and redacted evidence without receiving a challenge value. It can request the handoff, but it cannot perform the final confirmation.

## What people and agents can do together

The agent handles repeatable work and recovery. The person performs the action that depends on human presence. Both see the same authority decision, evidence memory, trace, and receipt.

The result is correct completion with a measurable stop.

## Implementation

The app uses the imperative WebMCP API through `document.modelContext.registerTool()`. Tool registrations depend on a versioned authority decision and are managed with `AbortController`. Challenge values stay inside the page. Run Memory contains symbolic facts only and resets with the mission.

The native test bench discovers tools with `document.modelContext.getTools()` and invokes them with `document.modelContext.executeTool()`. It also checks that the final rule is `HUMAN_HANDOFF_PENDING`, the actor is `human`, and stale-recovery evidence is present.

## How we tested it

The released auth-resilience build passed ten prompt cases and 30 fresh public protocol rehearsals. The Trust Continuity candidate passed six deterministic domain tests and 30 fresh local native rehearsals. Those checks cover evidence ordering, secret exclusion, rule selection, manifest equivalence, pre-start rejection, and the human stop boundary. The same gate must pass against the public candidate before submission.

Protocol rehearsals and prompt evaluations remain separate because scripted reliability does not prove prompt generalization.

## New work during the challenge

LAST DOOR is a new standalone project built during the challenge period. AgentSIM's earlier browser-agent testing work informed the problem, but no pre-challenge AgentSIM source code is part of this submission. The authority ontology, Run Memory, reasoner, and explanation tool are challenge-period work recorded in the public repository history.

## Links

- Live app: https://agentsim-last-door.vercel.app
- Public repository: https://github.com/agentsimdev/last-door
- Demo video: `[VIDEO_URL]`
