import test from "node:test";
import assert from "node:assert/strict";
import {
  availableToolNames,
  completeMagicLink,
  confirmHumanPresence,
  createPolicyLabManifest,
  createRun,
  explainAuthority,
  getReceipt,
  issueChallenge,
  requestHumanPresence,
  resolveChallenge,
  runAuthorityCounterfactual,
  runPolicyTransferMatrix,
  startRun,
} from "./domain.mjs";

test("agent recovers, then stops at the human-only gate", () => {
  const run = createRun();

  assert.equal(startRun(run).ok, true);
  assert.equal(completeMagicLink(run).ok, true);

  const stale = issueChallenge(run);
  assert.equal(stale.status, "expired");
  assert.equal(resolveChallenge(run, stale.code).code, "STALE_CHALLENGE");

  const fresh = issueChallenge(run);
  assert.equal(fresh.status, "fresh");
  assert.equal(resolveChallenge(run, fresh.code).ok, true);

  assert.equal(confirmHumanPresence(run).code, "HANDOFF_NOT_REQUESTED");
  assert.equal(requestHumanPresence(run).status, "waiting_for_human");
  assert.equal(confirmHumanPresence(run).status, "complete");

  assert.deepEqual(getReceipt(run), {
    status: "passed",
    gatesPassed: 3,
    agentCompletions: 2,
    safeRecoveries: 1,
    humanHandoffs: 1,
    unauthorizedAttempts: 0,
    authority: {
      policyVersion: "1",
      decision: "complete",
      actor: null,
      rule: "RUN_COMPLETE",
      evidence: [
        "MISSION_STARTED",
        "CONTROLLED_LINK_PASSED",
        "CHALLENGE_EXPIRED",
        "STALE_CHALLENGE_REJECTED",
        "CHALLENGE_FRESH",
        "FRESH_CHALLENGE_RESOLVED",
        "HUMAN_HANDOFF_REQUESTED",
        "HUMAN_PRESENCE_CONFIRMED",
      ],
    },
  });
});

test("an out-of-sequence agent capability is recorded", () => {
  const run = createRun();
  startRun(run);

  assert.equal(requestHumanPresence(run).code, "WRONG_GATE");
  assert.equal(getReceipt(run).unauthorizedAttempts, 1);
});

test("the authority model rejects a gate action before the mission starts", () => {
  const run = createRun();

  assert.equal(completeMagicLink(run).code, "WRONG_GATE");
  assert.deepEqual(run.gateStates, ["locked", "locked", "locked"]);
  assert.deepEqual(explainAuthority(run).evidence, ["UNAUTHORIZED_ACTION_REJECTED"]);
});

test("a pending challenge cannot be replaced or recovered twice", () => {
  const run = createRun();
  startRun(run);
  completeMagicLink(run);

  const stale = issueChallenge(run);
  assert.equal(stale.status, "expired");
  assert.equal(issueChallenge(run).code, "CHALLENGE_ALREADY_PENDING");

  assert.equal(resolveChallenge(run, stale.code).code, "STALE_CHALLENGE");
  assert.equal(resolveChallenge(run, stale.code).code, "CHALLENGE_ALREADY_HANDLED");
  assert.equal(getReceipt(run).safeRecoveries, 1);

  const fresh = issueChallenge(run);
  assert.equal(fresh.status, "fresh");
  assert.equal(resolveChallenge(run, fresh.code).ok, true);
});

test("the dynamic manifest never exposes human confirmation", () => {
  const run = createRun();
  const manifests = [availableToolNames(run)];

  startRun(run);
  manifests.push(availableToolNames(run));
  completeMagicLink(run);
  manifests.push(availableToolNames(run));
  const stale = issueChallenge(run);
  resolveChallenge(run, stale.code);
  const fresh = issueChallenge(run);
  resolveChallenge(run, fresh.code);
  manifests.push(availableToolNames(run));
  requestHumanPresence(run);
  manifests.push(availableToolNames(run));
  confirmHumanPresence(run);
  manifests.push(availableToolNames(run));

  assert.equal(manifests.some((names) => names.includes("confirm_human_presence")), false);
  assert.deepEqual(manifests.at(-1), ["explain_authority_decision", "get_run_receipt"]);
});

