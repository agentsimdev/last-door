# Trust Continuity

LAST DOOR tests whether a browser agent can preserve the chain of authority as a controlled authentication run changes state.

## Language

**Authority Ontology**:
The shared model of actors, gates, capabilities, evidence facts, and authority rules in a run.
_Avoid_: Permission list, knowledge graph

**Gate**:
A stage of the run with one authority owner and explicit completion evidence.
_Avoid_: Step, screen

**Capability**:
An action the current authority decision allows the browser agent to invoke.
_Avoid_: Button, command

**Evidence Fact**:
A redacted, immutable observation that an authority rule may rely on.
_Avoid_: Log line, secret, credential

**Run Memory**:
The ordered evidence facts accumulated during one mission run.
_Avoid_: Chat history, long-term memory

**Authority Rule**:
A named policy that relates the active gate and run memory to the actor who owns the next action.
_Avoid_: Prompt, heuristic

**Authority Decision**:
An `allow`, `handoff`, or `complete` result that names its rule, actor, evidence, and available capabilities.
_Avoid_: Guess, recommendation

**Handoff**:
The point where the agent stops and asks the person to perform a non-delegable action.
_Avoid_: Approval, fallback
