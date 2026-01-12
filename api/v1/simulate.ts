import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SimulateRequest, SimulateResponse, SimulationResult } from '../../backend/src/types';
import { parseQuery, parseStructuredInput } from '../../backend/src/services/parser';
import { buildGraph, scaleGraphByTimeframe } from '../../backend/src/services/graphBuilder';
import { propagate, createShocksFromScenario } from '../../backend/src/services/propagate';
import {
  calculateTotals,
  extractFirstOrderEffects,
  extractDownstreamEffects,
  extractReboundEffects,
  identifyTopDrivers,
} from '../../backend/src/services/aggregators';
import {
  generateNarrative,
  generateLimitations,
} from '../../backend/src/services/narrative';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const request = req.body as SimulateRequest;

    // Step 1: Parse input
    let parseResult;
    if (request.query) {
      parseResult = parseQuery(request.query);
    } else if (request.scenario) {
      parseResult = parseStructuredInput(request.scenario);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Must provide either "query" or "scenario" in request body',
      });
    }

    const { scenario, filledDefaults } = parseResult;

    // Step 2: Apply assumption overrides if provided
    if (request.overrides) {
      for (const assumption of scenario.assumptions) {
        if (request.overrides[assumption.id] !== undefined) {
          assumption.value = request.overrides[assumption.id];
        }
      }
    }

    // Step 3: Build causal graph
    const graph = buildGraph(scenario);

    // Step 4: Create initial shocks
    const shocks = createShocksFromScenario(
      scenario.scenarioType,
      scenario.baseline,
      scenario.change,
      scenario.frequency,
      scenario.assumptions
    );

    // Step 5: Propagate through graph
    const propagationResult = propagate(graph, shocks, scenario.assumptions);

    // Step 6: Scale by timeframe if > 1 week
    const finalGraph = scenario.timeframe > 1
      ? scaleGraphByTimeframe(propagationResult.graph, scenario.timeframe)
      : propagationResult.graph;

    // Step 7: Calculate aggregates
    const totals = calculateTotals(finalGraph);
    const firstOrderEffects = extractFirstOrderEffects(finalGraph, propagationResult.nodeOrders);
    const downstreamEffects = extractDownstreamEffects(finalGraph, propagationResult.nodeOrders);
    const reboundEffects = extractReboundEffects(finalGraph, propagationResult.nodeOrders, totals);
    const topDrivers = identifyTopDrivers(finalGraph, totals);

    // Step 8: Generate narrative (template-based for serverless)
    const narrativeContext = {
      scenario,
      totals,
      firstOrderEffects,
      downstreamEffects,
      reboundEffects,
      topDrivers,
    };

    const narrative = generateNarrative(narrativeContext);
    const limitations = generateLimitations(scenario);

    // Step 9: Compile result
    const result: SimulationResult = {
      graph: finalGraph,
      propagationSteps: propagationResult.steps,
      totals,
      firstOrderEffects,
      downstreamEffects,
      reboundEffects,
      topDrivers,
      narrative,
      assumptions: scenario.assumptions,
      limitations,
      scenarioType: scenario.scenarioType,
      simulatedAt: new Date().toISOString(),
    };

    const response: SimulateResponse = {
      success: true,
      result,
      parseInfo: {
        detectedType: scenario.scenarioType,
        extractedParams: {
          baseline: scenario.baseline,
          change: scenario.change,
          frequency: scenario.frequency,
          frequencyUnit: scenario.frequencyUnit,
          adoptionRate: scenario.adoptionRate,
        },
        filledDefaults,
      },
    };

    res.json(response);

  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}
