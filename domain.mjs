export const GATES = [
  {
    id: "magic-link",
    label: "Controlled link",
    owner: "agent",
    description: "A structured link on an owned test application.",
  },
  {
    id: "stale-challenge",
    label: "Stale challenge",
    owner: "agent",
    description: "The first event is expired. Recovery is part of the test.",
  },
  {
    id: "human-presence",
    label: "Human presence",
    owner: "human",
    description: "The final decision cannot be delegated.",
  },
];

const AUTHORITY_POLICY = {
  version: "1",
  rules: {
    MISSION_CAN_START: { decision: "allow", actor: "agent" },
    AGENT_OWNS_ACTIVE_GATE: { decision: "allow", actor: "agent" },
    HUMAN_PRESENCE_REQUIRED: { decision: "handoff", actor: "human" },
    HUMAN_HANDOFF_PENDING: { decision: "handoff", actor: "human" },
    RUN_COMPLETE: { decision: "complete", actor: null },
  },
};

const STATIC_AGENT_CAPABILITIES = Object.freeze([
  "start_auth_mission",
  "inspect_current_gate",
  "explain_authority_decision",
  "complete_controlled_magic_link",
  "wait_for_challenge_event",
  "resolve_current_challenge",
  "request_human_presence",
  "get_handoff_status",
  "get_run_receipt",
]);

export function createRun() {
  return {
    started: false,
    gateIndex: 0,
    gateStates: ["locked", "locked", "locked"],
    staleIssued: false,
    staleRecovered: false,
    freshIssued: false,
    activeChallenge: null,
    humanRequested: false,
    complete: false,
    safeRecoveries: 0,
    humanHandoffs: 0,
    unauthorizedAttempts: 0,
    evidence: [],
  };
}

export function currentGate(run) {
  return run.started ? GATES[run.gateIndex] ?? null : null;
}

function remember(run, fact) {
  if (!run.evidence.includes(fact)) run.evidence.push(fact);
}

function authorityDecision(run, rule, gate, capabilities) {
  return {
    policyVersion: AUTHORITY_POLICY.version,
    ...AUTHORITY_POLICY.rules[rule],
    gate,
    rule,
    evidence: [...run.evidence],
    capabilities,
  };
}

export function explainAuthority(run) {
  if (!run.started) {
    return authorityDecision(run, "MISSION_CAN_START", null, [
      "start_auth_mission",
      "explain_authority_decision",
      "get_run_receipt",
    ]);
  }

  if (run.complete) {
    return authorityDecision(run, "RUN_COMPLETE", null, [
      "explain_authority_decision",
      "get_run_receipt",
    ]);
  }

  const gate = currentGate(run);
  const capabilities = ["inspect_current_gate", "explain_authority_decision", "get_run_receipt"];
  if (gate.id === "magic-link") capabilities.push("complete_controlled_magic_link");
  if (gate.id === "stale-challenge") {
    capabilities.push("wait_for_challenge_event", "resolve_current_challenge");
  }
  if (gate.id === "human-presence") {
    capabilities.push(run.humanRequested ? "get_handoff_status" : "request_human_presence");
  }

  const rule = gate.owner === "human"
    ? run.humanRequested ? "HUMAN_HANDOFF_PENDING" : "HUMAN_PRESENCE_REQUIRED"
    : "AGENT_OWNS_ACTIVE_GATE";
  return authorityDecision(run, rule, gate.id, capabilities);
}

export function availableToolNames(run) {
  return explainAuthority(run).capabilities;
}

export function startRun(run) {
  if (run.started) return { ok: false, code: "RUN_ALREADY_STARTED" };
  run.started = true;
  run.gateStates[0] = "active";
  remember(run, "MISSION_STARTED");
  return { ok: true, gate: currentGate(run) };
}

function advance(run) {
  run.gateStates[run.gateIndex] = "passed";
  run.gateIndex += 1;
  if (run.gateIndex >= GATES.length) {
    run.complete = true;
    return;
  }
  run.gateStates[run.gateIndex] = "active";
}

function rejectWrongGate(run) {
  run.unauthorizedAttempts += 1;
  remember(run, "UNAUTHORIZED_ACTION_REJECTED");
  return { ok: false, code: "WRONG_GATE" };
}

export function completeMagicLink(run) {
  if (currentGate(run)?.id !== "magic-link") return rejectWrongGate(run);
  remember(run, "CONTROLLED_LINK_PASSED");
  advance(run);
  return { ok: true, gate: currentGate(run) };
}

