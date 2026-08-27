import test from "node:test";
import assert from "node:assert/strict";
import {
  availableToolNames,
  completeMagicLink,
  confirmHumanPresence,
  createRun,
  explainAuthority,
  getReceipt,
  issueChallenge,
  requestHumanPresence,
  resolveChallenge,
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
