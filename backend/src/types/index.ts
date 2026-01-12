// ═══════════════════════════════════════════════════════════════════════════
// ECOLOGIC SIMULATOR - Core Type Definitions
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// Scenario Input Types
// ─────────────────────────────────────────────────────────────────────────────

export type ScenarioType =
  | 'food_substitution'
  | 'transport_substitution'
  | 'plastic_ban'
  | 'reusable_adoption';

export type FrequencyUnit = 'day' | 'week' | 'month' | 'year';

export type NodeCategory =
  | 'behavior'      // User action/choice
  | 'market'        // Supply/demand effects
  | 'emissions'     // Carbon/GHG outputs
  | 'water'         // Water consumption
  | 'waste'         // Solid waste generation
  | 'rebound'       // Unintended consequences
  | 'policy'        // Policy-level effects
  | 'resource'      // Raw material usage
  | 'energy';       // Energy consumption

// ─────────────────────────────────────────────────────────────────────────────
// Parsed Scenario (from user input)
// ─────────────────────────────────────────────────────────────────────────────

export interface ParsedScenario {
  scenarioType: ScenarioType;
  baseline: string;           // What's being replaced (e.g., "beef")
  change: string;             // What it's changing to (e.g., "chicken")
  frequency: number;          // How often (e.g., 2)
  frequencyUnit: FrequencyUnit;
  adoptionRate: number;       // 0-1 for policy scenarios (e.g., 0.3 = 30%)
  geography?: string;         // Optional regional context
  timeframe: number;          // Weeks to simulate
  assumptions: Assumption[];  // Explicit assumptions made
}

export interface Assumption {
  id: string;
  label: string;
  value: number;
  unit: string;
  adjustable: boolean;        // Can user modify this?
  min?: number;
  max?: number;
  source?: string;            // Placeholder for data source
  confidence: number;         // 0-1 epistemic confidence
}

// ─────────────────────────────────────────────────────────────────────────────
// Causal Graph Structure
// ─────────────────────────────────────────────────────────────────────────────

export interface CausalNode {
  id: string;
  label: string;
  category: NodeCategory;
  unit: string;
  description: string;
  baselineValue?: number;     // Initial value before shock
  delta?: number;             // Change after propagation
  order?: number;             // 1 = first-order, 2 = second-order, etc.
}

export interface CausalEdge {
  id: string;
  source: string;             // Source node ID
  target: string;             // Target node ID
  sign: 1 | -1;               // +1 = positive correlation, -1 = negative
  strength: number;           // 0-1 magnitude of influence
  confidence: number;         // 0-1 epistemic confidence
  rationale: string;          // Plain-English justification
  lagSteps: number;           // Delay in propagation (default 0)
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Propagation
// ─────────────────────────────────────────────────────────────────────────────

export interface Shock {
  nodeId: string;
  delta: number;
  unit: string;
}

export interface NodeDelta {
  nodeId: string;
  label: string;
  previousValue: number;
  newValue: number;
  delta: number;
  contributingEdges: string[]; // Edge IDs that contributed
}

export interface PropagationStep {
  step: number;
  affectedNodes: NodeDelta[];
  cumulativeDelta: {
    carbon: number;
    water: number;
    waste: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Results
// ─────────────────────────────────────────────────────────────────────────────

export interface MetricBreakdown {
  nodeId: string;
  label: string;
  contribution: number;
  percentage: number;
}

export interface MetricResult {
  value: number;
  unit: string;
  confidence: number;         // Aggregate confidence
  breakdown: MetricBreakdown[];
}

export interface Effect {
  nodeId: string;
  label: string;
  delta: number;
  unit: string;
  order: number;              // 1, 2, or 3+ (for third and beyond)
  description: string;
}

export interface ReboundEffect extends Effect {
  offsetPercentage: number;   // How much it offsets the primary benefit
  mechanism: string;          // Explanation of the rebound pathway
}

export interface Driver {
  nodeId: string;
  label: string;
  influence: number;          // Relative importance (0-1)
  sensitivity: string;        // What would change the result
}

export interface SimulationTotals {
  carbon: MetricResult;
  water: MetricResult;
  waste: MetricResult;
}

export interface SimulationResult {
  // The causal graph with computed deltas
  graph: CausalGraph;

  // Step-by-step propagation trace
  propagationSteps: PropagationStep[];

  // Aggregated impact metrics
  totals: SimulationTotals;

  // Categorized effects
  firstOrderEffects: Effect[];
  downstreamEffects: Effect[];
  reboundEffects: ReboundEffect[];

  // Analysis
  topDrivers: Driver[];

  // Human-readable output
  narrative: string;

  // Transparency
  assumptions: Assumption[];
  limitations: string[];

  // Metadata
  scenarioType: ScenarioType;
  simulatedAt: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Request/Response
// ─────────────────────────────────────────────────────────────────────────────

export interface SimulateRequest {
  query?: string;             // Natural language input (optional)
  scenario?: Partial<ParsedScenario>; // Structured input
  overrides?: Record<string, number>; // Assumption overrides
}

export interface SimulateResponse {
  success: boolean;
  result?: SimulationResult;
  error?: string;
  parseInfo?: {
    detectedType: ScenarioType;
    extractedParams: Record<string, unknown>;
    filledDefaults: string[];
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Graph Template Definition (for extensibility)
// ─────────────────────────────────────────────────────────────────────────────

export interface GraphTemplate {
  id: ScenarioType;
  name: string;
  description: string;
  nodes: Omit<CausalNode, 'delta' | 'order'>[];
  edges: Omit<CausalEdge, 'id'>[];
  shockNodes: string[];       // Nodes that receive initial shock
  defaultAssumptions: Assumption[];
}
