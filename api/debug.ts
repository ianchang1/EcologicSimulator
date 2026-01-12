import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAIConfig } from '../backend/src/services/aiService';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const aiConfig = getAIConfig();

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
