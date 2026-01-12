import { motion } from 'framer-motion';
import {
  BookOpen, Lightbulb, AlertCircle, Settings,
  ChefHat, Bike, ShoppingBag, Recycle, CheckCircle2
} from 'lucide-react';
import type { Assumption, ScenarioType } from '../types';

interface NarrativePanelProps {
  narrative: string;
  assumptions: Assumption[];
  limitations: string[];
  scenarioType: ScenarioType;
}

const SCENARIO_INFO: Record<ScenarioType, { icon: React.ReactNode; title: string; color: string }> = {
  food_substitution: {
    icon: <ChefHat className="w-6 h-6" />,
    title: 'Food Substitution',
    color: 'text-coral-500',
  },
  transport_substitution: {
    icon: <Bike className="w-6 h-6" />,
    title: 'Transport Substitution',
    color: 'text-meadow-500',
  },
  plastic_ban: {
    icon: <ShoppingBag className="w-6 h-6" />,
    title: 'Plastic Ban',
    color: 'text-ocean-500',
  },
  reusable_adoption: {
    icon: <Recycle className="w-6 h-6" />,
    title: 'Reusable Adoption',
    color: 'text-sunny-500',
  },
};

export default function NarrativePanel({
  narrative,
  assumptions,
  limitations,
  scenarioType,
}: NarrativePanelProps) {
  const scenarioInfo = SCENARIO_INFO[scenarioType];

  // Parse narrative into sections
  const sections = narrative.split('\n\n').filter(s => s.trim());

  return (
    <div className="space-y-8">
      {/* Scenario Badge */}
      <motion.div
        className="flex items-center gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={`p-3 rounded-2xl bg-slate-100 ${scenarioInfo.color}`}>
          {scenarioInfo.icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">Scenario Type</p>
          <h2 className="text-xl font-bold text-slate-800">{scenarioInfo.title}</h2>
        </div>
      </motion.div>

      {/* Narrative Story */}
      <motion.div
        className="bg-gradient-to-br from-meadow-50 to-ocean-50 rounded-3xl p-6 border border-meadow-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-meadow-600" />
          <h3 className="text-xl font-bold text-slate-800">The Story</h3>
        </div>
        <div className="space-y-4">
          {sections.map((section, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              {section.startsWith('You asked:') ? (
                <div className="bg-white/70 rounded-2xl p-4 border-l-4 border-sunny-400">
                  <p className="text-lg font-medium text-slate-700">{section}</p>
                </div>
              ) : section.startsWith('Here\'s what happens') || section.startsWith('But the story') ? (
                <div className="bg-white/50 rounded-xl p-4">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{section}</p>
                </div>
              ) : section.includes('Watch out') || section.includes('⚠️') ? (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-red-700 leading-relaxed whitespace-pre-wrap">{section}</p>
                </div>
              ) : (
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{section}</p>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Assumptions */}
      <motion.div
        className="bg-sunny-50 rounded-3xl p-6 border border-sunny-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-6 h-6 text-sunny-600" />
          <h3 className="text-xl font-bold text-slate-800">Key Assumptions</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          These values can be adjusted to see how results change
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {assumptions.filter(a => a.adjustable).slice(0, 6).map((assumption, i) => (
            <motion.div
              key={assumption.id}
              className="bg-white/70 rounded-xl p-3 border border-sunny-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.03 }}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium text-slate-700 text-sm">{assumption.label}</span>
                <span className="text-xs text-slate-400">
                  {(assumption.confidence * 100).toFixed(0)}% confident
                </span>
              </div>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-bold text-sunny-600">{assumption.value}</span>
                <span className="text-xs text-slate-500">{assumption.unit}</span>
              </div>
              {assumption.min !== undefined && assumption.max !== undefined && (
                <div className="mt-2 h-1.5 bg-sunny-100 rounded-full">
                  <div
                    className="h-full bg-sunny-400 rounded-full"
                    style={{
                      width: `${((assumption.value - assumption.min) / (assumption.max - assumption.min)) * 100}%`
                    }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Limitations */}
      <motion.div
        className="bg-slate-50 rounded-3xl p-6 border border-slate-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-slate-500" />
          <h3 className="text-xl font-bold text-slate-800">Good to Know</h3>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          This is an educational model. Here are some things to keep in mind:
        </p>
        <ul className="space-y-2">
          {limitations.map((limitation, i) => (
            <motion.li
              key={i}
              className="flex items-start gap-2 text-slate-600"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.02 }}
            >
              <CheckCircle2 className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
              <span className="text-sm">{limitation}</span>
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        className="text-center p-4 bg-lavender-50 rounded-2xl border border-lavender-200"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm text-lavender-700">
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Remember: This is an educational tool for understanding systems, not a prediction engine.
          Real-world results depend on many factors not captured here.
        </p>
      </motion.div>
    </div>
  );
}
