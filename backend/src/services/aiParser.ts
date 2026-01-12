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

  const systemPrompt = `You are an environmental impact query parser. Your job is to understand what environmental change the user is asking about and extract structured parameters.

Available scenario types:
- food_substitution: Changing from one food to another (e.g., beef to chicken, meat to vegetarian)
- transport_substitution: Changing transportation mode (e.g., driving to biking, car to bus)
- plastic_ban: Reducing single-use plastics (e.g., plastic bags to reusable)
- reusable_adoption: Switching to reusable items (e.g., disposable bottles to reusable)
- custom: For any other environmental action that doesn't fit above (e.g., composting, solar panels, reducing AC usage)

For custom scenarios, you MUST provide a detailed narrative explaining the environmental impact.

Respond ONLY with valid JSON in this exact format:
{
  "scenarioType": "food_substitution" | "transport_substitution" | "plastic_ban" | "reusable_adoption" | "custom",
  "baseline": "what they're switching FROM or current behavior",
  "change": "what they're switching TO or new behavior",
  "frequency": number (times per frequencyUnit),
  "frequencyUnit": "day" | "week" | "month" | "year",
  "adoptionRate": number between 0 and 1 (1 = 100%),
  "customNarrative": "REQUIRED if scenarioType is 'custom' - detailed environmental impact explanation with sections for immediate effects, ripple effects, tradeoffs, and what factors would change results. Make it educational and engaging. Around 300-400 words.",
  "customLimitations": ["REQUIRED if scenarioType is 'custom' - array of 4-6 specific limitations for this scenario"]
}`;

  const userPrompt = `Parse this environmental query and extract the parameters:

"${query}"

Remember:
- If the query is about food choices, use food_substitution
- If about transportation, use transport_substitution
- If about reducing plastic bags specifically, use plastic_ban
- If about water bottles or reusable containers, use reusable_adoption
- For ANYTHING ELSE (composting, energy use, recycling, water conservation, etc.), use "custom" and provide a detailed customNarrative and customLimitations

Extract the actual items/behaviors mentioned. Don't default to generic values - use what the user actually said.`;

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

    // Handle custom scenarios
    if (parsed.scenarioType === 'custom') {
      return {
        success: true,
        isCustomScenario: true,
        customResponse: {
          narrative: parsed.customNarrative || 'Environmental impact analysis not available.',
          limitations: parsed.customLimitations || ['This is an educational estimate.'],
        },
        scenario: {
          scenarioType: 'food_substitution', // placeholder
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
        max_tokens: 2048,
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
      req.setTimeout(30000, () => {
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
        max_tokens: 2048,
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
