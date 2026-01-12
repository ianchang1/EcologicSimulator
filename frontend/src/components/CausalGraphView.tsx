import { useMemo, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
  Handle,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { motion } from 'framer-motion';
import {
  Leaf, Droplet, Trash2, Factory, ShoppingCart,
  TrendingUp, TrendingDown, AlertCircle, Zap, Home
} from 'lucide-react';
import type { CausalGraph, CausalNode, NodeCategory, PropagationStep } from '../types';

interface CausalGraphViewProps {
  graph: CausalGraph;
  propagationSteps: PropagationStep[];
}

// Category colors and icons
const CATEGORY_CONFIG: Record<NodeCategory, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
  behavior: { bg: 'bg-sunny-50', border: 'border-sunny-300', text: 'text-sunny-700', icon: <Home className="w-4 h-4" /> },
  market: { bg: 'bg-lavender-50', border: 'border-lavender-300', text: 'text-lavender-700', icon: <ShoppingCart className="w-4 h-4" /> },
  emissions: { bg: 'bg-slate-100', border: 'border-slate-400', text: 'text-slate-700', icon: <Factory className="w-4 h-4" /> },
  water: { bg: 'bg-ocean-50', border: 'border-ocean-300', text: 'text-ocean-700', icon: <Droplet className="w-4 h-4" /> },
  waste: { bg: 'bg-coral-50', border: 'border-coral-300', text: 'text-coral-700', icon: <Trash2 className="w-4 h-4" /> },
  rebound: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: <AlertCircle className="w-4 h-4" /> },
  policy: { bg: 'bg-lavender-50', border: 'border-lavender-300', text: 'text-lavender-700', icon: <Factory className="w-4 h-4" /> },
  resource: { bg: 'bg-meadow-50', border: 'border-meadow-300', text: 'text-meadow-700', icon: <Leaf className="w-4 h-4" /> },
  energy: { bg: 'bg-sunny-50', border: 'border-sunny-300', text: 'text-sunny-700', icon: <Zap className="w-4 h-4" /> },
};

// Custom Node Component
function CustomNode({ data }: { data: CausalNode & { isActive?: boolean } }) {
  const config = CATEGORY_CONFIG[data.category] || CATEGORY_CONFIG.behavior;
  const hasDelta = data.delta !== undefined && data.delta !== 0;
  const isPositive = (data.delta || 0) < 0; // Negative delta is good (reduction)

  return (
    <motion.div
      className={`
        px-4 py-3 rounded-2xl border-2 shadow-lg min-w-[140px] max-w-[200px]
        ${config.bg} ${config.border}
        ${data.isActive ? 'ring-4 ring-meadow-400/50' : ''}
      `}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-3 !h-3" />

      <div className="flex items-start gap-2">
        <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm leading-tight ${config.text}`}>
            {data.label}
          </p>
          {hasDelta && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${isPositive ? 'text-meadow-600' : 'text-red-500'}`}>
              {isPositive ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              <span>{data.delta?.toFixed(2)} {data.unit}</span>
            </div>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-3 !h-3" />
    </motion.div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

export default function CausalGraphView({ graph, propagationSteps }: CausalGraphViewProps) {
  const [playbackStep, setPlaybackStep] = useState<number | null>(null);

  // Convert graph to React Flow format
  const { flowNodes, flowEdges } = useMemo(() => {
    // Layout nodes in layers based on order
    const nodesByOrder: Map<number, CausalNode[]> = new Map();
    graph.nodes.forEach(node => {
      const order = node.order || 0;
      const existing = nodesByOrder.get(order) || [];
      existing.push(node);
      nodesByOrder.set(order, existing);
    });

    const flowNodes: Node[] = [];
    const orders = Array.from(nodesByOrder.keys()).sort((a, b) => a - b);

    orders.forEach((order, layerIndex) => {
      const nodesInLayer = nodesByOrder.get(order) || [];
      const layerWidth = nodesInLayer.length * 220;
      const startX = -layerWidth / 2 + 110;

      nodesInLayer.forEach((node, nodeIndex) => {
        flowNodes.push({
          id: node.id,
          type: 'custom',
          position: {
            x: startX + nodeIndex * 220,
            y: layerIndex * 160,
          },
          data: {
            ...node,
            isActive: playbackStep !== null && propagationSteps[playbackStep]?.affectedNodes.some(n => n.nodeId === node.id),
          },
        });
      });
    });

    const flowEdges: Edge[] = graph.edges.map((edge, index) => ({
      id: edge.id || `edge-${index}`,
      source: edge.source,
      target: edge.target,
      animated: edge.sign === 1,
      style: {
        stroke: edge.sign === 1 ? '#22C55E' : '#EF4444',
        strokeWidth: Math.max(2, edge.strength * 4),
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: edge.sign === 1 ? '#22C55E' : '#EF4444',
      },
      label: edge.sign === 1 ? '+' : '−',
      labelStyle: {
        fill: edge.sign === 1 ? '#22C55E' : '#EF4444',
        fontWeight: 'bold',
        fontSize: 16,
      },
      labelBgStyle: {
        fill: 'white',
        fillOpacity: 0.9,
      },
      labelBgPadding: [4, 4] as [number, number],
      labelBgBorderRadius: 8,
    }));

    return { flowNodes, flowEdges };
  }, [graph, playbackStep, propagationSteps]);

  const [nodes, , onNodesChange] = useNodesState(flowNodes);
  const [edges, , onEdgesChange] = useEdgesState(flowEdges);

  return (
    <div className="w-full h-full relative">
      {/* Playback Controls */}
      {propagationSteps.length > 1 && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-700 mb-2">Propagation Playback</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPlaybackStep(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                playbackStep === null ? 'bg-meadow-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {propagationSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setPlaybackStep(index)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  playbackStep === index ? 'bg-ocean-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Step {index}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200">
        <p className="text-sm font-semibold text-slate-700 mb-2">Legend</p>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-meadow-500 rounded"></div>
            <span className="text-slate-600">Positive effect (+)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-1 bg-red-500 rounded"></div>
            <span className="text-slate-600">Negative effect (−)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-sunny-100 border border-sunny-300"></div>
            <span className="text-slate-600">Behavior</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-ocean-100 border border-ocean-300"></div>
            <span className="text-slate-600">Water</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-slate-200 border border-slate-400"></div>
            <span className="text-slate-600">Emissions</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-100 border border-red-300"></div>
            <span className="text-slate-600">Rebound</span>
          </div>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.5}
        className="bg-gradient-to-br from-meadow-50/50 to-ocean-50/50"
      >
        <Background color="#86EFAC" gap={20} size={1} />
        <Controls className="!rounded-xl !shadow-lg" />
      </ReactFlow>
    </div>
  );
}
