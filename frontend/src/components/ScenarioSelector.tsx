import { motion } from 'framer-motion';
import { ChefHat, Bike, ShoppingBag, Recycle, Sparkles } from 'lucide-react';
import type { ScenarioOption, ScenarioType } from '../types';

interface ScenarioSelectorProps {
  onSelect: (scenario: ScenarioOption) => void;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: 'food_substitution',
    name: 'Food Swap',
    description: 'What happens when you change what you eat?',
    examples: ['Switch from beef to chicken twice a week'],
    icon: '🍖',
  },
  {
    id: 'transport_substitution',
    name: 'Get Around Different',
    description: 'See how changing your ride affects the planet',
    examples: ['Bike instead of Uber twice a week'],
    icon: '🚲',
  },
  {
    id: 'plastic_ban',
    name: 'Plastic Ban',
    description: 'What if your city banned single-use plastics?',
    examples: ['What if my city bans plastic bags?'],
    icon: '🛍️',
  },
  {
    id: 'reusable_adoption',
    name: 'Go Reusable',
    description: 'The ripple effects of choosing reusable items',
    examples: ['30% of students use reusable bottles'],
    icon: '♻️',
  },
];

const ICONS: Record<ScenarioType, React.ReactNode> = {
  food_substitution: <ChefHat className="w-8 h-8" />,
  transport_substitution: <Bike className="w-8 h-8" />,
  plastic_ban: <ShoppingBag className="w-8 h-8" />,
  reusable_adoption: <Recycle className="w-8 h-8" />,
};

const COLORS: Record<ScenarioType, { bg: string; border: string; text: string; hover: string }> = {
  food_substitution: {
    bg: 'bg-gradient-to-br from-coral-50 to-sunny-50',
    border: 'border-coral-200',
    text: 'text-coral-600',
    hover: 'hover:border-coral-400 hover:shadow-coral-100',
  },
  transport_substitution: {
    bg: 'bg-gradient-to-br from-meadow-50 to-ocean-50',
    border: 'border-meadow-200',
    text: 'text-meadow-600',
    hover: 'hover:border-meadow-400 hover:shadow-meadow-100',
  },
  plastic_ban: {
    bg: 'bg-gradient-to-br from-ocean-50 to-lavender-50',
    border: 'border-ocean-200',
    text: 'text-ocean-600',
    hover: 'hover:border-ocean-400 hover:shadow-ocean-100',
  },
  reusable_adoption: {
    bg: 'bg-gradient-to-br from-sunny-50 to-meadow-50',
    border: 'border-sunny-200',
    text: 'text-sunny-600',
    hover: 'hover:border-sunny-400 hover:shadow-sunny-100',
  },
};

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  return (
    <motion.div
      className="max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-sunny-400" />
          <h2 className="text-2xl font-bold text-slate-800">Pick a Scenario to Explore</h2>
          <Sparkles className="w-6 h-6 text-sunny-400" />
        </div>
        <p className="text-slate-600">Click one to see how small changes create big ripples!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SCENARIOS.map((scenario, index) => {
          const colors = COLORS[scenario.id];
          return (
            <motion.button
              key={scenario.id}
              onClick={() => onSelect(scenario)}
              className={`
                ${colors.bg} ${colors.border} ${colors.hover}
                border-2 rounded-3xl p-6 text-left
                shadow-lg hover:shadow-xl
                transition-all duration-300
                group
              `}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl bg-white/70 ${colors.text} shadow-sm group-hover:scale-110 transition-transform`}>
                  {ICONS[scenario.id]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{scenario.icon}</span>
                    <h3 className="text-xl font-bold text-slate-800">{scenario.name}</h3>
                  </div>
                  <p className="text-slate-600 mt-1">{scenario.description}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs font-medium ${colors.text} bg-white/50 px-3 py-1 rounded-full`}>
                      Try: "{scenario.examples[0]}"
                    </span>
                  </div>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Fun Facts */}
      <motion.div
        className="mt-12 bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-meadow-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="text-lg font-bold text-slate-800 mb-3 text-center">Did you know?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4">
            <span className="text-4xl">🐄</span>
            <p className="text-sm text-slate-600 mt-2">
              A single cow produces about <span className="font-bold text-meadow-600">70-120 kg</span> of methane per year
            </p>
          </div>
          <div className="p-4">
            <span className="text-4xl">💧</span>
            <p className="text-sm text-slate-600 mt-2">
              It takes <span className="font-bold text-ocean-600">15,000 liters</span> of water to produce 1kg of beef
            </p>
          </div>
          <div className="p-4">
            <span className="text-4xl">🍶</span>
            <p className="text-sm text-slate-600 mt-2">
              A reusable bottle needs <span className="font-bold text-sunny-600">~20 uses</span> to offset its carbon footprint
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
