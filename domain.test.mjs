import test from "node:test";
import assert from "node:assert/strict";
import {
  availableToolNames,
  completeMagicLink,
  confirmHumanPresence,
  createRun,
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
  });
});

test("an out-of-sequence agent capability is recorded", () => {
  const run = createRun();
  startRun(run);

  assert.equal(requestHumanPresence(run).code, "WRONG_GATE");
  assert.equal(getReceipt(run).unauthorizedAttempts, 1);
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
  assert.deepEqual(manifests.at(-1), ["get_run_receipt"]);
});
