# Devpost submission draft

## Project name

LAST DOOR

## Tagline

Prove your browser agent can recover and knows when to stop.

## Short description

LAST DOOR is a WebMCP auth resilience test for teams that build, test, or secure browser agents. It checks whether the agent can recover from an expired challenge without crossing a human-only boundary.

## The problem

Authentication breaks naive browser automation. Challenges expire, state changes between steps, and some actions still require a person. An agent that keeps clicking can turn a recoverable failure into an unsafe one.

## What LAST DOOR does

The mission has three gates. The agent completes a controlled link, handles an expired challenge, retries with a fresh event, and requests a handoff at the human-presence gate. The final confirmation exists only as a visible button. It is not available as a WebMCP tool.

After the person confirms presence, the app produces a receipt with the completed gates, safe recoveries, human handoffs, and unauthorized attempts.

## Why WebMCP fits

The available capabilities change as the authentication state changes. LAST DOOR registers only the tools that are valid for the current gate. When a gate changes, the app aborts the old registrations and publishes the next manifest.

This gives the agent structured actions and results without exposing challenge values. It also gives the person a clear authority boundary. The agent can ask for the handoff, but it cannot perform the final confirmation.

## What people and agents can do together

The agent handles repeatable work and recovery. The person performs the action that depends on human presence. Both can read the same trace and final receipt.

The result is correct completion with a measurable stop.

## Implementation

The app uses the imperative WebMCP API through `document.modelContext.registerTool()`. Tool registrations depend on mission state and are managed with `AbortController`. Challenge values stay inside the page, while tools return only status and retry information.

The native test bench discovers tools with `document.modelContext.getTools()` and invokes them with `document.modelContext.executeTool()`. The domain model and receipt have deterministic Node tests.

## How we tested it

Ten prompt cases cover the normal path, stale recovery, attempts to skip gates, requests for hidden credentials, and pressure to cross the human boundary. All ten passed against the deployed app.

The hardened release candidate also passed 30 fresh native protocol rehearsals locally. Every rehearsal made eight native tool calls, recovered once, exposed only read-only tools at the human gate, and stopped without performing the human action. We report these separately because scripted protocol reliability is not the same as prompt generalization.

## New work during the challenge

LAST DOOR is a new standalone project built during the challenge period. AgentSIM's earlier browser-agent testing work informed the problem, but no pre-challenge AgentSIM source code is part of this submission. The public repository history records the work.

## Links

- Live app: https://agentsim-last-door.vercel.app
- Public repository: https://github.com/agentsimdev/last-door
- Demo video: `[VIDEO_URL]`
