import { motion } from 'framer-motion';
import { Info, Check, AlertCircle } from 'lucide-react';
import type { Assumption, ScenarioType } from '../types';

interface NarrativePanelProps {
  narrative: string;
  assumptions: Assumption[];
  limitations: string[];
  scenarioType: ScenarioType;
}

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  food_substitution: 'Food Substitution',
  transport_substitution: 'Transportation',
  plastic_ban: 'Plastic Reduction',
  reusable_adoption: 'Reusable Items',
};

export default function NarrativePanel({
  narrative,
  assumptions,
  limitations,
  scenarioType,
}: NarrativePanelProps) {
  // Parse narrative - split by double newlines or markdown headers
  const formatNarrative = (text: string) => {
    // Replace markdown bold with spans
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n- /g, '\n• ');
  };

  return (
    <div className="space-y-8">
      {/* Scenario Label */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Analysis Type</span>
        <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full font-medium">
          {SCENARIO_LABELS[scenarioType]}
        </span>
      </div>

      {/* Main Narrative */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatNarrative(narrative).replace(/\n/g, '<br />') }}
        />
      </motion.div>

      {/* Assumptions */}
      {assumptions.length > 0 && (
        <motion.div
          className="border-t border-gray-200 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-sm font-medium text-gray-900 mb-4">Model Assumptions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assumptions.filter(a => a.adjustable).slice(0, 6).map((assumption) => (
              <div key={assumption.id} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700">{assumption.label}</span>
                  <span className="text-xs text-gray-400">{(assumption.confidence * 100).toFixed(0)}% conf.</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold text-gray-900">{assumption.value}</span>
                  <span className="text-sm text-gray-500">{assumption.unit}</span>
                </div>
                {assumption.min !== undefined && assumption.max !== undefined && (
                  <div className="mt-2">
                    <div className="h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{
                          width: `${((assumption.value - assumption.min) / (assumption.max - assumption.min)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-gray-400">
                      <span>{assumption.min}</span>
                      <span>{assumption.max}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Limitations */}
      {limitations.length > 0 && (
        <motion.div
          className="border-t border-gray-200 pt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">Limitations</h3>
          </div>
          <ul className="space-y-2">
            {limitations.map((limitation, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <Check className="w-4 h-4 text-gray-300 mt-0.5 flex-shrink-0" />
                <span>{limitation}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Disclaimer */}
      <motion.div
        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-500">
            This analysis is for educational purposes only. Real-world environmental impacts depend on many factors including location, supply chains, and individual circumstances that are not fully captured in this model.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
