import { ParsedScenario, ScenarioType, Assumption } from '../types';
import graphTemplates from '../data/graphTemplates';

// ═══════════════════════════════════════════════════════════════════════════
// INPUT PARSER
// Lightweight NLP to convert user input to structured scenarios
// ═══════════════════════════════════════════════════════════════════════════

interface ParseResult {
  scenario: ParsedScenario;
  filledDefaults: string[];
  warnings: string[];
}

// Keywords for scenario classification
const FOOD_KEYWORDS = ['beef', 'chicken', 'pork', 'fish', 'meat', 'vegetarian', 'vegan', 'food', 'eat', 'meal', 'diet'];
const TRANSPORT_KEYWORDS = ['uber', 'lyft', 'rideshare', 'bike', 'bicycle', 'car', 'drive', 'bus', 'transit', 'walk', 'commute', 'trip'];
const PLASTIC_KEYWORDS = ['plastic', 'bag', 'ban', 'single-use', 'disposable', 'packaging'];
const REUSABLE_KEYWORDS = ['bottle', 'water', 'reusable', 'tumbler', 'cup', 'container'];

// Frequency patterns
const FREQUENCY_PATTERNS = [
  { pattern: /once\s+(?:a|per)\s+(\w+)/i, frequency: 1 },
  { pattern: /twice\s+(?:a|per)\s+(\w+)/i, frequency: 2 },
  { pattern: /(\d+)\s*(?:times?\s+)?(?:a|per)\s+(\w+)/i, extract: true },
  { pattern: /every\s+day/i, frequency: 7, unit: 'week' },
  { pattern: /daily/i, frequency: 7, unit: 'week' },
  { pattern: /weekly/i, frequency: 1, unit: 'week' },
];

// Percentage patterns
const PERCENTAGE_PATTERN = /(\d+)\s*%/;

/**
 * Parse natural language query into structured scenario
 */
export function parseQuery(query: string): ParseResult {
  const lowerQuery = query.toLowerCase();
  const filledDefaults: string[] = [];
  const warnings: string[] = [];

  // Step 1: Classify scenario type
  const scenarioType = classifyScenario(lowerQuery);

  // Step 2: Extract parameters
  const frequency = extractFrequency(lowerQuery);
  const adoptionRate = extractAdoptionRate(lowerQuery);
  const { baseline, change } = extractSubstitution(lowerQuery, scenarioType);

  // Step 3: Fill defaults
  const template = graphTemplates[scenarioType];
  const assumptions = template?.defaultAssumptions || [];

  // Track what we defaulted
  if (frequency.wasDefault) filledDefaults.push(`Frequency defaulted to ${frequency.value} per ${frequency.unit}`);
  if (adoptionRate.wasDefault) filledDefaults.push(`Adoption rate defaulted to ${(adoptionRate.value * 100).toFixed(0)}%`);

  const scenario: ParsedScenario = {
    scenarioType,
    baseline,
    change,
    frequency: frequency.value,
    frequencyUnit: frequency.unit as 'day' | 'week' | 'month' | 'year',
    adoptionRate: adoptionRate.value,
    timeframe: 1, // Default to 1 week
    assumptions,
  };

  return { scenario, filledDefaults, warnings };
}

/**
 * Classify the scenario type based on keywords
 */
function classifyScenario(query: string): ScenarioType {
  const scores = {
    food_substitution: 0,
    transport_substitution: 0,
    plastic_ban: 0,
    reusable_adoption: 0,
  };

  // Score each category
  for (const keyword of FOOD_KEYWORDS) {
    if (query.includes(keyword)) scores.food_substitution += 2;
  }
  for (const keyword of TRANSPORT_KEYWORDS) {
    if (query.includes(keyword)) scores.transport_substitution += 2;
  }
  for (const keyword of PLASTIC_KEYWORDS) {
    if (query.includes(keyword)) scores.plastic_ban += 2;
  }
  for (const keyword of REUSABLE_KEYWORDS) {
    if (query.includes(keyword)) scores.reusable_adoption += 2;
  }

  // Check for policy-level language
  if (query.includes('ban') || query.includes('policy') || query.includes('city') || query.includes('law')) {
    scores.plastic_ban += 3;
  }

  // Check for individual vs collective
  if (query.includes('i ') || query.includes('my ') || query.includes('me ')) {
    // Individual action - less likely to be policy
    scores.plastic_ban -= 1;
  }

  // Find highest score
  let maxScore = 0;
  let bestType: ScenarioType = 'food_substitution';

  for (const [type, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      bestType = type as ScenarioType;
    }
  }

  return bestType;
}

/**
 * Extract frequency from query
 */
function extractFrequency(query: string): { value: number; unit: string; wasDefault: boolean } {
  for (const { pattern, frequency, unit, extract } of FREQUENCY_PATTERNS) {
    const match = query.match(pattern);
    if (match) {
      if (extract) {
        const num = parseInt(match[1], 10);
        const extractedUnit = normalizeUnit(match[2]);
        return { value: num, unit: extractedUnit, wasDefault: false };
      }
      return { value: frequency!, unit: unit || normalizeUnit(match[1] || 'week'), wasDefault: false };
    }
  }

  // Default
  return { value: 2, unit: 'week', wasDefault: true };
}