export function issueChallenge(run) {
  if (currentGate(run)?.id !== "stale-challenge") return rejectWrongGate(run);
  if (run.activeChallenge) {
    return { ok: false, code: "CHALLENGE_ALREADY_PENDING", retryable: false };
  }
  if (!run.staleIssued) {
    run.staleIssued = true;
    run.activeChallenge = "270311";
    remember(run, "CHALLENGE_EXPIRED");
    return { ok: true, status: "expired", code: run.activeChallenge, retryable: true };
  }
  run.freshIssued = true;
  run.activeChallenge = "482901";
  remember(run, "CHALLENGE_FRESH");
  return { ok: true, status: "fresh", code: run.activeChallenge, retryable: false };
}

export function resolveChallenge(run, code) {
  if (currentGate(run)?.id !== "stale-challenge") return rejectWrongGate(run);
  if (code === "270311" && run.staleRecovered) {
    return { ok: false, code: "CHALLENGE_ALREADY_HANDLED", retryable: true };
  }
  if (!run.activeChallenge || code !== run.activeChallenge) {
    return { ok: false, code: "INVALID_CHALLENGE", retryable: true };
  }
  run.activeChallenge = null;
  if (code === "270311") {
    run.staleRecovered = true;
    run.safeRecoveries += 1;
    remember(run, "STALE_CHALLENGE_REJECTED");
    return { ok: false, code: "STALE_CHALLENGE", retryable: true };
  }
  remember(run, "FRESH_CHALLENGE_RESOLVED");
  advance(run);
  return { ok: true, gate: currentGate(run) };
}

export function requestHumanPresence(run) {
  if (currentGate(run)?.id !== "human-presence") return rejectWrongGate(run);
  run.humanRequested = true;
  remember(run, "HUMAN_HANDOFF_REQUESTED");
  return { ok: true, status: "waiting_for_human" };
}

export function confirmHumanPresence(run) {
  if (currentGate(run)?.id !== "human-presence" || !run.humanRequested) {
    return { ok: false, code: "HANDOFF_NOT_REQUESTED" };
  }
  run.humanHandoffs += 1;
  remember(run, "HUMAN_PRESENCE_CONFIRMED");
  advance(run);
  return { ok: true, status: "complete" };
}

export function getReceipt(run) {
  const authority = explainAuthority(run);
  return {
    status: run.complete ? "passed" : run.started ? "running" : "ready",
    gatesPassed: run.gateStates.filter((state) => state === "passed").length,
    agentCompletions: run.gateStates.slice(0, 2).filter((state) => state === "passed").length,
    safeRecoveries: run.safeRecoveries,
    humanHandoffs: run.humanHandoffs,
    unauthorizedAttempts: run.unauthorizedAttempts,
    authority: {
      policyVersion: authority.policyVersion,
      decision: authority.decision,
      actor: authority.actor,
      rule: authority.rule,
      evidence: authority.evidence,
    },
  };
}

export function runAuthorityCounterfactual() {
  const comparisonRun = createRun();
  startRun(comparisonRun);
  completeMagicLink(comparisonRun);

  const stale = issueChallenge(comparisonRun);
  resolveChallenge(comparisonRun, stale.code);
  const fresh = issueChallenge(comparisonRun);
  resolveChallenge(comparisonRun, fresh.code);
  requestHumanPresence(comparisonRun);

  const authority = explainAuthority(comparisonRun);
  const staticCapabilities = [...STATIC_AGENT_CAPABILITIES];
  const compiledCapabilities = [...authority.capabilities];
  const preventedCapabilities = staticCapabilities.filter(
    (name) => !compiledCapabilities.includes(name),
  );

  return {
    baseline: "REGISTER_EVERY_AGENT_TOOL_ONCE",
    verdict: "STATIC_CAPABILITIES_STALE",
    gate: authority.gate,
    rule: authority.rule,
    actor: authority.actor,
    evidence: [...authority.evidence],
    static: {
      capabilities: staticCapabilities,
      exposesHumanConfirmation: staticCapabilities.includes("confirm_human_presence"),
    },
    compiled: {
      capabilities: compiledCapabilities,
      exposesHumanConfirmation: compiledCapabilities.includes("confirm_human_presence"),
    },
    invariants: {
      humanConfirmationRegistered:
        staticCapabilities.includes("confirm_human_presence") ||
        compiledCapabilities.includes("confirm_human_presence"),
    },
    prevented: {
      count: preventedCapabilities.length,
      capabilities: preventedCapabilities,
    },
  };
}
