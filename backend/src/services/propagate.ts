import {
  CausalGraph,
  CausalNode,
  CausalEdge,
  Shock,
  PropagationStep,
  NodeDelta,
  Assumption,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// PROPAGATION ENGINE
// Deterministic simulation of effects through the causal graph
// ═══════════════════════════════════════════════════════════════════════════

interface PropagationConfig {
  maxDepth: number;           // Maximum propagation steps
  epsilon: number;            // Stop when delta < epsilon
  decayFactor: number;        // How much signal decays per step
}

const DEFAULT_CONFIG: PropagationConfig = {
  maxDepth: 5,
  epsilon: 0.001,
  decayFactor: 0.8,
};

interface PropagationResult {
  graph: CausalGraph;                   // Graph with computed deltas
  steps: PropagationStep[];             // Step-by-step trace
  nodeDeltas: Map<string, number>;      // Final delta per node
  nodeOrders: Map<string, number>;      // Which order each node was affected
}

/**
 * Propagate shocks through the causal graph
 *
 * Algorithm:
 * 1. Apply initial shocks to source nodes
 * 2. For each step, find all edges from affected nodes
 * 3. Compute delta for target nodes: sourceDelta * edgeStrength * edgeSign * decayFactor
 * 4. Accumulate deltas (allowing for multiple paths to same node)
 * 5. Stop when maxDepth reached or all deltas < epsilon
 */
export function propagate(
  graph: CausalGraph,
  shocks: Shock[],
  assumptions: Assumption[],
  config: Partial<PropagationConfig> = {}
): PropagationResult {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Build lookup maps for efficient traversal
  const nodeMap = new Map<string, CausalNode>();
  graph.nodes.forEach(node => nodeMap.set(node.id, { ...node, delta: 0, order: 0 }));

  const edgesBySource = new Map<string, CausalEdge[]>();
  graph.edges.forEach(edge => {
    const existing = edgesBySource.get(edge.source) || [];
    existing.push(edge);
    edgesBySource.set(edge.source, existing);
  });

  // Track cumulative deltas and which step each node was first affected
  const nodeDeltas = new Map<string, number>();
  const nodeOrders = new Map<string, number>();
  const steps: PropagationStep[] = [];

  // Create assumption lookup
  const assumptionMap = new Map<string, number>();
  assumptions.forEach(a => assumptionMap.set(a.id, a.value));

  // Step 0: Apply initial shocks
  const currentDeltas = new Map<string, number>();
  shocks.forEach(shock => {
    currentDeltas.set(shock.nodeId, shock.delta);
    nodeDeltas.set(shock.nodeId, shock.delta);
    nodeOrders.set(shock.nodeId, 1); // First order

    const node = nodeMap.get(shock.nodeId);
    if (node) {
      node.delta = shock.delta;
      node.order = 1;
    }
  });

  // Record step 0
  steps.push(createStep(0, currentDeltas, nodeMap, new Map(), graph));

  // Propagate through the graph
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    const nextDeltas = new Map<string, number>();
    const contributingEdges = new Map<string, string[]>();

    // For each node that changed in the previous step
    for (const [sourceId, sourceDelta] of currentDeltas) {
      if (Math.abs(sourceDelta) < cfg.epsilon) continue;

      // Find all edges from this node
      const edges = edgesBySource.get(sourceId) || [];

      for (const edge of edges) {
        // Skip edges with lag (they activate in future steps)
        if (edge.lagSteps > 0) {
          // Queue for later step
          continue;
        }

        // Calculate delta for target node
        const targetDelta = sourceDelta * edge.sign * edge.strength * cfg.decayFactor;

        if (Math.abs(targetDelta) < cfg.epsilon) continue;

        // Accumulate delta (multiple paths can affect same node)
        const existing = nextDeltas.get(edge.target) || 0;
        nextDeltas.set(edge.target, existing + targetDelta);

        // Track contributing edges
        const existingEdges = contributingEdges.get(edge.target) || [];
        existingEdges.push(edge.id);
        contributingEdges.set(edge.target, existingEdges);
      }
    }

    // Check if we have any significant deltas
    let hasSignificantDelta = false;
    for (const delta of nextDeltas.values()) {
      if (Math.abs(delta) >= cfg.epsilon) {
        hasSignificantDelta = true;
        break;
      }
    }

    if (!hasSignificantDelta) break;

    // Update cumulative deltas and node orders
    for (const [nodeId, delta] of nextDeltas) {
      const existing = nodeDeltas.get(nodeId) || 0;
      nodeDeltas.set(nodeId, existing + delta);

      // Only set order if not already set (first time affected)
      if (!nodeOrders.has(nodeId)) {
        nodeOrders.set(nodeId, depth + 1); // +1 because shocks are order 1
      }

      // Update node in graph
      const node = nodeMap.get(nodeId);
      if (node) {
        node.delta = (node.delta || 0) + delta;
        if (!node.order) node.order = depth + 1;
      }
    }

    // Record this step
    steps.push(createStep(depth, nextDeltas, nodeMap, contributingEdges, graph));

    // Prepare for next iteration
    currentDeltas.clear();
    for (const [nodeId, delta] of nextDeltas) {
      currentDeltas.set(nodeId, delta);
    }
  }

  // Build final graph with all deltas
  const finalNodes = Array.from(nodeMap.values());

  return {
    graph: { nodes: finalNodes, edges: graph.edges },
    steps,
    nodeDeltas,
    nodeOrders,
  };
}