/**
 * Normalize time unit string
 */
function normalizeUnit(unit: string): string {
  const lower = unit.toLowerCase();
  if (lower.startsWith('day')) return 'day';
  if (lower.startsWith('week')) return 'week';
  if (lower.startsWith('month')) return 'month';
  if (lower.startsWith('year')) return 'year';
  return 'week';
}

/**
 * Extract adoption rate from query
 */
function extractAdoptionRate(query: string): { value: number; wasDefault: boolean } {
  const match = query.match(PERCENTAGE_PATTERN);
  if (match) {
    const percent = parseInt(match[1], 10);
    return { value: percent / 100, wasDefault: false };
  }

  // Check for qualitative terms
  if (query.includes('everyone') || query.includes('all ')) {
    return { value: 1.0, wasDefault: false };
  }
  if (query.includes('half') || query.includes('50%')) {
    return { value: 0.5, wasDefault: false };
  }
  if (query.includes('most')) {
    return { value: 0.7, wasDefault: false };
  }
  if (query.includes('some')) {
    return { value: 0.3, wasDefault: false };
  }

  // Default for individual scenarios
  return { value: 1.0, wasDefault: true };
}

/**
 * Extract baseline and change items from query
 */
function extractSubstitution(
  query: string,
  scenarioType: ScenarioType
): { baseline: string; change: string } {
  // Look for "from X to Y" pattern
  const fromToMatch = query.match(/from\s+(\w+(?:\s+\w+)?)\s+to\s+(\w+(?:\s+\w+)?)/i);
  if (fromToMatch) {
    return { baseline: fromToMatch[1], change: fromToMatch[2] };
  }

  // Look for "X instead of Y" pattern
  const insteadMatch = query.match(/(\w+(?:\s+\w+)?)\s+instead\s+of\s+(\w+(?:\s+\w+)?)/i);
  if (insteadMatch) {
    return { baseline: insteadMatch[2], change: insteadMatch[1] };
  }

  // Look for "switch/replace X with Y" pattern
  const switchMatch = query.match(/(?:switch|replace)\s+(\w+(?:\s+\w+)?)\s+(?:with|to)\s+(\w+(?:\s+\w+)?)/i);
  if (switchMatch) {
    return { baseline: switchMatch[1], change: switchMatch[2] };
  }

  // Defaults based on scenario type
  switch (scenarioType) {
    case 'food_substitution':
      // Check for specific foods mentioned
      if (query.includes('beef')) return { baseline: 'beef', change: 'chicken' };
      if (query.includes('chicken') && !query.includes('beef')) return { baseline: 'beef', change: 'chicken' };
      return { baseline: 'beef', change: 'chicken' };

    case 'transport_substitution':
      if (query.includes('bike') || query.includes('bicycle')) {
        return { baseline: 'rideshare', change: 'bicycle' };
      }
      if (query.includes('uber') || query.includes('lyft') || query.includes('rideshare')) {
        return { baseline: 'rideshare', change: 'bicycle' };
      }
      return { baseline: 'rideshare', change: 'bicycle' };

    case 'plastic_ban':
      return { baseline: 'plastic bags', change: 'reusable bags' };

    case 'reusable_adoption':
      return { baseline: 'disposable bottles', change: 'reusable bottle' };

    default:
      return { baseline: 'current', change: 'alternative' };
  }
}

/**
 * Parse structured input (already parsed scenario)
 */
export function parseStructuredInput(input: Partial<ParsedScenario>): ParseResult {
  const filledDefaults: string[] = [];
  const warnings: string[] = [];

  // Get template for defaults
  const scenarioType = input.scenarioType || 'food_substitution';
  const template = graphTemplates[scenarioType];

  const scenario: ParsedScenario = {
    scenarioType,
    baseline: input.baseline || getDefaultBaseline(scenarioType),
    change: input.change || getDefaultChange(scenarioType),
    frequency: input.frequency || 2,
    frequencyUnit: input.frequencyUnit || 'week',
    adoptionRate: input.adoptionRate ?? 1.0,
    timeframe: input.timeframe || 1,
    assumptions: input.assumptions || template?.defaultAssumptions || [],
  };

  // Track defaults
  if (!input.frequency) filledDefaults.push('Frequency defaulted to 2');
  if (!input.frequencyUnit) filledDefaults.push('Frequency unit defaulted to week');
  if (input.adoptionRate === undefined) filledDefaults.push('Adoption rate defaulted to 100%');

  return { scenario, filledDefaults, warnings };
}

function getDefaultBaseline(type: ScenarioType): string {
  switch (type) {
    case 'food_substitution': return 'beef';
    case 'transport_substitution': return 'rideshare';
    case 'plastic_ban': return 'plastic bags';
    case 'reusable_adoption': return 'disposable bottles';
  }
}

function getDefaultChange(type: ScenarioType): string {
  switch (type) {
    case 'food_substitution': return 'chicken';
    case 'transport_substitution': return 'bicycle';
    case 'plastic_ban': return 'reusable bags';
    case 'reusable_adoption': return 'reusable bottle';
  }
}

export default {
  parseQuery,
  parseStructuredInput,
};