test("authority decisions drive the manifest from redacted run memory", () => {
  const run = createRun();

  assert.deepEqual(explainAuthority(run), {
    policyVersion: "1",
    decision: "allow",
    actor: "agent",
    gate: null,
    rule: "MISSION_CAN_START",
    evidence: [],
    capabilities: ["start_auth_mission", "explain_authority_decision", "get_run_receipt"],
  });

  startRun(run);
  completeMagicLink(run);
  const stale = issueChallenge(run);
  resolveChallenge(run, stale.code);
  const fresh = issueChallenge(run);
  resolveChallenge(run, fresh.code);
  requestHumanPresence(run);

  const authority = explainAuthority(run);
  assert.equal(authority.decision, "handoff");
  assert.equal(authority.actor, "human");
  assert.equal(authority.rule, "HUMAN_HANDOFF_PENDING");
  assert.deepEqual(authority.evidence, [
    "MISSION_STARTED",
    "CONTROLLED_LINK_PASSED",
    "CHALLENGE_EXPIRED",
    "STALE_CHALLENGE_REJECTED",
    "CHALLENGE_FRESH",
    "FRESH_CHALLENGE_RESOLVED",
    "HUMAN_HANDOFF_REQUESTED",
  ]);
  assert.deepEqual(availableToolNames(run), authority.capabilities);
  assert.equal(JSON.stringify(authority).includes(stale.code), false);
  assert.equal(JSON.stringify(authority).includes(fresh.code), false);

  authority.evidence.length = 0;
  authority.capabilities.push("confirm_human_presence");
  assert.equal(explainAuthority(run).evidence.includes("STALE_CHALLENGE_REJECTED"), true);
  assert.equal(availableToolNames(run).includes("confirm_human_presence"), false);
});

test("the counterfactual compares only real agent tools and preserves the human invariant", () => {
  const proof = runAuthorityCounterfactual();

  assert.equal(proof.gate, "human-presence");
  assert.equal(proof.rule, "HUMAN_HANDOFF_PENDING");
  assert.equal(proof.actor, "human");
  assert.equal(proof.static.capabilities.length, 9);
  assert.equal(proof.static.exposesHumanConfirmation, false);
  assert.equal(proof.compiled.exposesHumanConfirmation, false);
  assert.equal(proof.invariants.humanConfirmationRegistered, false);
  assert.deepEqual(proof.compiled.capabilities, [
    "inspect_current_gate",
    "explain_authority_decision",
    "get_run_receipt",
    "get_handoff_status",
  ]);
  assert.deepEqual(proof.prevented.capabilities, [
    "start_auth_mission",
    "complete_controlled_magic_link",
    "wait_for_challenge_event",
    "resolve_current_challenge",
    "request_human_presence",
  ]);
  assert.equal(proof.prevented.count, 5);
  assert.equal(JSON.stringify(proof).includes("270311"), false);
  assert.equal(JSON.stringify(proof).includes("482901"), false);
  assert.equal(availableToolNames(createRun()).includes("confirm_human_presence"), false);
});

test("one authority compiler transfers across three policy packs", () => {
  const matrix = runPolicyTransferMatrix();

  assert.deepEqual(matrix.cases.map(({ id }) => id), [
    "identity-recovery",
    "high-value-checkout",
    "production-change",
  ]);
  assert.deepEqual(matrix.cases.map(({ rule }) => rule), [
    "HUMAN_HANDOFF_PENDING",
    "PURCHASE_APPROVAL_PENDING",
    "PRODUCTION_APPROVAL_PENDING",
  ]);
  assert.deepEqual(matrix.cases.map(({ prevented }) => prevented.count), [5, 6, 4]);
  assert.equal(matrix.cases.every(({ actor }) => actor === "human"), true);
  assert.equal(matrix.cases.every(({ humanActionRegistered }) => humanActionRegistered === false), true);
  assert.deepEqual(matrix.totals, {
    policyPacks: 3,
    staticCapabilities: 27,
    compiledCapabilities: 12,
    staleCapabilitiesRemoved: 15,
    humanActionsRegistered: 0,
  });
});

test("the live policy lab fails closed and never registers human actions", () => {
  const expected = {
    "identity-recovery": { current: 4, removed: 5, humanAction: "confirm_human_presence" },
    "high-value-checkout": { current: 4, removed: 6, humanAction: "confirm_purchase" },
    "production-change": { current: 4, removed: 4, humanAction: "approve_production_change" },
  };

  for (const [policyId, result] of Object.entries(expected)) {
    const manifest = createPolicyLabManifest(policyId);

    assert.equal(manifest.ok, true);
    assert.equal(manifest.scope, "isolated_policy_snapshot");
    assert.equal(manifest.decision, "handoff");
    assert.equal(manifest.capabilities.length, result.current);
    assert.equal(manifest.removedCapabilities.length, result.removed);
    assert.equal(manifest.humanAction, result.humanAction);
    assert.equal(manifest.capabilities.includes(result.humanAction), false);
    assert.equal(manifest.humanActionRegistered, false);
  }

  assert.deepEqual(createPolicyLabManifest("unknown-policy"), {
    ok: false,
    policyId: "unknown-policy",
    rule: "POLICY_PACK_REJECTED",
    capabilities: [],
  });
});
