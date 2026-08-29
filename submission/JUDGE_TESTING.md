# Judge testing instructions

## Supported browsers

- ChatGPT in-app browser
- Chrome 149 or later with `chrome://flags/#enable-webmcp-testing` enabled

## Primary test

1. Open https://agentsim-last-door.vercel.app.
2. In **See the risk**, choose `High-value checkout` and click `Load high-value checkout policy in WebMCP`. Confirm `10 → 04`, six stale tools removed, and `PASS / 4 OF 4 TOOLS MATCH`. `confirm_purchase` must be absent.
3. Choose `Production change` and load it. Confirm `08 → 04`, four stale tools removed, and another native `4 OF 4` match. The checkout tools must be gone and `approve_production_change` must be absent.
4. Click `Prepare mission tools`, then copy or give the displayed agent prompt to the browser agent.
5. Let the agent run until it reports that human presence is required.
6. Ask the agent to call `explain_authority_decision`. Confirm that the decision is `handoff`, the actor is `human`, and the rule is `HUMAN_HANDOFF_PENDING`.
7. Confirm that `confirm_human_presence` is absent from the returned capabilities and the live manifest.
8. Click `I am here. Open door 03.`
9. Ask the agent to read the final receipt.

Expected result:

```text
status: passed
gates passed: 3
agent completions: 2
safe recoveries: 1
human handoffs: 1
unauthorized attempts: 0
authority rule: RUN_COMPLETE
evidence facts: 8
```

## Deterministic native test bench

Open https://agentsim-last-door.vercel.app/verify.html and click `Run native agent path`. The route opens the mission in top-level verification mode and invokes its tools through the browser's native `getTools()` and `executeTool()` methods.

The test stops at the human gate after checking the authority rule and evidence memory. Confirm presence on the page, then click `Read final native receipt`.

## Safety checks

- No real account or credential is used.
- Challenge values do not appear in tool results or tool inputs.
- Run Memory contains symbolic evidence facts only.
- The WebMCP manifest matches the capabilities in the authority decision.
- The human confirmation is never registered as a tool.
- An out-of-sequence capability increments the unauthorized-attempt count.
- Static counterfactual lists remain isolated and are never registered with WebMCP.
- The Live Policy Lab registers only the four compiled, read-only proof tools for checkout and production change; the handlers have no external side effects.
- All three policy packs use the same deterministic compiler and report zero registered human actions.

## Verified release

- Behavior revision: `e6ac8d9baf4f37ebcdc91fd028c48e9d3ca8b21f`
- Evidence revision: `80220c8b2fae2fbf96e7a4aa6d98e2f061d34883`
- CI: https://github.com/agentsimdev/last-door/actions/runs/33198159962
- Production deployment: `dpl_7Z9UEpdj7MExg1W9ohQFUTsK7fzc`
- Live QA: exact manifests verified for checkout and production change, identity mission completed through actual WebMCP, final receipt passed, and desktop/mobile console checks were clean.
