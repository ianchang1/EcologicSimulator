import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SimulateRequest, SimulateResponse, SimulationResult } from '../../backend/src/types';
import { parseQuery, parseStructuredInput } from '../../backend/src/services/parser';
import { parseQueryWithAI } from '../../backend/src/services/aiParser';
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
  generateNarrativeAsync,
  generateLimitations,
  generateLimitationsAsync,
} from '../../backend/src/services/narrative';
import { getAIConfig, generateCustomScenarioResponse } from '../../backend/src/services/aiService';

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
    const aiConfig = getAIConfig();

    // For natural language queries, try AI parsing first
    if (request.query && aiConfig) {
      console.log('[Simulate] Using AI parser for query:', request.query);

      const aiParseResult = await parseQueryWithAI(request.query);

      if (aiParseResult.success) {
        // Handle custom scenarios (composting, solar panels, etc.)
        if (aiParseResult.isCustomScenario && aiParseResult.scenario) {
          console.log('[Simulate] Custom scenario detected, generating AI response');

          const { baseline, change, frequency, frequencyUnit } = aiParseResult.scenario;

          // Generate narrative and limitations using AI
          const customResponse = await generateCustomScenarioResponse(
            baseline,
            change,
            frequency,
            frequencyUnit
          );

          const customResult: SimulationResult = {
            graph: { nodes: [], edges: [] },
            propagationSteps: [],
            totals: {
              carbon: { value: 0, unit: 'kg CO₂e/week', confidence: 0.5, breakdown: [] },
              water: { value: 0, unit: 'liters/week', confidence: 0.5, breakdown: [] },
              waste: { value: 0, unit: 'kg/week', confidence: 0.5, breakdown: [] },
            },
            firstOrderEffects: [],
            downstreamEffects: [],
            reboundEffects: [],
            topDrivers: [],
            narrative: customResponse.narrative,
            assumptions: [],
            limitations: customResponse.limitations,
            scenarioType: 'food_substitution', // placeholder
            simulatedAt: new Date().toISOString(),
          };

          return res.json({
            success: true,
            result: customResult,
            parseInfo: {
              detectedType: 'custom',
              extractedParams: {
                baseline,
                change,
                frequency,
                frequencyUnit,
                adoptionRate: aiParseResult.scenario.adoptionRate || 1,
              },
              filledDefaults: aiParseResult.filledDefaults,
              aiParsed: true,
            },
          });
        }

        // For known scenario types, continue with simulation
        if (aiParseResult.scenario) {
          console.log('[Simulate] AI parsed scenario:', aiParseResult.scenario.scenarioType);
          return await runSimulation(req, res, aiParseResult.scenario, aiParseResult.filledDefaults, true);
        }
      } else {
        console.log('[Simulate] AI parsing failed, falling back to keyword parser:', aiParseResult.error);
      }
    }

    // Fallback: Use keyword-based parser
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

    return await runSimulation(req, res, parseResult.scenario, parseResult.filledDefaults, false);

  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
}

async function runSimulation(
  req: VercelRequest,
  res: VercelResponse,
  scenario: any,
  filledDefaults: string[],
  aiParsed: boolean
) {
  const request = req.body as SimulateRequest;
  const aiConfig = getAIConfig();

  // Apply assumption overrides if provided
  if (request.overrides) {
    for (const assumption of scenario.assumptions) {
      if (request.overrides[assumption.id] !== undefined) {
        assumption.value = request.overrides[assumption.id];
      }
    }
  }

  // Build causal graph
  const graph = buildGraph(scenario);

  // Create initial shocks
  const shocks = createShocksFromScenario(
    scenario.scenarioType,
    scenario.baseline,
    scenario.change,
    scenario.frequency,
    scenario.assumptions
  );

  // Propagate through graph
  const propagationResult = propagate(graph, shocks, scenario.assumptions);

  // Scale by timeframe if > 1 week
  const finalGraph = scenario.timeframe > 1
    ? scaleGraphByTimeframe(propagationResult.graph, scenario.timeframe)
    : propagationResult.graph;

  // Calculate aggregates
  const totals = calculateTotals(finalGraph);
  const firstOrderEffects = extractFirstOrderEffects(finalGraph, propagationResult.nodeOrders);
  const downstreamEffects = extractDownstreamEffects(finalGraph, propagationResult.nodeOrders);
  const reboundEffects = extractReboundEffects(finalGraph, propagationResult.nodeOrders, totals);
  const topDrivers = identifyTopDrivers(finalGraph, totals);

  // Generate narrative
  const narrativeContext = {
    scenario,
    totals,
    firstOrderEffects,
    downstreamEffects,
    reboundEffects,
    topDrivers,
  };

  let narrative: string;
  let limitations: string[];

  if (aiConfig) {
    [narrative, limitations] = await Promise.all([
      generateNarrativeAsync(narrativeContext),
      generateLimitationsAsync(scenario),
    ]);
  } else {
    narrative = generateNarrative(narrativeContext);
    limitations = generateLimitations(scenario);
  }

  // Compile result
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
      aiParsed,
    },
  };

  res.json(response);
}
