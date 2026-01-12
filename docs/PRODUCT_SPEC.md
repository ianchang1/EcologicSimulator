# EcoLogic Simulator - Product Specification

## Vision & Purpose

EcoLogic Simulator is an **educational causal modeling tool** designed to help users explore the systemic consequences of lifestyle and policy decisions. It is explicitly **not a prediction engine**—instead, it reveals the web of interconnected effects that ripple through environmental, economic, and social systems when changes are introduced.

The goal is to cultivate systems thinking: helping users understand *how* things are connected, *why* intuitive solutions sometimes backfire, and *where* hidden tradeoffs exist.

---

## Core User Questions

EcoLogic answers questions like:

- **"If I switch from beef to chicken, what actually changes?"** — Reveals land use shifts, water consumption differences, feed crop demands, and potential rebound effects from cost savings.
- **"What happens when a city bans single-use plastics?"** — Maps substitution effects, manufacturing shifts, waste stream changes, and unintended consequences of alternatives.
- **"Are reusable bottles actually better?"** — Explores break-even points, production footprints, washing impacts, and behavioral adoption curves.
- **"Should I bike or take an Uber?"** — Compares direct emissions, infrastructure dependencies, health co-benefits, and systemic effects at scale.

---

## What Users See

| Component | Description |
|-----------|-------------|
| **Causal Graph** | Interactive node-and-edge visualization showing how variables influence each other |
| **First-Order Effects** | Immediate, direct consequences of the input change |
| **Second-Order Effects** | Downstream ripples: what happens because of the first-order effects |
| **Metrics Dashboard** | Quantified impacts across carbon emissions, water usage, and waste generation |
| **Rebound Effects** | Highlighted feedback loops where efficiency gains are offset by behavioral changes |
| **Narrative Explanation** | Plain-language summary of the causal chain and key insights |

---

## Core Modeling Philosophy

1. **Relationships Over Outcomes** — The model prioritizes showing *how* variables connect rather than claiming precise numerical predictions.

2. **Directional Causality** — Each edge in the graph has a clear direction and sign (positive/negative influence), making reasoning transparent.

3. **Explicit Assumptions** — Every parameter, relationship strength, and boundary condition is visible and adjustable by users.

4. **Uncertainty Surfacing** — The system acknowledges what it doesn't know, distinguishing between well-established relationships and speculative connections.

---

## Core Abstraction

```
INPUT → SHOCK → CAUSAL GRAPH → PROPAGATION → EXPLANATION
```

| Stage | Description |
|-------|-------------|
| **INPUT** | User-defined scenario (e.g., "Replace 50% of beef consumption with chicken") |
| **SHOCK** | Quantified change applied to entry nodes in the system |
| **CAUSAL GRAPH** | Structured network of environmental, economic, and social variables |
| **PROPAGATION** | Algorithm that traces effects through the graph, respecting feedback loops |
| **EXPLANATION** | Generated narrative and visualization of cascading consequences |

---

## Target Users

- **Students** — Learning environmental science, economics, or systems thinking
- **Educators** — Teaching interconnected thinking and unintended consequences
- **Policy Analysts** — Exploring second-order effects of proposed interventions
- **Curious Citizens** — Understanding the real complexity behind "simple" choices

---

## Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Transparency** | All model logic, data sources, and assumptions are inspectable |
| **Interpretability** | Every output can be traced back through the causal chain |
| **Extensibility** | Users and researchers can add new nodes, edges, and scenarios |
| **No ML Black Boxes** | Deterministic, rule-based propagation—no opaque neural networks |

---

## MVP Scope

The minimum viable product includes **four scenario templates**:

1. **Food Substitution** — Model dietary shifts (e.g., beef → chicken → plant-based) and their cascading environmental effects

2. **Transport Substitution** — Compare mobility choices (car → rideshare → bike → public transit) across emissions, infrastructure, and health

3. **Plastic Ban** — Simulate single-use plastic restrictions and trace substitution effects through waste and manufacturing systems

4. **Reusable Bottle Adoption** — Analyze the lifecycle tradeoffs of switching from disposable to reusable containers

Each template includes a pre-built causal graph, adjustable parameters, and guided exploration prompts.

---

*EcoLogic Simulator: See the system, not just the choice.*
