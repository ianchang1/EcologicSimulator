import { motion } from 'framer-motion';
import {
  TrendingDown, TrendingUp, AlertTriangle, ArrowRight, ChevronRight
} from 'lucide-react';
import type { MetricResult, Effect, ReboundEffect, Driver } from '../types';

interface MetricsDisplayProps {
  totals: {
    carbon: MetricResult;
    water: MetricResult;
    waste: MetricResult;
  };
  firstOrderEffects: Effect[];
  downstreamEffects: Effect[];
  reboundEffects: ReboundEffect[];
  topDrivers: Driver[];
}

function formatNumber(num: number): string {
  const abs = Math.abs(num);
  if (abs >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (abs >= 1000) return (num / 1000).toFixed(1) + 'k';
  if (abs < 0.01 && abs !== 0) return num.toExponential(1);
  return num.toFixed(2);
}

function MetricCard({
  label,
  value,
  unit,
  confidence,
  delay = 0,
}: {
  label: string;
  value: number;
  unit: string;
  confidence: number;
  delay?: number;
}) {
  const isPositive = value < 0; // Negative is good (reduction)

  return (
    <motion.div
      className="bg-white border border-gray-200 rounded-lg p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <span className="text-xs text-gray-400">{(confidence * 100).toFixed(0)}% confidence</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
          {value < 0 ? '' : '+'}{formatNumber(value)}
        </span>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      <div className="flex items-center gap-1.5 mt-2">
        {isPositive ? (
          <>
            <TrendingDown className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-emerald-600">Reduction</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600">Increase</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EffectRow({ effect, delay = 0 }: { effect: Effect; delay?: number }) {
  const isPositive = effect.delta < 0;

  return (
    <motion.div
      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${isPositive ? 'bg-emerald-500' : 'bg-red-500'}`} />
        <span className="text-sm text-gray-700">{effect.label}</span>
      </div>
      <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {effect.delta < 0 ? '' : '+'}{formatNumber(effect.delta)} {effect.unit}
      </span>
    </motion.div>
  );
}

export default function MetricsDisplay({
  totals,
  firstOrderEffects,
  downstreamEffects,
  reboundEffects,
  topDrivers,
}: MetricsDisplayProps) {
  return (
    <div className="space-y-8">
      {/* Summary Metrics */}
      <div>
        <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">
          Impact Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            label="Carbon Emissions"
            value={totals.carbon.value}
            unit={totals.carbon.unit}
            confidence={totals.carbon.confidence}
            delay={0}
          />
          <MetricCard
            label="Water Usage"
            value={totals.water.value}
            unit={totals.water.unit}
            confidence={totals.water.confidence}
            delay={0.05}
          />
          <MetricCard
            label="Waste Generated"
            value={totals.waste.value}
            unit={totals.waste.unit}
            confidence={totals.waste.confidence}
            delay={0.1}
          />
        </div>
      </div>

      {/* Effects Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immediate Effects */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">Immediate Effects</h3>
          </div>
          <div>
            {firstOrderEffects.map((effect, i) => (
              <EffectRow key={effect.nodeId} effect={effect} delay={0.02 * i} />
            ))}
          </div>
        </div>

        {/* Downstream Effects */}
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <ChevronRight className="w-4 h-4 text-gray-400 -ml-3" />
            <h3 className="text-sm font-medium text-gray-900">Downstream Effects</h3>
          </div>
          <div>
            {downstreamEffects.slice(0, 6).map((effect, i) => (
              <EffectRow key={effect.nodeId} effect={effect} delay={0.02 * i} />
            ))}
          </div>
        </div>
      </div>

      {/* Rebound Effects Warning */}
      {reboundEffects.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-medium text-amber-900">Potential Rebound Effects</h3>
          </div>
          <div className="space-y-3">
            {reboundEffects.map((effect) => (
              <div key={effect.nodeId} className="text-sm">
                <p className="font-medium text-amber-800">{effect.label}</p>
                <p className="text-amber-700 mt-1">{effect.mechanism}</p>
                {effect.offsetPercentage > 0 && (
                  <p className="text-amber-600 mt-1">
                    May offset up to {effect.offsetPercentage.toFixed(0)}% of environmental savings
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Drivers */}
      {topDrivers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-5">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Key Influence Factors</h3>
          <div className="space-y-3">
            {topDrivers.slice(0, 4).map((driver, i) => (
              <div key={driver.nodeId} className="flex items-center gap-4">
                <span className="w-6 h-6 bg-gray-100 rounded text-xs font-medium text-gray-600 flex items-center justify-center">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{driver.label}</p>
                  <p className="text-xs text-gray-500">{driver.sensitivity}</p>
                </div>
                <span className="text-sm text-gray-600">{(driver.influence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
