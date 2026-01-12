import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, Sparkles, TreeDeciduous, Droplets,
  Trash2, ArrowRight, Info, AlertTriangle,
  Bike, ShoppingBag, Recycle, ChefHat
} from 'lucide-react';
import './index.css';
import type { SimulationResult, ScenarioType } from './types';
import CausalGraphView from './components/CausalGraphView';
import MetricsDisplay from './components/MetricsDisplay';
import NarrativePanel from './components/NarrativePanel';
import ScenarioSelector from './components/ScenarioSelector';

const SCENARIO_ICONS: Record<ScenarioType, React.ReactNode> = {
  food_substitution: <ChefHat className="w-6 h-6" />,
  transport_substitution: <Bike className="w-6 h-6" />,
  plastic_ban: <ShoppingBag className="w-6 h-6" />,
  reusable_adoption: <Recycle className="w-6 h-6" />,
};

function App() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'graph' | 'metrics' | 'story'>('graph');

  const handleSimulate = async (inputQuery?: string) => {
    const q = inputQuery || query;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });

      const data = await response.json();

      if (data.success && data.result) {
        setResult(data.result);
      } else {
        setError(data.error || 'Something went wrong!');
      }
    } catch (err) {
      setError('Could not connect to the simulation server. Make sure the backend is running!');
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    { text: "Switch from beef to chicken twice a week", icon: <ChefHat className="w-5 h-5" /> },
    { text: "Bike instead of Uber twice a week", icon: <Bike className="w-5 h-5" /> },
    { text: "What if my city bans plastic bags?", icon: <ShoppingBag className="w-5 h-5" /> },
    { text: "30% of students use reusable bottles", icon: <Recycle className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="bg-blob w-96 h-96 bg-meadow-300 top-0 left-0" style={{ animationDelay: '0s' }} />
      <div className="bg-blob w-80 h-80 bg-ocean-300 top-1/2 right-0" style={{ animationDelay: '2s' }} />
      <div className="bg-blob w-72 h-72 bg-sunny-300 bottom-0 left-1/3" style={{ animationDelay: '4s' }} />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <motion.header
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
            >
              <Leaf className="w-12 h-12 text-meadow-500" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-extrabold gradient-text">
              EcoLogic
            </h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="w-10 h-10 text-sunny-400" />
            </motion.div>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See the <span className="font-bold text-meadow-600">invisible chains</span> of cause and effect.
            <br />
            Explore how your choices ripple through the environment!
          </p>
        </motion.header>

        {/* Input Section */}
        <motion.div
          className="max-w-3xl mx-auto mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-meadow-200">
            <label className="block text-lg font-semibold text-slate-700 mb-3">
              What would happen if...
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                placeholder="I switch from beef to chicken twice a week?"
                className="flex-1 px-5 py-4 text-lg rounded-2xl border-2 border-meadow-200 focus:border-meadow-400 focus:outline-none focus:ring-4 focus:ring-meadow-100 transition-all"
              />
              <motion.button
                onClick={() => handleSimulate()}
                disabled={loading || !query.trim()}
                className="px-8 py-4 bg-gradient-to-r from-meadow-500 to-meadow-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-meadow-500/30 hover:shadow-xl hover:shadow-meadow-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  >
                    <Leaf className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <>
                    Explore <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>

            {/* Example Queries */}
            <div className="mt-4">
              <p className="text-sm text-slate-500 mb-2">Try these examples:</p>
              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example, i) => (
                  <motion.button
                    key={i}
                    onClick={() => {
                      setQuery(example.text);
                      handleSimulate(example.text);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ocean-50 to-meadow-50 border border-ocean-200 rounded-full text-sm font-medium text-slate-700 hover:border-meadow-400 hover:shadow-md transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    {example.icon}
                    {example.text}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                <p className="text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
            >
              {/* Tab Navigation */}
              <div className="flex justify-center mb-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-slate-200 flex gap-2">
                  {[
                    { id: 'graph', label: 'Cause & Effect', icon: <TreeDeciduous className="w-5 h-5" /> },
                    { id: 'metrics', label: 'Impact Numbers', icon: <Droplets className="w-5 h-5" /> },
                    { id: 'story', label: 'The Story', icon: <Info className="w-5 h-5" /> },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-meadow-500 to-ocean-500 text-white shadow-lg'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {tab.icon}
                      {tab.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'graph' && (
                    <motion.div
                      key="graph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[600px]"
                    >
                      <CausalGraphView graph={result.graph} propagationSteps={result.propagationSteps} />
                    </motion.div>
                  )}

                  {activeTab === 'metrics' && (
                    <motion.div
                      key="metrics"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8"
                    >
                      <MetricsDisplay
                        totals={result.totals}
                        firstOrderEffects={result.firstOrderEffects}
                        downstreamEffects={result.downstreamEffects}
                        reboundEffects={result.reboundEffects}
                        topDrivers={result.topDrivers}
                      />
                    </motion.div>
                  )}

                  {activeTab === 'story' && (
                    <motion.div
                      key="story"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-8"
                    >
                      <NarrativePanel
                        narrative={result.narrative}
                        assumptions={result.assumptions}
                        limitations={result.limitations}
                        scenarioType={result.scenarioType}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State / Scenario Selector */}
        {!result && !loading && (
          <ScenarioSelector onSelect={(scenario) => {
            setQuery(scenario.examples[0]);
            handleSimulate(scenario.examples[0]);
          }} />
        )}

        {/* Footer */}
        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Leaf className="w-4 h-4 text-meadow-500" />
            EcoLogic Simulator - See the system, not just the choice
            <Leaf className="w-4 h-4 text-meadow-500" />
          </p>
          <p className="mt-2 text-xs">
            Educational tool for systems thinking. Not a prediction engine.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
