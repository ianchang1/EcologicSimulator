import {
  CausalGraph,
  CausalNode,
  SimulationTotals,
  MetricResult,
  MetricBreakdown,
  Effect,
  ReboundEffect,
  Driver,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// AGGREGATORS
// Compute summary metrics from simulation results
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate total environmental impact metrics from the simulation graph
 */
export function calculateTotals(graph: CausalGraph): SimulationTotals {
  const carbonBreakdown: MetricBreakdown[] = [];
  const waterBreakdown: MetricBreakdown[] = [];
  const wasteBreakdown: MetricBreakdown[] = [];

  let totalCarbon = 0;
  let totalWater = 0;
  let totalWaste = 0;
  let carbonConfidenceSum = 0;
  let waterConfidenceSum = 0;
  let wasteConfidenceSum = 0;
  let carbonCount = 0;
  let waterCount = 0;
  let wasteCount = 0;

  for (const node of graph.nodes) {
    if (!node.delta || node.delta === 0) continue;

    if (node.category === 'emissions') {
      totalCarbon += node.delta;
      carbonBreakdown.push({
        nodeId: node.id,
        label: node.label,
        contribution: node.delta,
        percentage: 0, // Calculated after
      });
      carbonConfidenceSum += getNodeConfidence(graph, node.id);
      carbonCount++;
    } else if (node.category === 'water') {
      totalWater += node.delta;
      waterBreakdown.push({
        nodeId: node.id,
        label: node.label,
        contribution: node.delta,
        percentage: 0,
      });
      waterConfidenceSum += getNodeConfidence(graph, node.id);
      waterCount++;
    } else if (node.category === 'waste') {
      totalWaste += node.delta;
      wasteBreakdown.push({
        nodeId: node.id,
        label: node.label,
        contribution: node.delta,
        percentage: 0,
      });
      wasteConfidenceSum += getNodeConfidence(graph, node.id);
      wasteCount++;
    }
  }

  // Calculate percentages
  calculatePercentages(carbonBreakdown, totalCarbon);
  calculatePercentages(waterBreakdown, totalWater);
  calculatePercentages(wasteBreakdown, totalWaste);

  return {
    carbon: {
      value: totalCarbon,
      unit: 'kg CO₂e/week',
      confidence: carbonCount > 0 ? carbonConfidenceSum / carbonCount : 0,
      breakdown: carbonBreakdown.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
    },
    water: {
      value: totalWater,
      unit: 'liters/week',
      confidence: waterCount > 0 ? waterConfidenceSum / waterCount : 0,
      breakdown: waterBreakdown.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
    },
    waste: {
      value: totalWaste,
      unit: 'kg/week',
      confidence: wasteCount > 0 ? wasteConfidenceSum / wasteCount : 0,
      breakdown: wasteBreakdown.sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
    },
  };
}

function calculatePercentages(breakdown: MetricBreakdown[], total: number): void {
  if (total === 0) return;
  const absTotal = Math.abs(total);
  for (const item of breakdown) {
    item.percentage = (Math.abs(item.contribution) / absTotal) * 100;
  }
}

function getNodeConfidence(graph: CausalGraph, nodeId: string): number {
  // Average confidence of all edges leading to this node
  const incomingEdges = graph.edges.filter(e => e.target === nodeId);
  if (incomingEdges.length === 0) return 0.5; // Default confidence for shock nodes
  return incomingEdges.reduce((sum, e) => sum + e.confidence, 0) / incomingEdges.length;
}

/**
 * Extract first-order effects (nodes directly connected to shock nodes)
 */
export function extractFirstOrderEffects(
  graph: CausalGraph,
  nodeOrders: Map<string, number>
): Effect[] {
  const effects: Effect[] = [];

  for (const node of graph.nodes) {
    const order = nodeOrders.get(node.id);
    if (order === 1 && node.delta) {
      effects.push({
        nodeId: node.id,
        label: node.label,
        delta: node.delta,
        unit: node.unit,
        order: 1,
        description: describeEffect(node),
      });
    }
  }

  return effects.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Extract downstream effects (second-order and beyond)
 */
export function extractDownstreamEffects(
  graph: CausalGraph,
  nodeOrders: Map<string, number>
): Effect[] {
  const effects: Effect[] = [];

  for (const node of graph.nodes) {
    const order = nodeOrders.get(node.id);
    if (order && order > 1 && node.delta && node.category !== 'rebound') {
      effects.push({
        nodeId: node.id,
        label: node.label,
        delta: node.delta,
        unit: node.unit,
        order: Math.min(order, 3) as 1 | 2 | 3, // Cap at 3 for display
        description: describeEffect(node),
      });
    }
  }

  return effects.sort((a, b) => a.order - b.order || Math.abs(b.delta) - Math.abs(a.delta));
}

/**
 * Extract rebound effects (nodes in the 'rebound' category)
 */
export function extractReboundEffects(
  graph: CausalGraph,
  nodeOrders: Map<string, number>,
  totals: SimulationTotals
): ReboundEffect[] {
  const effects: ReboundEffect[] = [];

  for (const node of graph.nodes) {
    if (node.category === 'rebound' && node.delta) {
      const order = nodeOrders.get(node.id) || 2;

      // Calculate offset percentage (how much does this rebound offset the benefit?)
      let offsetPercentage = 0;
      if (totals.carbon.value !== 0) {
        // If primary effect is negative (good), and rebound is positive (bad)
        offsetPercentage = Math.abs(node.delta / totals.carbon.value) * 100;
      }

      effects.push({
        nodeId: node.id,
        label: node.label,
        delta: node.delta,
        unit: node.unit,
        order: Math.min(order, 3) as 1 | 2 | 3,
        description: describeEffect(node),
        offsetPercentage,
        mechanism: describeReboundMechanism(node),
      });
    }
  }

  return effects;
}

/**
 * Identify top drivers of the overall impact
 */
export function identifyTopDrivers(
  graph: CausalGraph,
  totals: SimulationTotals,
  limit: number = 5
): Driver[] {
  const drivers: Driver[] = [];

  // Combine all impact nodes
  for (const node of graph.nodes) {
    if (!node.delta || node.delta === 0) continue;
    if (!['emissions', 'water', 'waste'].includes(node.category)) continue;

    // Calculate influence based on contribution to totals
    let influence = 0;
    if (node.category === 'emissions' && totals.carbon.value !== 0) {
      influence = Math.abs(node.delta / totals.carbon.value);
    } else if (node.category === 'water' && totals.water.value !== 0) {
      influence = Math.abs(node.delta / totals.water.value) * 0.5; // Water weighted less
    } else if (node.category === 'waste' && totals.waste.value !== 0) {
      influence = Math.abs(node.delta / totals.waste.value) * 0.3; // Waste weighted less
    }

    drivers.push({
      nodeId: node.id,
      label: node.label,
      influence,
      sensitivity: describeSensitivity(node, graph),
    });
  }

  // Sort by influence and return top N
  return drivers
    .sort((a, b) => b.influence - a.influence)
    .slice(0, limit);
}

/**
 * Generate description of an effect
 */
function describeEffect(node: CausalNode): string {
  const direction = node.delta && node.delta > 0 ? 'increases' : 'decreases';
  return `${node.label} ${direction} by ${Math.abs(node.delta || 0).toFixed(2)} ${node.unit}`;
}

/**
 * Describe the mechanism behind a rebound effect
 */
function describeReboundMechanism(node: CausalNode): string {
  switch (node.id) {
    case 'rebound_spending':
      return 'Cost savings from the change may be spent on other goods and services with their own environmental footprint';
    case 'rebound_travel':
      return 'Money saved on transportation may enable additional travel';
    case 'bag_forgetting':
      return 'Reliance on reusable items can lead to single-use purchases when items are forgotten';
    case 'convenience_effect':
      return 'Convenience sometimes overrides sustainable choices, leading to fallback purchases';
    case 'thicker_plastic':
      return 'Bans on thin plastic bags may shift use to heavier "reusable" plastic bags that are rarely reused';
    default:
      return 'Secondary behavioral response that partially offsets the primary benefit';
  }
}

/**
 * Describe what parameters most affect this node's contribution
 */
function describeSensitivity(node: CausalNode, graph: CausalGraph): string {
  // Find incoming edges
  const incomingEdges = graph.edges.filter(e => e.target === node.id);

  if (incomingEdges.length === 0) {
    return 'Sensitive to initial scenario parameters (frequency, adoption rate)';
  }

  // Find the strongest incoming edge
  const strongestEdge = incomingEdges.reduce((max, e) =>
    e.strength > max.strength ? e : max
  );

  const sourceNode = graph.nodes.find(n => n.id === strongestEdge.source);

  if (sourceNode) {
    return `Most sensitive to changes in ${sourceNode.label.toLowerCase()}`;
  }

  return 'Sensitive to upstream causal factors';
}

export default {
  calculateTotals,
  extractFirstOrderEffects,
  extractDownstreamEffects,
  extractReboundEffects,
  identifyTopDrivers,
};
