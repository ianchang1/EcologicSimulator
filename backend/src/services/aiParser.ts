// ============================================================================
// AI-POWERED PARSER - Uses LLM to understand any environmental query
// ============================================================================

import https from 'https';
import { ParsedScenario, ScenarioType, Assumption } from '../types';
import graphTemplates from '../data/graphTemplates';
import { getAIConfig } from './aiService';

interface AIParseResult {
  success: boolean;
  scenario?: ParsedScenario;
  isCustomScenario?: boolean;
  customResponse?: {
    narrative: string;
    limitations: string[];
  };
  filledDefaults: string[];
  error?: string;
}

interface AIExtractedParams {
  scenarioType: 'food_substitution' | 'transport_substitution' | 'plastic_ban' | 'reusable_adoption' | 'custom';
  baseline: string;
  change: string;
  frequency: number;
  frequencyUnit: 'day' | 'week' | 'month' | 'year';
  adoptionRate: number;
  customNarrative?: string;
  customLimitations?: string[];
}

/**
 * Use AI to parse natural language into structured scenario
 */
export async function parseQueryWithAI(query: string): Promise<AIParseResult> {
  const config = getAIConfig();

  if (!config) {
    return {
      success: false,
      filledDefaults: [],
      error: 'AI not configured',
    };
  }

  const systemPrompt = `You parse environmental queries into structured data. Respond with ONLY valid JSON, no other text.

Scenario types:
- food_substitution: Food changes (beef to chicken, meat to vegetarian)
- transport_substitution: Transport changes (driving to biking, car to bus)
- plastic_ban: Reducing plastic bags
- reusable_adoption: Reusable bottles/containers
- custom: Everything else (composting, solar, energy, water conservation)

JSON format:
{"scenarioType":"...","baseline":"from what","change":"to what","frequency":number,"frequencyUnit":"day|week|month|year","adoptionRate":1}`;

  const userPrompt = `Parse: "${query}"`;

  try {
    const response = await callAI(config, systemPrompt, userPrompt);

    if (!response.success || !response.content) {
      return {
        success: false,
        filledDefaults: [],
        error: response.error || 'AI parsing failed',
      };
    }

    // Parse AI response
    const parsed = parseAIResponse(response.content);
    if (!parsed) {
      console.error('[AI Parser] Failed to parse response:', response.content.substring(0, 500));
      return {
        success: false,
        filledDefaults: [],
        error: 'Failed to parse AI response: ' + response.content.substring(0, 200),
      };
    }

    const filledDefaults: string[] = [];

    // Handle custom scenarios - narrative will be generated separately
    if (parsed.scenarioType === 'custom') {
      return {
        success: true,
        isCustomScenario: true,
        scenario: {
          scenarioType: 'food_substitution', // placeholder for type system
          baseline: parsed.baseline,
          change: parsed.change,
          frequency: parsed.frequency,
          frequencyUnit: parsed.frequencyUnit,
          adoptionRate: parsed.adoptionRate,
          timeframe: 1,
          assumptions: [],
        },
        filledDefaults,
      };
    }

    // Handle known scenario types
    const template = graphTemplates[parsed.scenarioType as ScenarioType];
    const assumptions = template?.defaultAssumptions || [];

    const scenario: ParsedScenario = {
      scenarioType: parsed.scenarioType as ScenarioType,
      baseline: parsed.baseline,
      change: parsed.change,
      frequency: parsed.frequency,
      frequencyUnit: parsed.frequencyUnit,
      adoptionRate: parsed.adoptionRate,
      timeframe: 1,
      assumptions,
    };

    return {
      success: true,
      scenario,
      isCustomScenario: false,
      filledDefaults,
    };

  } catch (error) {
    return {
      success: false,
      filledDefaults: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function parseAIResponse(content: string): AIExtractedParams | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      scenarioType: parsed.scenarioType || 'custom',
      baseline: parsed.baseline || 'current behavior',
      change: parsed.change || 'new behavior',
      frequency: parsed.frequency || 2,
      frequencyUnit: parsed.frequencyUnit || 'week',
      adoptionRate: parsed.adoptionRate ?? 1,
      customNarrative: parsed.customNarrative,
      customLimitations: parsed.customLimitations,
    };
  } catch {
    return null;
  }
}

interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

async function callAI(
  config: { provider: string; apiKey: string; model: string; maxTokens: number; temperature: number },
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  return new Promise((resolve) => {
    if (config.provider === 'anthropic') {
      const requestBody = JSON.stringify({
        model: config.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      const options = {
        hostname: 'api.anthropic.com',
        path: '/v1/messages',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              resolve({ success: false, error: response.error.message });
            } else if (response.content && response.content[0]?.text) {
              resolve({ success: true, content: response.content[0].text });
            } else {
              resolve({ success: false, error: 'Unexpected response format' });
            }
          } catch (e) {
            resolve({ success: false, error: `Parse error: ${e}` });
          }
        });
      });

      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.setTimeout(60000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });

      req.write(requestBody);
      req.end();
    } else {
      // OpenAI
      const requestBody = JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.3, // Lower temperature for more consistent parsing
      });

      const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Length': Buffer.byteLength(requestBody),
        },
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            if (response.error) {
              resolve({ success: false, error: response.error.message });
            } else if (response.choices && response.choices[0]?.message?.content) {
              resolve({ success: true, content: response.choices[0].message.content });
            } else {
              resolve({ success: false, error: 'Unexpected response format' });
            }
          } catch (e) {
            resolve({ success: false, error: `Parse error: ${e}` });
          }
        });
      });

      req.on('error', (e) => resolve({ success: false, error: e.message }));
      req.setTimeout(30000, () => {
        req.destroy();
        resolve({ success: false, error: 'Timeout' });
      });

      req.write(requestBody);
      req.end();
    }
  });
}

export default { parseQueryWithAI };
