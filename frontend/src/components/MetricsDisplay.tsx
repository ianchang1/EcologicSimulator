import { motion } from 'framer-motion';
import {
  CloudRain, Droplets, Trash2, TrendingDown, TrendingUp,
  AlertTriangle, Zap, ArrowRight
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
  icon,
  label,
  value,
  unit,
  confidence,
  color,
  delay = 0,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  unit: string;
  confidence: number;
  color: 'green' | 'blue' | 'orange';
  delay?: number;
}) {
  const isPositive = value < 0; // Negative is good (reduction)
  const colorClasses = {
    green: { bg: 'bg-meadow-50', border: 'border-meadow-200', text: 'text-meadow-700', bar: 'bg-meadow-500' },
    blue: { bg: 'bg-ocean-50', border: 'border-ocean-200', text: 'text-ocean-700', bar: 'bg-ocean-500' },
    orange: { bg: 'bg-coral-50', border: 'border-coral-200', text: 'text-coral-700', bar: 'bg-coral-500' },
  };
  const c = colorClasses[color];

  return (
    <motion.div
      className={`${c.bg} ${c.border} border-2 rounded-3xl p-6 shadow-lg`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-3 rounded-2xl ${c.bg} ${c.text}`}>
          {icon}
        </div>
        <div>
          <h3 className={`font-bold text-lg ${c.text}`}>{label}</h3>
          <p className="text-xs text-slate-500">Confidence: {(confidence * 100).toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-extrabold ${isPositive ? 'text-meadow-600' : 'text-red-500'}`}>
          {value < 0 ? '' : '+'}{formatNumber(value)}
        </span>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>

      <div className="flex items-center gap-2 mt-2">
        {isPositive ? (
          <>
            <TrendingDown className="w-5 h-5 text-meadow-500" />
            <span className="text-meadow-600 font-medium text-sm">Reduction</span>
          </>
        ) : (
          <>
            <TrendingUp className="w-5 h-5 text-red-500" />
            <span className="text-red-500 font-medium text-sm">Increase</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

function EffectItem({ effect, delay = 0 }: { effect: Effect; delay?: number }) {
  const isPositive = effect.delta < 0;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-slate-100"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className={`p-2 rounded-lg ${isPositive ? 'bg-meadow-100' : 'bg-red-100'}`}>
        {isPositive ? (
          <TrendingDown className={`w-4 h-4 text-meadow-600`} />
        ) : (
          <TrendingUp className={`w-4 h-4 text-red-500`} />
        )}
      </div>
      <div className="flex-1">
        <p className="font-medium text-slate-700">{effect.label}</p>
        <p className="text-xs text-slate-500">Order {effect.order}</p>
      </div>
      <span className={`font-bold ${isPositive ? 'text-meadow-600' : 'text-red-500'}`}>
        {effect.delta < 0 ? '' : '+'}{formatNumber(effect.delta)} {effect.unit}
      </span>
    </motion.div>
  );
}

function ReboundItem({ effect, delay = 0 }: { effect: ReboundEffect; delay?: number }) {
  return (
    <motion.div
      className="p-4 rounded-xl bg-red-50 border border-red-200"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-5 h-5 text-red-500" />
        <span className="font-bold text-red-700">{effect.label}</span>
      </div>
      <p className="text-sm text-red-600 mb-2">{effect.mechanism}</p>
      {effect.offsetPercentage > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-red-500 font-medium">
            Offsets ~{effect.offsetPercentage.toFixed(0)}% of savings
          </span>
        </div>
      )}
    </motion.div>
  );
}

function DriverItem({ driver, index }: { driver: Driver; index: number }) {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl bg-lavender-50 border border-lavender-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <div className="w-10 h-10 rounded-full bg-lavender-500 text-white font-bold flex items-center justify-center">
        {index + 1}
      </div>
      <div className="flex-1">
        <p className="font-bold text-lavender-700">{driver.label}</p>
        <p className="text-sm text-slate-500">{driver.sensitivity}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-lavender-600">{(driver.influence * 100).toFixed(0)}%</p>
        <p className="text-xs text-slate-500">influence</p>
      </div>
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
      {/* Main Metrics */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-sunny-500" />
          Total Impact
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            icon={<CloudRain className="w-6 h-6" />}
            label="Carbon"
            value={totals.carbon.value}
            unit={totals.carbon.unit}
            confidence={totals.carbon.confidence}
            color="green"
            delay={0}
          />
          <MetricCard
            icon={<Droplets className="w-6 h-6" />}
            label="Water"
            value={totals.water.value}
            unit={totals.water.unit}
            confidence={totals.water.confidence}
            color="blue"
            delay={0.1}
          />
          <MetricCard
            icon={<Trash2 className="w-6 h-6" />}
            label="Waste"
            value={totals.waste.value}
            unit={totals.waste.unit}
            confidence={totals.waste.confidence}
            color="orange"
            delay={0.2}
          />
        </div>
      </div>

      {/* Effects Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* First Order Effects */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-sunny-500" />
            Immediate Effects
          </h3>
          <div className="space-y-2">
            {firstOrderEffects.map((effect, i) => (
              <EffectItem key={effect.nodeId} effect={effect} delay={0.05 * i} />
            ))}
          </div>
        </div>

        {/* Downstream Effects */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-ocean-500" />
            <ArrowRight className="w-5 h-5 text-ocean-500 -ml-3" />
            Downstream Effects
          </h3>
          <div className="space-y-2">
            {downstreamEffects.slice(0, 5).map((effect, i) => (
              <EffectItem key={effect.nodeId} effect={effect} delay={0.05 * i} />
            ))}
          </div>
        </div>
      </div>

      {/* Rebound Effects */}
      {reboundEffects.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Watch Out: Rebound Effects
          </h3>
          <div className="space-y-3">
            {reboundEffects.map((effect, i) => (
              <ReboundItem key={effect.nodeId} effect={effect} delay={0.1 * i} />
            ))}
          </div>
        </div>
      )}

      {/* Top Drivers */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-lavender-500" />
          What Matters Most
        </h3>
        <div className="space-y-3">
          {topDrivers.slice(0, 4).map((driver, i) => (
            <DriverItem key={driver.nodeId} driver={driver} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
