// ============================================================================
// AI SERVICE - LLM Integration for Dynamic Narrative Generation
// Supports OpenAI GPT models and Anthropic Claude
// ============================================================================

import https from 'https';

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

export interface AIConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export function getAIConfig(): AIConfig | null {
  // Check for OpenAI first
  if (process.env.OPENAI_API_KEY) {
    return {
      provider: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024', 10),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    };
  }

  // Check for Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return {
      provider: 'anthropic',
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307',
      maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1024', 10),
      temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
    };
  }

  return null;
}

// -----------------------------------------------------------------------------
// Prompt Building
// -----------------------------------------------------------------------------

export interface NarrativePromptData {
  scenarioType: string;
  baseline: string;
  change: string;
  frequency: number;
  frequencyUnit: string;
  adoptionRate?: number;
  totals: {
    carbon: { value: number; unit: string };
    water: { value: number; unit: string };
    waste: { value: number; unit: string };
  };
  firstOrderEffects: Array<{
    label: string;
    delta: number;
    unit: string;
    description: string;
  }>;
  downstreamEffects: Array<{
    label: string;
    delta: number;
    unit: string;
    order: number;
    description: string;
  }>;
  reboundEffects: Array<{
    label: string;
    delta: number;
    unit: string;
    mechanism: string;
    offsetPercentage: number;
  }>;
  topDrivers: Array<{
    label: string;
    influence: number;
    sensitivity: string;
  }>;
}

export function buildNarrativePrompt(data: NarrativePromptData): string {
  const systemPrompt = `You are an environmental education expert who explains ecological impacts in an engaging, clear, and scientifically accurate way. Your role is to help people understand the environmental consequences of their choices.

Guidelines:
- Be conversational but informative
- Explain causal chains clearly (cause -> effect -> secondary effect)
- Use analogies when helpful (e.g., "equivalent to X miles driven")
- Highlight both positive impacts and potential tradeoffs/rebound effects
- Be honest about uncertainty without being dismissive
- Keep the tone encouraging, not preachy
- Structure your response with clear sections
- Use bullet points for multiple effects
- Keep total response under 400 words`;

  const userPrompt = `Generate a narrative explanation for this environmental impact simulation:

## Scenario
Type: ${data.scenarioType.replace(/_/g, ' ')}
Change: Switching from "${data.baseline}" to "${data.change}"
Frequency: ${data.frequency} times per ${data.frequencyUnit}
${data.adoptionRate ? `Adoption rate: ${(data.adoptionRate * 100).toFixed(0)}%` : ''}

## Impact Totals
- Carbon: ${formatValue(data.totals.carbon.value)} ${data.totals.carbon.unit} (${data.totals.carbon.value < 0 ? 'reduction' : 'increase'})
- Water: ${formatValue(data.totals.water.value)} ${data.totals.water.unit} (${data.totals.water.value < 0 ? 'saved' : 'additional'})
- Waste: ${formatValue(data.totals.waste.value)} ${data.totals.waste.unit} (${data.totals.waste.value < 0 ? 'reduction' : 'increase'})

## First-Order Effects (Direct Impacts)
${data.firstOrderEffects.map(e => `- ${e.label}: ${formatDelta(e.delta)} ${e.unit} - ${e.description}`).join('\n')}

## Downstream Effects (Ripple Effects)
${data.downstreamEffects.length > 0
  ? data.downstreamEffects.map(e => `- [Order ${e.order}] ${e.label}: ${formatDelta(e.delta)} ${e.unit} - ${e.description}`).join('\n')
  : 'No significant downstream effects identified.'}

## Rebound Effects (Unintended Consequences)
${data.reboundEffects.length > 0
  ? data.reboundEffects.map(e => `- ${e.label}: ${e.mechanism} (offsets ~${e.offsetPercentage.toFixed(0)}% of benefit)`).join('\n')
  : 'No significant rebound effects identified.'}

## Key Drivers
${data.topDrivers.map(d => `- ${d.label}: ${(d.influence * 100).toFixed(0)}% influence - ${d.sensitivity}`).join('\n')}

Please generate a narrative that:
1. Starts by acknowledging what the user is considering changing
2. Explains the immediate environmental impact
3. Describes the ripple effects through the system (if any)
4. Warns about rebound effects and tradeoffs (if any)
5. Mentions what factors could change the results

Format the response with clear section breaks and use bullet points where appropriate.`;

  return JSON.stringify({ systemPrompt, userPrompt });
}

function formatValue(value: number): string {
  const absValue = Math.abs(value);
  if (absValue >= 1000000) return (value / 1000000).toFixed(1) + 'M';
  if (absValue >= 1000) return (value / 1000).toFixed(1) + 'k';
  if (absValue < 0.01 && absValue > 0) return value.toExponential(1);
  return value.toFixed(2);
}

function formatDelta(delta: number): string {
  const sign = delta >= 0 ? '+' : '';
  return `${sign}${formatValue(delta)}`;
}

// -----------------------------------------------------------------------------
// API Calls
// -----------------------------------------------------------------------------

interface AIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

async function callOpenAI(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: config.maxTokens,
      temperature: config.temperature,
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

    req.on('error', (e) => {
      resolve({ success: false, error: `Request error: ${e.message}` });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.write(requestBody);
    req.end();
  });
}

