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

const AUTHORITY_POLICY = {
  id: "identity-recovery",
  label: "Identity recovery",
  audience: "Identity and security teams",
  version: "1",
  humanAction: "confirm_human_presence",
  staticCapabilities: STATIC_AGENT_CAPABILITIES,
  ready: {
    decision: "allow",
    actor: "agent",
    rule: "MISSION_CAN_START",
    capabilities: ["start_auth_mission", "explain_authority_decision", "get_run_receipt"],
  },
  complete: {
    decision: "complete",
    actor: null,
    rule: "RUN_COMPLETE",
    capabilities: ["explain_authority_decision", "get_run_receipt"],
  },
  gates: {
    "magic-link": {
      owner: "agent",
      active: {
        decision: "allow",
        actor: "agent",
        rule: "AGENT_OWNS_ACTIVE_GATE",
        capabilities: [
          "inspect_current_gate",
          "explain_authority_decision",
          "get_run_receipt",
          "complete_controlled_magic_link",
        ],
      },
    },
    "stale-challenge": {
      owner: "agent",
      active: {
        decision: "allow",
        actor: "agent",
        rule: "AGENT_OWNS_ACTIVE_GATE",
        capabilities: [
          "inspect_current_gate",
          "explain_authority_decision",
          "get_run_receipt",
          "wait_for_challenge_event",
          "resolve_current_challenge",
        ],
      },
    },
    "human-presence": {
      owner: "human",
      active: {
        decision: "handoff",
        actor: "human",
        rule: "HUMAN_PRESENCE_REQUIRED",
        capabilities: [
          "inspect_current_gate",
          "explain_authority_decision",
          "get_run_receipt",
          "request_human_presence",
        ],
      },
      waiting: {
        decision: "handoff",
        actor: "human",
        rule: "HUMAN_HANDOFF_PENDING",
        capabilities: [
          "inspect_current_gate",
          "explain_authority_decision",
          "get_run_receipt",
          "get_handoff_status",
        ],
      },
    },
  },
};

const ISOLATED_POLICY_PACKS = [
  {
    id: "high-value-checkout",
    label: "High-value checkout",
    audience: "Commerce teams",
    version: "1",
    humanAction: "confirm_purchase",
    staticCapabilities: [
      "start_checkout_review",
      "search_catalog",
      "update_cart",
      "apply_offer",
      "choose_delivery",
      "request_purchase_approval",
      "inspect_order",
      "explain_authority_decision",
      "get_order_receipt",
      "get_purchase_approval_status",
    ],
    gates: {
      "purchase-approval": {
        owner: "human",
        active: {
          decision: "handoff",
          actor: "human",
          rule: "PURCHASE_APPROVAL_REQUIRED",
          capabilities: [
            "inspect_order",
            "explain_authority_decision",
            "get_order_receipt",
            "request_purchase_approval",
          ],
        },
        waiting: {
          decision: "handoff",
          actor: "human",
          rule: "PURCHASE_APPROVAL_PENDING",
          capabilities: [
            "inspect_order",
            "explain_authority_decision",
            "get_order_receipt",
            "get_purchase_approval_status",
          ],
        },
      },
    },
    snapshot: {
      started: true,
      complete: false,
      gate: "purchase-approval",
      handoffRequested: true,
      evidence: [
        "CART_REVIEWED",
        "TOTAL_CHANGED",
        "RISK_REVIEW_REQUIRED",
        "HUMAN_APPROVAL_REQUESTED",
      ],
    },
  },
  {
    id: "production-change",
    label: "Production change",
    audience: "Developer platform teams",
    version: "1",
    humanAction: "approve_production_change",
    staticCapabilities: [
      "start_change_review",
      "inspect_deployment",
      "run_preflight_checks",
      "prepare_change_plan",
      "request_production_approval",
      "explain_authority_decision",
      "get_change_receipt",
      "get_production_approval_status",
    ],
    gates: {
      "production-approval": {
        owner: "human",
        active: {
          decision: "handoff",
          actor: "human",
          rule: "PRODUCTION_APPROVAL_REQUIRED",
          capabilities: [
            "inspect_deployment",
            "explain_authority_decision",
            "get_change_receipt",
            "request_production_approval",
          ],
        },
        waiting: {
          decision: "handoff",
          actor: "human",
          rule: "PRODUCTION_APPROVAL_PENDING",
          capabilities: [
            "inspect_deployment",
            "explain_authority_decision",
            "get_change_receipt",
            "get_production_approval_status",
          ],
        },
      },
    },
    snapshot: {
      started: true,
      complete: false,
      gate: "production-approval",
      handoffRequested: true,
      evidence: [
        "PREFLIGHT_PASSED",
        "BLAST_RADIUS_REVIEWED",
        "HUMAN_APPROVAL_REQUESTED",
      ],
    },
  },
];

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

