import {
  SimulationResult,
  ParsedScenario,
  Effect,
  ReboundEffect,
  Driver,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE GENERATOR
// Produces plain-English explanations of simulation results
// ═══════════════════════════════════════════════════════════════════════════

interface NarrativeContext {
  scenario: ParsedScenario;
  totals: SimulationResult['totals'];
  firstOrderEffects: Effect[];
  downstreamEffects: Effect[];
  reboundEffects: ReboundEffect[];
  topDrivers: Driver[];
}

/**
 * Generate a complete narrative explanation of the simulation
 */
export function generateNarrative(context: NarrativeContext): string {
  const sections: string[] = [];

  // 1. What changed
  sections.push(describeChange(context.scenario));

  // 2. Immediate effects
  sections.push(describeImmediateEffects(context));

  // 3. Key downstream effects
  sections.push(describeDownstreamEffects(context));

  // 4. Tradeoffs and rebound effects
  if (context.reboundEffects.length > 0) {
    sections.push(describeReboundEffects(context));
  }

  // 5. What would change the result
  sections.push(describeSensitivity(context));

  return sections.filter(s => s).join('\n\n');
}

/**
 * Describe what the user changed
 */
function describeChange(scenario: ParsedScenario): string {
  const frequencyText = formatFrequency(scenario.frequency, scenario.frequencyUnit);

  switch (scenario.scenarioType) {
    case 'food_substitution':
      return `You asked: "What if I switch from ${scenario.baseline} to ${scenario.change} ${frequencyText}?"`;

    case 'transport_substitution':
      return `You asked: "What if I switch from ${scenario.baseline} to ${scenario.change} ${frequencyText}?"`;

    case 'plastic_ban':
      return `You asked: "What if ${formatAdoption(scenario.adoptionRate)} of people stop using ${scenario.baseline} and switch to ${scenario.change}?"`;

    case 'reusable_adoption':
      return `You asked: "What if ${formatAdoption(scenario.adoptionRate)} of people switch from ${scenario.baseline} to ${scenario.change}?"`;

    default:
      return `Analyzing the effects of switching from ${scenario.baseline} to ${scenario.change}.`;
  }
}

/**
 * Describe immediate, first-order effects
 */
function describeImmediateEffects(context: NarrativeContext): string {
  const { totals } = context;

  const parts: string[] = ['Here\'s what happens immediately:'];

  // Carbon
  if (totals.carbon.value !== 0) {
    const direction = totals.carbon.value < 0 ? 'reduces' : 'increases';
    const absValue = Math.abs(totals.carbon.value);
    parts.push(`• Carbon footprint ${direction} by ${formatNumber(absValue)} ${totals.carbon.unit}`);
  }

  // Water
  if (totals.water.value !== 0) {
    const direction = totals.water.value < 0 ? 'saves' : 'uses';
    const absValue = Math.abs(totals.water.value);
    parts.push(`• ${direction === 'saves' ? 'Saves' : 'Uses'} ${formatNumber(absValue)} ${totals.water.unit} of water`);
  }

  // Waste
  if (totals.waste.value !== 0) {
    const direction = totals.waste.value < 0 ? 'reduces' : 'increases';
    const absValue = Math.abs(totals.waste.value);
    parts.push(`• Waste ${direction} by ${formatNumber(absValue)} ${totals.waste.unit}`);
  }

  return parts.join('\n');
}

/**
 * Describe downstream cascade effects
 */
function describeDownstreamEffects(context: NarrativeContext): string {
  const { downstreamEffects, topDrivers } = context;

  if (downstreamEffects.length === 0) {
    return '';
  }

  const parts: string[] = ['But the story doesn\'t end there. Here\'s the ripple effect:'];

  // Group by order
  const secondOrder = downstreamEffects.filter(e => e.order === 2);
  const thirdOrder = downstreamEffects.filter(e => e.order === 3);

  if (secondOrder.length > 0) {
    parts.push('\nSecond-order effects (one step removed):');
    for (const effect of secondOrder.slice(0, 3)) {
      const direction = effect.delta < 0 ? '↓' : '↑';
      parts.push(`  ${direction} ${effect.label}: ${formatDelta(effect.delta, effect.unit)}`);
    }
  }

  if (thirdOrder.length > 0) {
    parts.push('\nThird-order effects (further downstream):');
    for (const effect of thirdOrder.slice(0, 2)) {
      const direction = effect.delta < 0 ? '↓' : '↑';
      parts.push(`  ${direction} ${effect.label}: ${formatDelta(effect.delta, effect.unit)}`);
    }
  }

  // Add top driver explanation
  if (topDrivers.length > 0) {
    const topDriver = topDrivers[0];
    parts.push(`\nThe biggest factor? ${topDriver.label} (${(topDriver.influence * 100).toFixed(0)}% of impact).`);
  }

  return parts.join('\n');
}

/**
 * Describe rebound effects and tradeoffs
 */
function describeReboundEffects(context: NarrativeContext): string {
  const { reboundEffects } = context;

  if (reboundEffects.length === 0) {
    return '';
  }

  const parts: string[] = ['⚠️ Watch out for rebound effects:'];

  for (const effect of reboundEffects) {
    parts.push(`\n• ${effect.label}`);
    parts.push(`  ${effect.mechanism}`);
    if (effect.offsetPercentage > 0) {
      parts.push(`  This could offset about ${effect.offsetPercentage.toFixed(0)}% of your savings.`);
    }
  }

  return parts.join('\n');
}

/**
 * Describe sensitivity and what matters most
 */
function describeSensitivity(context: NarrativeContext): string {
  const { topDrivers, scenario } = context;

  const parts: string[] = ['What would change these results?'];

  // Frequency matters
  parts.push(`• Frequency: Doing this ${scenario.frequency > 1 ? 'more' : 'less'} often would scale the impact proportionally.`);

  // Top sensitivities
  if (topDrivers.length > 0) {
    for (const driver of topDrivers.slice(0, 2)) {
      parts.push(`• ${driver.sensitivity}`);
    }
  }

  return parts.join('\n');
}

/**
 * Generate limitations disclaimer
 */
export function generateLimitations(scenario: ParsedScenario): string[] {
  const limitations: string[] = [
    'This is an educational model showing causal relationships, not precise predictions.',
    'Individual results vary based on geography, season, and specific product choices.',
    'Market-level effects (if millions adopt this change) are not modeled.',
    'Supply chain data uses averages; your actual supply chain may differ.',
  ];

  switch (scenario.scenarioType) {
    case 'food_substitution':
      limitations.push('Nutritional differences between foods are not considered.');
      limitations.push('Organic vs. conventional production methods use different values.');
      break;
    case 'transport_substitution':
      limitations.push('Weather and terrain effects on cycling are not modeled.');
      limitations.push('Vehicle type and fuel efficiency vary widely.');
      break;
    case 'plastic_ban':
      limitations.push('Regional waste management infrastructure varies significantly.');
      limitations.push('Consumer compliance with bans is estimated, not measured.');
      break;
    case 'reusable_adoption':
      limitations.push('Reusable item lifetimes depend heavily on user behavior.');
      limitations.push('Washing frequency and method affect the break-even point.');
      break;
  }

  return limitations;
}

// ─────────────────────────────────────────────────────────────────────────────
// Formatting Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatFrequency(freq: number, unit: string): string {
  if (freq === 1) {
    return `once per ${unit}`;
  } else if (freq === 2) {
    return `twice per ${unit}`;
  } else {
    return `${freq} times per ${unit}`;
  }
}

function formatAdoption(rate: number): string {
  const percent = rate * 100;
  if (percent === 100) return 'everyone';
  if (percent >= 50) return `${percent.toFixed(0)}% of people`;
  if (percent >= 10) return `${percent.toFixed(0)}%`;
  return `${percent.toFixed(0)}%`;
}

function formatNumber(num: number): string {
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  if (Math.abs(num) < 0.01) {
    return num.toExponential(1);
  }
  return num.toFixed(2);
}

function formatDelta(delta: number, unit: string): string {
  const direction = delta < 0 ? '' : '+';
  return `${direction}${formatNumber(delta)} ${unit}`;
}

export default {
  generateNarrative,
  generateLimitations,
};
