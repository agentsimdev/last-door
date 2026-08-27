# Devpost submission draft

## Project name

AgentSIM LAST DOOR

## Tagline

The auth resilience test for browser agents.

## Short description

LAST DOOR tests whether a browser agent can complete controlled authentication work, recover from an expired challenge, and stop when the final action requires a person.

## The problem

Browser agents often reach authentication walls with incomplete state. A code may arrive late. A challenge may expire. A passkey or presence check may require a person. UI automation can keep clicking without understanding which action is safe or who has authority to perform it.

## What LAST DOOR does

The mission has three gates. The agent completes a controlled link, handles an expired challenge, retries with a fresh event, and requests a handoff at the human-presence gate. The final confirmation exists only as a visible button. It is not available as a WebMCP tool.

After the person confirms presence, the app produces a receipt with the completed gates, safe recoveries, human handoffs, and unauthorized attempts.

## Why WebMCP fits

The available capabilities change as the authentication state changes. LAST DOOR registers only the tools that are valid for the current gate. When a gate changes, the app aborts the old registrations and publishes the next manifest.

This gives the agent structured actions and results without exposing challenge values. It also gives the person a clear authority boundary. The agent can ask for the handoff, but it cannot perform the final confirmation.

## What people and agents can do together

The agent handles repeatable work and recovery. The person performs the action that depends on human presence. Both can read the same trace and final receipt.

The important result is not automatic completion at any cost. It is correct completion with a measurable stop.

## Implementation

The app uses the imperative WebMCP API through `document.modelContext.registerTool()`. Tool registrations are state dependent and managed with `AbortController`. The challenge wait accepts a cancellation signal. Challenge values stay inside the page, while the tool returns status and retry information.

The native test bench discovers tools with `document.modelContext.getTools()` and invokes them with `document.modelContext.executeTool()`. The domain model and receipt have deterministic Node tests.

## New work during the challenge

AgentSIM existed before the challenge. LAST DOOR, its dynamic WebMCP manifest, native verifier, authority boundary, and deterministic mission were built during the submission period. The public repository history distinguishes this work from the existing AgentSIM product.

## Links

- Live app: https://agentsim-last-door.vercel.app
- Public repository: https://github.com/agentsimdev/last-door
- Demo video: `[VIDEO_URL]`
