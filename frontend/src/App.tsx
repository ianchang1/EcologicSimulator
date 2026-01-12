import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Leaf, ArrowRight, AlertCircle,
  BarChart3, FileText, GitBranch
} from 'lucide-react';
import './index.css';
import type { SimulationResult } from './types';
import CausalGraphView from './components/CausalGraphView';
import MetricsDisplay from './components/MetricsDisplay';
import NarrativePanel from './components/NarrativePanel';
import ScenarioSelector from './components/ScenarioSelector';

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
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Could not connect to the simulation server');
    } finally {
      setLoading(false);
    }
  };

  const exampleQueries = [
    "Switch from beef to chicken twice a week",
    "Bike instead of driving to work",
    "Start composting food waste",
    "Install solar panels on my roof",
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">EcoLogic</h1>
            <span className="text-sm text-gray-500 ml-2">Environmental Impact Simulator</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Section */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to explore?
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSimulate()}
                placeholder="e.g., What if I switch from beef to chicken twice a week?"
                className="flex-1 px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
              <button
                onClick={() => handleSimulate()}
                disabled={loading || !query.trim()}
                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    Simulate
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Example Queries */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Try:</span>
              {exampleQueries.map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setQuery(example);
                    handleSimulate(example);
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  {example}
                </button>
              ))}
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
              className="mb-6"
            >
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-6">
                <nav className="flex gap-8">
                  {[
                    { id: 'graph', label: 'Causal Graph', icon: <GitBranch className="w-4 h-4" /> },
                    { id: 'metrics', label: 'Impact Metrics', icon: <BarChart3 className="w-4 h-4" /> },
                    { id: 'story', label: 'Analysis', icon: <FileText className="w-4 h-4" /> },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as typeof activeTab)}
                      className={`flex items-center gap-2 px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-emerald-500 text-emerald-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <AnimatePresence mode="wait">
                  {activeTab === 'graph' && (
                    <motion.div
                      key="graph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="h-[550px]"
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
                      className="p-6"
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
                      className="p-6"
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
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <p className="text-sm text-gray-500 text-center">
            EcoLogic Simulator - An educational tool for understanding environmental impact chains.
            <br />
            <span className="text-xs text-gray-400">Results are estimates for educational purposes only.</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
