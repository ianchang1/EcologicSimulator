import { motion } from 'framer-motion';
import { Utensils, Car, ShoppingBag, RefreshCw, ArrowRight } from 'lucide-react';
import type { ScenarioOption, ScenarioType } from '../types';

interface ScenarioSelectorProps {
  onSelect: (scenario: ScenarioOption) => void;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: 'food_substitution',
    name: 'Food Choices',
    description: 'Explore the impact of dietary changes on carbon, water, and land use',
    examples: ['Switch from beef to chicken twice a week'],
    icon: '🍖',
  },
  {
    id: 'transport_substitution',
    name: 'Transportation',
    description: 'Compare emissions from different modes of transportation',
    examples: ['Bike instead of Uber twice a week'],
    icon: '🚲',
  },
  {
    id: 'plastic_ban',
    name: 'Plastic Reduction',
    description: 'Model the effects of reducing single-use plastics',
    examples: ['What if my city bans plastic bags?'],
    icon: '🛍️',
  },
  {
    id: 'reusable_adoption',
    name: 'Reusable Items',
    description: 'Calculate the benefits of switching to reusable products',
    examples: ['30% of students use reusable bottles'],
    icon: '♻️',
  },
];

const ICONS: Record<ScenarioType, React.ReactNode> = {
  food_substitution: <Utensils className="w-5 h-5" />,
  transport_substitution: <Car className="w-5 h-5" />,
  plastic_ban: <ShoppingBag className="w-5 h-5" />,
  reusable_adoption: <RefreshCw className="w-5 h-5" />,
};

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Choose a scenario to explore</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select a category or type your own question above
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SCENARIOS.map((scenario, index) => (
          <motion.button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            className="bg-white border border-gray-200 rounded-lg p-5 text-left hover:border-gray-300 hover:shadow-sm transition-all group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                {ICONS[scenario.id]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{scenario.description}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-emerald-600 group-hover:text-emerald-700">
                  <span className="truncate">Try: {scenario.examples[0]}</span>
                  <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-gray-50 rounded-lg p-5 border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Facts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p>A single cow produces 70-120 kg of methane annually</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p>15,000 liters of water are needed to produce 1kg of beef</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-gray-400">•</span>
            <p>A reusable bottle needs ~20 uses to offset its footprint</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
