export type ScenarioType =
  | 'food_substitution'
  | 'transport_substitution'
  | 'plastic_ban'
  | 'reusable_adoption';

export type NodeCategory =
  | 'behavior'
  | 'market'
  | 'emissions'
  | 'water'
  | 'waste'
  | 'rebound'
  | 'policy'
  | 'resource'
  | 'energy';

export interface CausalNode {
  id: string;
  label: string;
  category: NodeCategory;
  unit: string;
  description: string;
  delta?: number;
  order?: number;
}

export interface CausalEdge {
  id: string;
  source: string;
  target: string;
  sign: 1 | -1;
  strength: number;
  confidence: number;
  rationale: string;
  lagSteps: number;
}

export interface CausalGraph {
  nodes: CausalNode[];
  edges: CausalEdge[];
}

export interface MetricBreakdown {
  nodeId: string;
  label: string;
  contribution: number;
  percentage: number;
}

export interface MetricResult {
  value: number;
  unit: string;
  confidence: number;
  breakdown: MetricBreakdown[];
}

export interface Effect {
  nodeId: string;
  label: string;
  delta: number;
  unit: string;
  order: number;
  description: string;
}

export interface ReboundEffect extends Effect {
  offsetPercentage: number;
  mechanism: string;
}

export interface Driver {
  nodeId: string;
  label: string;
  influence: number;
  sensitivity: string;
}

export interface Assumption {
  id: string;
  label: string;
  value: number;
  unit: string;
  adjustable: boolean;
  min?: number;
  max?: number;
  confidence: number;
}

export interface PropagationStep {
  step: number;
  affectedNodes: {
    nodeId: string;
    label: string;
    previousValue: number;
    newValue: number;
    delta: number;
  }[];
  cumulativeDelta: {
    carbon: number;
    water: number;
    waste: number;
  };
}

export interface SimulationResult {
  graph: CausalGraph;
  propagationSteps: PropagationStep[];
  totals: {
    carbon: MetricResult;
    water: MetricResult;
    waste: MetricResult;
  };
  firstOrderEffects: Effect[];
  downstreamEffects: Effect[];
  reboundEffects: ReboundEffect[];
  topDrivers: Driver[];
  narrative: string;
  assumptions: Assumption[];
  limitations: string[];
  scenarioType: ScenarioType;
  simulatedAt: string;
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

export interface ScenarioOption {
  id: ScenarioType;
  name: string;
  description: string;
  examples: string[];
  icon: string;
}
