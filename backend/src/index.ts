import express, { Request, Response } from 'express';
import cors from 'cors';
import { SimulateRequest, SimulateResponse, SimulationResult } from './types';
import { parseQuery, parseStructuredInput } from './services/parser';
import { buildGraph, scaleGraphByTimeframe } from './services/graphBuilder';
import { propagate, createShocksFromScenario } from './services/propagate';
import {
  calculateTotals,
  extractFirstOrderEffects,
  extractDownstreamEffects,
  extractReboundEffects,
  identifyTopDrivers,
} from './services/aggregators';
import {
  generateNarrative,
  generateNarrativeAsync,
  generateLimitations,
  generateLimitationsAsync,
} from './services/narrative';
import { getAIConfig } from './services/aiService';

// ═══════════════════════════════════════════════════════════════════════════
// ECOLOGIC SIMULATOR - Express Server
// ═══════════════════════════════════════════════════════════════════════════

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'ecologic-simulator' });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/simulate
// Main simulation endpoint
// ─────────────────────────────────────────────────────────────────────────────

app.post('/api/v1/simulate', async (req: Request, res: Response) => {
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

    // Step 8: Generate narrative (uses AI if configured, falls back to templates)
    const narrativeContext = {
      scenario,
      totals,
      firstOrderEffects,
      downstreamEffects,
      reboundEffects,
      topDrivers,
    };

    // Run narrative and limitations generation in parallel if AI is enabled
    const aiConfig = getAIConfig();
    let narrative: string;
    let limitations: string[];

    if (aiConfig) {
      // Use async AI-powered generation
      [narrative, limitations] = await Promise.all([
        generateNarrativeAsync(narrativeContext),
        generateLimitationsAsync(scenario),
      ]);
    } else {
      // Use synchronous template-based generation
      narrative = generateNarrative(narrativeContext);
      limitations = generateLimitations(scenario);
    }

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
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/scenarios
// List available scenario templates
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/v1/scenarios', (_req: Request, res: Response) => {
  const scenarios = [
    {
      id: 'food_substitution',
      name: 'Food Substitution',
      description: 'Switch between different protein sources',
      examples: ['Switch from beef to chicken twice per week'],
      icon: '🍖',
    },
    {
      id: 'transport_substitution',
      name: 'Transport Substitution',
      description: 'Change how you get around',
      examples: ['Bike instead of Uber twice a week'],
      icon: '🚲',
    },
    {
      id: 'plastic_ban',
      name: 'Plastic Ban',
      description: 'Model policy-level plastic restrictions',
      examples: ['What if my city bans single-use plastic bags?'],
      icon: '🛍️',
    },
    {
      id: 'reusable_adoption',
      name: 'Reusable Adoption',
      description: 'Switch from disposable to reusable items',
      examples: ['What if 30% of students use reusable bottles?'],
      icon: '♻️',
    },
  ];

  res.json({ scenarios });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/templates/:id
// Get detailed template info
// ─────────────────────────────────────────────────────────────────────────────

app.get('/api/v1/templates/:id', (req: Request, res: Response) => {
  const { default: templates } = require('./data/graphTemplates');
  const template = templates[req.params.id];

  if (!template) {
    return res.status(404).json({ error: 'Template not found' });
  }

  res.json({
    id: template.id,
    name: template.name,
    description: template.description,
    nodeCount: template.nodes.length,
    edgeCount: template.edges.length,
    adjustableAssumptions: template.defaultAssumptions.filter((a: any) => a.adjustable),
    shockNodes: template.shockNodes,
  });
});

// Start server
app.listen(PORT, () => {
  const aiConfig = getAIConfig();
  const aiStatus = aiConfig
    ? `AI Enabled: ${aiConfig.provider} (${aiConfig.model})`
    : 'AI Disabled: Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable';

  console.log(`
+-----------------------------------------------------------+
|                                                           |
|   EcoLogic Simulator API                                  |
|                                                           |
|   Server running on http://localhost:${PORT}               |
|                                                           |
|   Endpoints:                                              |
|   * POST /api/v1/simulate    Run simulation               |
|   * GET  /api/v1/scenarios   List scenarios               |
|   * GET  /api/v1/templates/:id  Template details          |
|   * GET  /health             Health check                 |
|                                                           |
|   ${aiStatus.padEnd(55)}|
|                                                           |
+-----------------------------------------------------------+
  `);
});

export default app;
