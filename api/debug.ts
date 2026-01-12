import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAIConfig, generateAINarrative } from '../backend/src/services/aiService';
import { parseQueryWithAI } from '../backend/src/services/aiParser';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const aiConfig = getAIConfig();

  // Test AI parser if requested
  if (req.query.parse) {
    const query = req.query.parse as string;
    try {
      const result = await parseQueryWithAI(query);
      return res.json({
        query,
        parseResult: result,
      });
    } catch (error) {
      return res.json({
        query,
        parseError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  // Test AI call if requested
  if (req.query.test === 'true') {
    const testData = {
      scenarioType: 'test',
      baseline: 'driving',
      change: 'biking',
      frequency: 1,
      frequencyUnit: 'week',
      totals: {
        carbon: { value: -1.5, unit: 'kg CO2e/week' },
        water: { value: 0, unit: 'liters/week' },
        waste: { value: -0.5, unit: 'kg/week' },
      },
      firstOrderEffects: [],
      downstreamEffects: [],
      reboundEffects: [],
      topDrivers: [],
    };

    try {
      const result = await generateAINarrative(testData);
      return res.json({
        aiConfig: aiConfig ? { provider: aiConfig.provider, model: aiConfig.model } : null,
        testResult: result,
      });
    } catch (error) {
      return res.json({
        aiConfig: aiConfig ? { provider: aiConfig.provider, model: aiConfig.model } : null,
        testError: error instanceof Error ? error.message : String(error),
      });
    }
  }

  res.json({
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    keyPrefix: process.env.ANTHROPIC_API_KEY?.substring(0, 10) || 'not set',
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    aiConfig: aiConfig ? {
      provider: aiConfig.provider,
      model: aiConfig.model,
      hasKey: !!aiConfig.apiKey,
    } : null,
  });
}