async function callAnthropic(
  config: AIConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<AIResponse> {
  return new Promise((resolve) => {
    const requestBody = JSON.stringify({
      model: config.model,
      max_tokens: config.maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
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

    req.on('error', (e) => {
      resolve({ success: false, error: `Request error: ${e.message}` });
    });

    req.setTimeout(30000, () => {
      req.destroy();
      resolve({ success: false, error: 'Request timeout' });
    });

    req.write(requestBody);
    req.end();
  });
}

// -----------------------------------------------------------------------------
// Main Export
// -----------------------------------------------------------------------------

export async function generateAINarrative(data: NarrativePromptData): Promise<AIResponse> {
  const config = getAIConfig();

  if (!config) {
    return {
      success: false,
      error: 'No AI API key configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY environment variable.',
    };
  }

  const promptData = buildNarrativePrompt(data);
  const { systemPrompt, userPrompt } = JSON.parse(promptData);

  console.log(`[AI Service] Using ${config.provider} (${config.model}) for narrative generation`);

  if (config.provider === 'openai') {
    return callOpenAI(config, systemPrompt, userPrompt);
  } else {
    return callAnthropic(config, systemPrompt, userPrompt);
  }
}

// -----------------------------------------------------------------------------
// Limitations Generation
// -----------------------------------------------------------------------------

export function buildLimitationsPrompt(
  scenarioType: string,
  baseline: string,
  change: string
): string {
  return `Generate 4-6 brief, specific limitations for an environmental impact simulation that models switching from "${baseline}" to "${change}" in a ${scenarioType.replace(/_/g, ' ')} scenario.

Each limitation should be:
- One sentence
- Specific to this type of scenario
- Honest about data or model uncertainty
- Educational (help users understand what the model doesn't capture)

Return ONLY a JSON array of strings, no other text. Example format:
["Limitation 1.", "Limitation 2.", "Limitation 3."]`;
}

export async function generateAILimitations(
  scenarioType: string,
  baseline: string,
  change: string
): Promise<AIResponse> {
  const config = getAIConfig();

  if (!config) {
    return {
      success: false,
      error: 'No AI API key configured.',
    };
  }

  const systemPrompt = 'You are an environmental science expert. Respond only with valid JSON arrays.';
  const userPrompt = buildLimitationsPrompt(scenarioType, baseline, change);

  if (config.provider === 'openai') {
    return callOpenAI(config, systemPrompt, userPrompt);
  } else {
    return callAnthropic(config, systemPrompt, userPrompt);
  }
}

// -----------------------------------------------------------------------------
// Custom Scenario Generation (for scenarios not in predefined templates)
// -----------------------------------------------------------------------------

export async function generateCustomScenarioResponse(
  baseline: string,
  change: string,
  frequency: number,
  frequencyUnit: string
): Promise<{ narrative: string; limitations: string[] }> {
  const config = getAIConfig();

  if (!config) {
    return {
      narrative: `Switching from "${baseline}" to "${change}" can have various environmental impacts. Without simulation data, we recommend researching specific lifecycle assessments for this change.`,
      limitations: ['AI service not configured - this is a placeholder response.'],
    };
  }

  const systemPrompt = `You are an environmental educator. Generate an engaging, educational response about environmental impacts. Be specific, use numbers when reasonable, and explain cause-and-effect relationships.`;

  const userPrompt = `The user wants to know: "What if I switch from ${baseline} to ${change} (${frequency} times per ${frequencyUnit})?"

Write an environmental impact analysis with these sections:
1. **Immediate Impacts** - Direct environmental effects (carbon, water, waste)
2. **Ripple Effects** - Indirect/downstream impacts
3. **Rebound Effects & Tradeoffs** - Potential downsides or offsetting behaviors
4. **Key Factors** - What would change these results

Keep it educational, around 250-350 words. Use bullet points for clarity. Include approximate numbers where reasonable.`;

  console.log(`[AI Service] Generating custom scenario narrative for: ${baseline} -> ${change}`);

  let narrativeResponse: AIResponse;
  if (config.provider === 'openai') {
    narrativeResponse = await callOpenAI(config, systemPrompt, userPrompt);
  } else {
    narrativeResponse = await callAnthropic(config, systemPrompt, userPrompt);
  }

  // Generate limitations
  const limitationsPrompt = `Generate 4-5 brief limitations for an environmental impact estimate about switching from "${baseline}" to "${change}". Each should be one sentence, specific to this scenario. Return ONLY a JSON array of strings.`;

  let limitationsResponse: AIResponse;
  if (config.provider === 'openai') {
    limitationsResponse = await callOpenAI(config, 'Respond only with a JSON array.', limitationsPrompt);
  } else {
    limitationsResponse = await callAnthropic(config, 'Respond only with a JSON array.', limitationsPrompt);
  }

  let limitations: string[] = ['This is an educational estimate based on general environmental research.'];
  if (limitationsResponse.success && limitationsResponse.content) {
    try {
      const parsed = JSON.parse(limitationsResponse.content);
      if (Array.isArray(parsed)) {
        limitations = parsed;
      }
    } catch {
      // Keep default
    }
  }

  return {
    narrative: narrativeResponse.success && narrativeResponse.content
      ? narrativeResponse.content
      : `Switching from "${baseline}" to "${change}" can have environmental benefits, but specific impacts depend on many factors including your location, frequency, and alternatives available.`,
    limitations,
  };
}

export default {
  generateAINarrative,
  generateAILimitations,
  generateCustomScenarioResponse,
  getAIConfig,
};