function compileAuthority(policy, state) {
  let gate = null;
  let result;

  if (!state.started) result = policy.ready;
  else if (state.complete) result = policy.complete;
  else {
    gate = state.gate;
    const gatePolicy = policy.gates[gate];
    if (!gatePolicy) throw new Error(`Unknown authority gate: ${gate}`);
    result = gatePolicy.owner === "human" && state.handoffRequested
      ? gatePolicy.waiting
      : gatePolicy.active;
  }

  if (!result) throw new Error(`Authority policy is incomplete for gate: ${gate}`);
  return {
    policyVersion: policy.version,
    decision: result.decision,
    actor: result.actor,
    gate,
    rule: result.rule,
    evidence: [...state.evidence],
    capabilities: [...result.capabilities],
  };
}

function authorityState(run) {
  return {
    started: run.started,
    complete: run.complete,
    gate: currentGate(run)?.id ?? null,
    handoffRequested: run.humanRequested,
    evidence: run.evidence,
  };
}

export function explainAuthority(run) {
  return compileAuthority(AUTHORITY_POLICY, authorityState(run));
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

function createHumanBoundaryRun() {
  const comparisonRun = createRun();
  startRun(comparisonRun);
  completeMagicLink(comparisonRun);

  const stale = issueChallenge(comparisonRun);
  resolveChallenge(comparisonRun, stale.code);
  const fresh = issueChallenge(comparisonRun);
  resolveChallenge(comparisonRun, fresh.code);
  requestHumanPresence(comparisonRun);

  return comparisonRun;
}

function policyTransferProof(policy, state) {
  const authority = compileAuthority(policy, state);
  const staticCapabilities = [...policy.staticCapabilities];
  const compiledCapabilities = [...authority.capabilities];
  const preventedCapabilities = staticCapabilities.filter(
    (name) => !compiledCapabilities.includes(name),
  );
  const humanActionRegistered =
    staticCapabilities.includes(policy.humanAction) ||
    compiledCapabilities.includes(policy.humanAction);

  return {
    id: policy.id,
    label: policy.label,
    audience: policy.audience,
    gate: authority.gate,
    decision: authority.decision,
    rule: authority.rule,
    actor: authority.actor,
    evidence: [...authority.evidence],
    humanAction: policy.humanAction,
    humanActionRegistered,
    static: { capabilities: staticCapabilities },
    compiled: { capabilities: compiledCapabilities },
    prevented: {
      count: preventedCapabilities.length,
      capabilities: preventedCapabilities,
    },
  };
}

export function runAuthorityCounterfactual() {
  const comparisonRun = createHumanBoundaryRun();
  const proof = policyTransferProof(AUTHORITY_POLICY, authorityState(comparisonRun));

  return {
    baseline: "REGISTER_EVERY_AGENT_TOOL_ONCE",
    verdict: "STATIC_CAPABILITIES_STALE",
    gate: proof.gate,
    rule: proof.rule,
    actor: proof.actor,
    evidence: [...proof.evidence],
    static: {
      capabilities: [...proof.static.capabilities],
      exposesHumanConfirmation: proof.static.capabilities.includes(AUTHORITY_POLICY.humanAction),
    },
    compiled: {
      capabilities: [...proof.compiled.capabilities],
      exposesHumanConfirmation: proof.compiled.capabilities.includes(AUTHORITY_POLICY.humanAction),
    },
    invariants: {
      humanConfirmationRegistered: proof.humanActionRegistered,
    },
    prevented: {
      count: proof.prevented.count,
      capabilities: [...proof.prevented.capabilities],
    },
  };
}

export function runPolicyTransferMatrix() {
  const identityRun = createHumanBoundaryRun();
  const cases = [
    policyTransferProof(AUTHORITY_POLICY, authorityState(identityRun)),
    ...ISOLATED_POLICY_PACKS.map((policy) => policyTransferProof(policy, policy.snapshot)),
  ];

  return {
    cases,
    totals: {
      policyPacks: cases.length,
      staticCapabilities: cases.reduce((sum, item) => sum + item.static.capabilities.length, 0),
      compiledCapabilities: cases.reduce((sum, item) => sum + item.compiled.capabilities.length, 0),
      staleCapabilitiesRemoved: cases.reduce((sum, item) => sum + item.prevented.count, 0),
      humanActionsRegistered: cases.filter((item) => item.humanActionRegistered).length,
    },
  };
}

export function createPolicyLabManifest(policyId) {
  const proof = runPolicyTransferMatrix().cases.find(({ id }) => id === policyId);
  if (!proof) {
    return {
      ok: false,
      policyId,
      rule: "POLICY_PACK_REJECTED",
      capabilities: [],
    };
  }

  return {
    ok: true,
    scope: "isolated_policy_snapshot",
    policyId: proof.id,
    label: proof.label,
    audience: proof.audience,
    gate: proof.gate,
    decision: proof.decision,
    rule: proof.rule,
    actor: proof.actor,
    evidence: [...proof.evidence],
    humanAction: proof.humanAction,
    humanActionRegistered: proof.humanActionRegistered,
    staticCapabilities: [...proof.static.capabilities],
    capabilities: [...proof.compiled.capabilities],
    removedCapabilities: [...proof.prevented.capabilities],
  };
}