/**
 * Create a propagation step record
 */
function createStep(
  stepNum: number,
  deltas: Map<string, number>,
  nodeMap: Map<string, CausalNode>,
  contributingEdges: Map<string, string[]>,
  graph: CausalGraph
): PropagationStep {
  const affectedNodes: NodeDelta[] = [];

  for (const [nodeId, delta] of deltas) {
    const node = nodeMap.get(nodeId);
    if (!node) continue;

    affectedNodes.push({
      nodeId,
      label: node.label,
      previousValue: (node.baselineValue || 0),
      newValue: (node.baselineValue || 0) + delta,
      delta,
      contributingEdges: contributingEdges.get(nodeId) || [],
    });
  }

  // Calculate cumulative totals
  const cumulativeDelta = { carbon: 0, water: 0, waste: 0 };
  for (const node of nodeMap.values()) {
    if (!node.delta) continue;

    if (node.category === 'emissions') {
      cumulativeDelta.carbon += node.delta;
    } else if (node.category === 'water') {
      cumulativeDelta.water += node.delta;
    } else if (node.category === 'waste') {
      cumulativeDelta.waste += node.delta;
    }
  }

  return {
    step: stepNum,
    affectedNodes,
    cumulativeDelta,
  };
}

/**
 * Convert scenario parameters to initial shocks
 */
export function createShocksFromScenario(
  scenarioType: string,
  baseline: string,
  change: string,
  frequency: number,
  assumptions: Assumption[]
): Shock[] {
  const shocks: Shock[] = [];
  const assumptionMap = new Map<string, number>();
  assumptions.forEach(a => assumptionMap.set(a.id, a.value));

  switch (scenarioType) {
    case 'food_substitution': {
      // Decrease baseline consumption, increase alternative
      const beefPerServing = 0.25; // kg per serving
      const chickenPerServing = 0.2; // kg per serving

      shocks.push({
        nodeId: 'beef_consumption',
        delta: -frequency * beefPerServing,
        unit: 'kg/week',
      });
      shocks.push({
        nodeId: 'chicken_consumption',
        delta: frequency * chickenPerServing,
        unit: 'kg/week',
      });
      break;
    }

    case 'transport_substitution': {
      const tripDistance = assumptionMap.get('trip_distance') || 8;

      shocks.push({
        nodeId: 'rideshare_trips',
        delta: -frequency,
        unit: 'trips/week',
      });
      shocks.push({
        nodeId: 'bike_trips',
        delta: frequency,
        unit: 'trips/week',
      });
      break;
    }

    case 'plastic_ban': {
      const bagsPerWeek = 10; // Baseline plastic bag use
      const adoptionRate = assumptionMap.get('adoption_rate') || 0.8;

      shocks.push({
        nodeId: 'plastic_bag_use',
        delta: -bagsPerWeek * adoptionRate,
        unit: 'bags/week',
      });
      // Split between paper and reusable
      shocks.push({
        nodeId: 'paper_bag_use',
        delta: bagsPerWeek * adoptionRate * 0.3,
        unit: 'bags/week',
      });
      shocks.push({
        nodeId: 'reusable_bag_use',
        delta: bagsPerWeek * adoptionRate * 0.7,
        unit: 'bags/week',
      });
      break;
    }

    case 'reusable_adoption': {
      const bottlesPerWeek = 7; // Baseline disposable bottle use
      const adoptionRate = assumptionMap.get('adoption_rate') || 0.3;

      shocks.push({
        nodeId: 'disposable_bottles',
        delta: -bottlesPerWeek * adoptionRate,
        unit: 'bottles/week',
      });
      shocks.push({
        nodeId: 'reusable_bottle_use',
        delta: bottlesPerWeek * adoptionRate,
        unit: 'fills/week',
      });
      break;
    }
  }

  return shocks;
}

export default propagate;
