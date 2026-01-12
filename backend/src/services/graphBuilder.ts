import {
  CausalGraph,
  CausalNode,
  CausalEdge,
  ParsedScenario,
  GraphTemplate,
} from '../types';
import graphTemplates from '../data/graphTemplates';

// ═══════════════════════════════════════════════════════════════════════════
// GRAPH BUILDER
// Constructs causal graphs from templates based on scenario parameters
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Build a causal graph for the given scenario
 */
export function buildGraph(scenario: ParsedScenario): CausalGraph {
  const template = graphTemplates[scenario.scenarioType];

  if (!template) {
    throw new Error(`Unknown scenario type: ${scenario.scenarioType}`);
  }

  return instantiateTemplate(template, scenario);
}

/**
 * Instantiate a graph template with scenario-specific values
 */
function instantiateTemplate(
  template: GraphTemplate,
  scenario: ParsedScenario
): CausalGraph {
  // Create nodes with initial values
  const nodes: CausalNode[] = template.nodes.map(templateNode => ({
    ...templateNode,
    delta: 0,
    order: 0,
  }));

  // Create edges with generated IDs
  const edges: CausalEdge[] = template.edges.map((templateEdge, index) => ({
    ...templateEdge,
    id: `edge_${index}_${templateEdge.source}_${templateEdge.target}`,
  }));

  // Apply scenario-specific adjustments
  applyScenarioAdjustments(nodes, edges, scenario);

  return { nodes, edges };
}

/**
 * Apply adjustments based on scenario parameters
 */
function applyScenarioAdjustments(
  nodes: CausalNode[],
  edges: CausalEdge[],
  scenario: ParsedScenario
): void {
  // Scale edge strengths by adoption rate for policy scenarios
  if (scenario.scenarioType === 'plastic_ban' || scenario.scenarioType === 'reusable_adoption') {
    for (const edge of edges) {
      // First-order edges from behavior nodes are scaled by adoption
      const sourceNode = nodes.find(n => n.id === edge.source);
      if (sourceNode?.category === 'behavior') {
        edge.strength *= scenario.adoptionRate;
      }
    }
  }

  // Apply geography-based adjustments if specified
  if (scenario.geography) {
    applyGeographyAdjustments(edges, scenario.geography);
  }
}

/**
 * Apply geography-specific adjustments to edge strengths
 */
function applyGeographyAdjustments(edges: CausalEdge[], geography: string): void {
  const geoLower = geography.toLowerCase();

  // Example regional adjustments (simplified)
  if (geoLower.includes('california') || geoLower.includes('west coast')) {
    // Lower grid carbon intensity
    for (const edge of edges) {
      if (edge.target.includes('emissions') && edge.source.includes('energy')) {
        edge.strength *= 0.8; // Cleaner grid
        edge.rationale += ' (adjusted for cleaner regional grid)';
      }
    }
  }

  if (geoLower.includes('midwest')) {
    // More beef production locally
    for (const edge of edges) {
      if (edge.source.includes('beef') && edge.target.includes('transport')) {
        edge.strength *= 0.7; // Shorter supply chains
        edge.rationale += ' (adjusted for regional production)';
      }
    }
  }
}

/**
 * Get the shock nodes for a template
 */
export function getShockNodes(scenarioType: string): string[] {
  const template = graphTemplates[scenarioType];
  return template?.shockNodes || [];
}

/**
 * Scale the graph values by timeframe
 */
export function scaleGraphByTimeframe(
  graph: CausalGraph,
  weeksSimulated: number
): CausalGraph {
  const scaledNodes = graph.nodes.map(node => ({
    ...node,
    delta: node.delta ? node.delta * weeksSimulated : 0,
    baselineValue: node.baselineValue ? node.baselineValue * weeksSimulated : undefined,
  }));

  return {
    nodes: scaledNodes,
    edges: graph.edges,
  };
}

/**
 * Get node by ID
 */
export function getNode(graph: CausalGraph, nodeId: string): CausalNode | undefined {
  return graph.nodes.find(n => n.id === nodeId);
}

/**
 * Get all edges from a source node
 */
export function getOutgoingEdges(graph: CausalGraph, nodeId: string): CausalEdge[] {
  return graph.edges.filter(e => e.source === nodeId);
}

/**
 * Get all edges to a target node
 */
export function getIncomingEdges(graph: CausalGraph, nodeId: string): CausalEdge[] {
  return graph.edges.filter(e => e.target === nodeId);
}

/**
 * Calculate the topological order of nodes (for visualization layers)
 */
export function getTopologicalOrder(graph: CausalGraph): Map<string, number> {
  const order = new Map<string, number>();
  const visited = new Set<string>();

  // Find root nodes (no incoming edges)
  const rootNodes = graph.nodes.filter(node =>
    !graph.edges.some(e => e.target === node.id)
  );

  // BFS from root nodes
  let currentLevel = 0;
  let currentNodes = rootNodes.map(n => n.id);

  while (currentNodes.length > 0) {
    const nextNodes: string[] = [];

    for (const nodeId of currentNodes) {
      if (visited.has(nodeId)) continue;
      visited.add(nodeId);
      order.set(nodeId, currentLevel);

      // Find children
      const outgoing = getOutgoingEdges(graph, nodeId);
      for (const edge of outgoing) {
        if (!visited.has(edge.target)) {
          nextNodes.push(edge.target);
        }
      }
    }

    currentNodes = [...new Set(nextNodes)]; // Dedupe
    currentLevel++;
  }

  // Handle any nodes not reached (cycles or disconnected)
  for (const node of graph.nodes) {
    if (!order.has(node.id)) {
      order.set(node.id, currentLevel);
    }
  }

  return order;
}

export default {
  buildGraph,
  getShockNodes,
  scaleGraphByTimeframe,
  getNode,
  getOutgoingEdges,
  getIncomingEdges,
  getTopologicalOrder,
};
