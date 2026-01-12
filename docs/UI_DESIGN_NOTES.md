# EcoLogic Simulator - UI Design Guide

A comprehensive guide for creating a kid-friendly, vibrant, and engaging educational interface for the EcoLogic Simulator - a systems-thinking tool that visualizes cause-and-effect chains for environmental choices.

**Target Audience:** Students (ages 8-16) and curious citizens interested in environmental systems thinking.

**Design Philosophy:** Bright, welcoming, nature-inspired aesthetics that make complex environmental concepts accessible and engaging without feeling corporate or intimidating.

---

## Table of Contents

1. [Color Palettes](#1-color-palettes)
2. [Typography](#2-typography)
3. [Animation Patterns](#3-animation-patterns)
4. [Icon Guidelines](#4-icon-guidelines)
5. [Data Visualization](#5-data-visualization)
6. [Gamification Elements](#6-gamification-elements)
7. [React/Tailwind Implementation](#7-reacttailwind-implementation)
8. [Component Styling Guidelines](#8-component-styling-guidelines)

---

## 1. Color Palettes

### Primary Nature-Inspired Palette

A vibrant yet calming palette inspired by meadows, forests, and sunny skies.

| Color Name | Hex Code | Usage | Tailwind Class |
|------------|----------|-------|----------------|
| **Forest Green** | `#22C55E` | Primary actions, success states | `green-500` |
| **Sky Blue** | `#38BDF8` | Links, water themes, information | `sky-400` |
| **Sunshine Yellow** | `#FBBF24` | Highlights, energy themes, warnings | `amber-400` |
| **Coral Orange** | `#FB923C` | Secondary actions, warmth, attention | `orange-400` |
| **Lavender Purple** | `#A78BFA` | Special elements, creativity | `violet-400` |

### Extended Color Shades (Custom Tailwind Config)

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary: Forest Meadow Green
        meadow: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',  // Primary
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        // Secondary: Ocean Sky
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',  // Primary
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        // Accent: Sunny Warmth
        sunny: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',  // Primary
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        // Earth Tones for grounding
        earth: {
          50: '#FDF8F6',
          100: '#F2E8E5',
          200: '#EADDD7',
          300: '#E0CEC7',
          400: '#D2BAB0',
          500: '#BFA094',
          600: '#A18072',
          700: '#977669',
          800: '#846358',
          900: '#43302B',
        },
        // Moss for subtle nature accents
        moss: {
          50: '#F5F7F2',
          100: '#E8EDE2',
          200: '#D4DFC8',
          300: '#B5C9A1',
          400: '#8FB174',
          500: '#6B9950',
          600: '#527A3C',
          700: '#415F31',
          800: '#364D2A',
          900: '#2E4125',
        },
      },
    },
  },
}
```

### Semantic Color Usage

```javascript
// Semantic colors for the app
semanticColors: {
  // Positive environmental impact
  positive: '#22C55E',      // meadow-500
  positiveLight: '#DCFCE7', // meadow-100

  // Negative environmental impact
  negative: '#EF4444',      // red-500
  negativeLight: '#FEE2E2', // red-100

  // Neutral/informational
  neutral: '#64748B',       // slate-500
  neutralLight: '#F1F5F9',  // slate-100

  // Warning/attention
  warning: '#FBBF24',       // sunny-400
  warningLight: '#FEF3C7',  // sunny-100

  // Interactive elements
  interactive: '#38BDF8',   // ocean-400
  interactiveHover: '#0EA5E9', // ocean-500
}
```

### Color Combinations for Specific Themes

**Water/Ocean Theme:**
- Primary: `#0EA5E9` (ocean-500)
- Accent: `#7DD3FC` (ocean-300)
- Background: `#F0F9FF` (ocean-50)

**Forest/Plants Theme:**
- Primary: `#16A34A` (meadow-600)
- Accent: `#86EFAC` (meadow-300)
- Background: `#F0FDF4` (meadow-50)

**Energy/Sun Theme:**
- Primary: `#F59E0B` (sunny-500)
- Accent: `#FDE68A` (sunny-200)
- Background: `#FFFBEB` (sunny-50)

**Air Quality Theme:**
- Primary: `#A78BFA` (violet-400)
- Accent: `#C4B5FD` (violet-300)
- Background: `#F5F3FF` (violet-50)

---

## 2. Typography

### Font Recommendations

**Primary Font: Nunito**
- Rounded, friendly sans-serif
- Excellent readability for all ages
- Free via Google Fonts
- Large x-height aids young readers

**Alternative Options:**
- **Quicksand** - Geometric, modern, very friendly
- **Josefin Sans** - Clean with tall x-height
- **Poppins** - Geometric with playful personality

**Specialized Option:**
- **Kermit** (Microsoft) - Designed specifically for children's reading, balancing informality with structure

### Typography Scale

```css
/* Tailwind typography configuration */
fontSize: {
  'xs': ['0.75rem', { lineHeight: '1.5' }],      // 12px - captions
  'sm': ['0.875rem', { lineHeight: '1.5' }],    // 14px - small text
  'base': ['1rem', { lineHeight: '1.6' }],      // 16px - body
  'lg': ['1.125rem', { lineHeight: '1.5' }],    // 18px - large body
  'xl': ['1.25rem', { lineHeight: '1.4' }],     // 20px - intro text
  '2xl': ['1.5rem', { lineHeight: '1.35' }],    // 24px - h4
  '3xl': ['1.875rem', { lineHeight: '1.3' }],   // 30px - h3
  '4xl': ['2.25rem', { lineHeight: '1.25' }],   // 36px - h2
  '5xl': ['3rem', { lineHeight: '1.2' }],       // 48px - h1
}
```

### Font Family Configuration

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        // Primary reading font
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        // Display/heading font (can be same or different)
        display: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        // Monospace for code/data
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
}
```

### Typography Guidelines

1. **Minimum body text size:** 16px (1rem) for accessibility
2. **Heading hierarchy:** Clear visual distinction between levels
3. **Line height:** Generous (1.5-1.6 for body text)
4. **Letter spacing:** Slightly increased for younger readers
5. **Avoid:** Decorative fonts, all caps for long text, thin font weights

### Example Typography Classes

```html
<!-- Headings -->
<h1 class="text-4xl md:text-5xl font-bold text-meadow-700 tracking-tight">
  Welcome to EcoLogic!
</h1>

<h2 class="text-2xl md:text-3xl font-semibold text-slate-800">
  How Does Your Choice Impact the Environment?
</h2>

<!-- Body text -->
<p class="text-base md:text-lg text-slate-600 leading-relaxed">
  Every action has consequences. See how your decisions ripple
  through the ecosystem!
</p>

<!-- Interactive labels -->
<span class="text-sm font-medium text-ocean-600 uppercase tracking-wide">
  Click to explore
</span>
```

---

## 3. Animation Patterns

### Core Animation Philosophy

Animations should **aid understanding**, not distract. For causal graph visualization:
- Use motion to show cause-and-effect propagation
- Employ staggered animations to reveal sequential relationships
- Keep animations smooth and predictable

### Tailwind CSS Built-in Animations

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        // Pulsing for active nodes
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',

        // Ripple effect for propagation
        'ripple': 'ripple 1s ease-out forwards',

        // Bounce for attention
        'bounce-gentle': 'bounce 1s ease-in-out 3',

        // Fade in for new elements
        'fade-in': 'fadeIn 0.3s ease-out forwards',

        // Slide in for panels
        'slide-up': 'slideUp 0.4s ease-out forwards',

        // Flow for connections (showing energy/resource flow)
        'flow': 'flow 2s linear infinite',

        // Staggered reveal
        'stagger-1': 'fadeIn 0.3s ease-out 0.1s forwards',
        'stagger-2': 'fadeIn 0.3s ease-out 0.2s forwards',
        'stagger-3': 'fadeIn 0.3s ease-out 0.3s forwards',
        'stagger-4': 'fadeIn 0.3s ease-out 0.4s forwards',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
}
```

### Framer Motion Integration for Causal Graph Propagation

```jsx
// CausalNode.jsx - Animated node with propagation
import { motion } from 'framer-motion';

// Variant definitions for propagation
const nodeVariants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  idle: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3 }
  },
  active: {
    scale: 1.1,
    boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
    transition: { duration: 0.2 }
  },
  propagating: {
    scale: [1, 1.15, 1],
    backgroundColor: ['#22C55E', '#4ADE80', '#22C55E'],
    transition: { duration: 0.6, ease: 'easeInOut' }
  }
};

// Container for staggered children
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,  // Delay between each child
      delayChildren: 0.1
    }
  }
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};

// Usage example
function CausalGraph({ nodes, connections }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {nodes.map((node, index) => (
        <motion.div
          key={node.id}
          variants={childVariants}
          className="causal-node"
        >
          {node.label}
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### Connection Line Animation (SVG)

```jsx
// AnimatedConnection.jsx
import { motion } from 'framer-motion';

const connectionVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 0.8,
      ease: 'easeInOut'
    }
  },
  active: {
    stroke: '#22C55E',
    strokeWidth: 3,
    transition: { duration: 0.2 }
  }
};

function AnimatedConnection({ from, to, isActive }) {
  return (
    <motion.path
      d={`M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`}
      stroke={isActive ? '#22C55E' : '#94A3B8'}
      strokeWidth={isActive ? 3 : 2}
      fill="none"
      variants={connectionVariants}
      initial="hidden"
      animate="visible"
      strokeDasharray="5 5"
      className={isActive ? 'animate-flow' : ''}
    />
  );
}
```

### Propagation Wave Effect

```jsx
// PropagationWave.jsx - Shows effect spreading through graph
const propagationSequence = async (nodeIds, setActiveNode) => {
  for (const id of nodeIds) {
    setActiveNode(id);
    await new Promise(resolve => setTimeout(resolve, 300));
  }
};

// Visual wave effect
const WaveEffect = ({ isActive }) => (
  <motion.div
    className="absolute inset-0 rounded-full bg-meadow-400"
    initial={{ scale: 1, opacity: 0.5 }}
    animate={isActive ? {
      scale: [1, 2, 3],
      opacity: [0.5, 0.25, 0]
    } : {}}
    transition={{ duration: 1, ease: 'easeOut' }}
  />
);
```

### Accessibility: Reduced Motion

```jsx
// useReducedMotion.js
import { useReducedMotion } from 'framer-motion';

function AnimatedComponent() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ x: 100 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5 }}
    />
  );
}
```

---

## 4. Icon Guidelines

### Recommended Icon Libraries

**Primary Choice: Lucide React**
- Clean, consistent stroke-based icons
- Excellent tree-shaking for bundle size
- MIT licensed
- Good environmental/nature coverage

```bash
npm install lucide-react
```

**Alternative: Phosphor Icons**
- Multiple weights (thin, light, regular, bold, duotone)
- Great for visual variety
- Excellent accessibility

```bash
npm install @phosphor-icons/react
```

### Environmental Icon Set (Lucide)

```jsx
import {
  // Nature
  Leaf, TreeDeciduous, TreePine, Flower, Sprout,

  // Water
  Droplet, Droplets, Waves, Fish, Anchor,

  // Energy
  Sun, Zap, Wind, Flame, Battery,

  // Climate
  Cloud, CloudRain, CloudSun, Thermometer, Snowflake,

  // Sustainability
  Recycle, Factory, Trash2, Package, ShoppingBag,

  // Wildlife
  Bird, Bug, Rabbit, Squirrel,

  // Actions
  ArrowRight, ArrowDown, Plus, Minus, Check, X,

  // UI
  Info, AlertCircle, HelpCircle, Settings, Home
} from 'lucide-react';
```

### Icon Styling Guidelines

```jsx
// Consistent icon styling
const iconSizes = {
  sm: 'w-4 h-4',   // 16px - inline text
  md: 'w-5 h-5',   // 20px - buttons, labels
  lg: 'w-6 h-6',   // 24px - navigation
  xl: 'w-8 h-8',   // 32px - feature icons
  '2xl': 'w-12 h-12', // 48px - hero elements
};

// Icon component wrapper
function Icon({ icon: IconComponent, size = 'md', className = '' }) {
  return (
    <IconComponent
      className={`${iconSizes[size]} ${className}`}
      strokeWidth={2}
    />
  );
}

// Usage with environmental theming
<Leaf className="w-6 h-6 text-meadow-500" />
<Droplet className="w-6 h-6 text-ocean-500" />
<Sun className="w-6 h-6 text-sunny-500" />
```

### Custom Icon Resources

**Free SVG Icon Sources:**
- [Flaticon](https://www.flaticon.com/) - 27,000+ eco-friendly icons
- [IconScout](https://iconscout.com/) - 22,000+ sustainability icons
- [The Noun Project](https://thenounproject.com/) - 1,100+ environmental icons
- [UXWing](https://uxwing.com/) - Free commercial use

### Icon Style Guidelines

1. **Consistency:** Use same stroke width throughout (2px recommended)
2. **Size:** Minimum 24px for touch targets on mobile
3. **Color:** Use semantic colors (green for positive, red for negative)
4. **Accessibility:** Always include aria-labels or accompanying text
5. **Rounded:** Prefer rounded/soft icon styles for kid-friendly feel

---

## 5. Data Visualization

### Principles for Young Audiences

1. **Start Simple:** Use pictographs before abstract charts
2. **Use Familiar Data:** Connect to things students understand
3. **Make it Interactive:** Allow exploration and manipulation
4. **Tell Stories:** Frame data as narrative, not just numbers
5. **Use Color Meaningfully:** Green = good, Red = concern

### Chart Library Recommendation

**Recharts** - Best for React + Tailwind integration

```bash
npm install recharts
```

### Kid-Friendly Chart Configurations

```jsx
// EcoBarChart.jsx - Friendly bar chart
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const COLORS = {
  positive: '#22C55E', // meadow-500
  neutral: '#38BDF8',  // ocean-400
  negative: '#EF4444', // red-500
};

function EcoBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <XAxis
          dataKey="name"
          tick={{ fontSize: 14, fontFamily: 'Nunito' }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fontFamily: 'Nunito' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: '12px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            fontFamily: 'Nunito'
          }}
        />
        <Bar
          dataKey="value"
          radius={[8, 8, 0, 0]}  // Rounded tops
          maxBarSize={60}
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.value >= 0 ? COLORS.positive : COLORS.negative}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Impact Visualization Component

```jsx
// ImpactMeter.jsx - Visual impact indicator
function ImpactMeter({ value, max, label, type = 'positive' }) {
  const percentage = (value / max) * 100;
  const colors = {
    positive: 'bg-meadow-500',
    negative: 'bg-red-500',
    neutral: 'bg-ocean-400'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-700">{label}</span>
        <span className={type === 'positive' ? 'text-meadow-600' : 'text-red-600'}>
          {value} / {max}
        </span>
      </div>
      <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${colors[type]} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
```

### Pictograph/Icon-Based Data Display

```jsx
// TreeCounter.jsx - Visual counter using icons
function TreeCounter({ count, max = 10 }) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-meadow-50 rounded-2xl">
      {Array.from({ length: max }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: i < count ? 1 : 0.5,
            opacity: i < count ? 1 : 0.3
          }}
          transition={{ delay: i * 0.05 }}
        >
          <TreeDeciduous
            className={`w-8 h-8 ${i < count ? 'text-meadow-500' : 'text-slate-300'}`}
          />
        </motion.div>
      ))}
    </div>
  );
}
```

---

## 6. Gamification Elements

### Badge System

```jsx
// Badge.jsx - Achievement badge component
const badgeVariants = {
  locked: {
    backgroundColor: '#E2E8F0',
    borderColor: '#CBD5E1',
    iconColor: '#94A3B8'
  },
  unlocked: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FBBF24',
    iconColor: '#D97706'
  },
  rare: {
    backgroundColor: '#EDE9FE',
    borderColor: '#A78BFA',
    iconColor: '#7C3AED'
  }
};

function Badge({ icon: Icon, name, description, isUnlocked, isRare }) {
  const variant = isRare ? 'rare' : (isUnlocked ? 'unlocked' : 'locked');

  return (
    <motion.div
      className={`
        relative p-4 rounded-2xl border-2 text-center
        ${isUnlocked ? 'cursor-pointer' : 'opacity-60'}
      `}
      style={{
        backgroundColor: badgeVariants[variant].backgroundColor,
        borderColor: badgeVariants[variant].borderColor
      }}
      whileHover={isUnlocked ? { scale: 1.05 } : {}}
      whileTap={isUnlocked ? { scale: 0.95 } : {}}
    >
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="w-6 h-6 text-slate-400" />
        </div>
      )}
      <div className={!isUnlocked ? 'blur-sm' : ''}>
        <Icon
          className="w-12 h-12 mx-auto mb-2"
          style={{ color: badgeVariants[variant].iconColor }}
        />
        <h3 className="font-bold text-slate-800">{name}</h3>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
    </motion.div>
  );
}
```

### Environmental Badge Examples

```jsx
const ecoBadges = [
  {
    id: 'first_tree',
    name: 'Tree Hugger',
    description: 'Learned about forest ecosystems',
    icon: TreeDeciduous,
    category: 'forest'
  },
  {
    id: 'water_warrior',
    name: 'Water Warrior',
    description: 'Explored 5 water conservation scenarios',
    icon: Droplets,
    category: 'water'
  },
  {
    id: 'carbon_catcher',
    name: 'Carbon Catcher',
    description: 'Reduced carbon in 3 simulations',
    icon: Cloud,
    category: 'climate'
  },
  {
    id: 'chain_master',
    name: 'Chain Reaction Master',
    description: 'Traced a cause-effect chain with 5+ nodes',
    icon: Workflow,
    category: 'systems'
  },
  {
    id: 'solar_explorer',
    name: 'Solar Explorer',
    description: 'Learned about renewable energy',
    icon: Sun,
    category: 'energy'
  }
];
```

### Progress Indicators

```jsx
// LevelProgress.jsx - Experience/level progress
function LevelProgress({ currentXP, levelXP, level }) {
  const progress = (currentXP / levelXP) * 100;

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-4">
        {/* Level badge */}
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-meadow-400 to-meadow-600 flex items-center justify-center">
          <span className="text-white font-bold text-xl">{level}</span>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-700">Level {level}</span>
            <span className="text-slate-500">{currentXP} / {levelXP} XP</span>
          </div>
          <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-meadow-400 to-meadow-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Streak Counter

```jsx
// StreakCounter.jsx
function StreakCounter({ days, isActive }) {
  return (
    <div className={`
      inline-flex items-center gap-2 px-4 py-2 rounded-full
      ${isActive ? 'bg-sunny-100' : 'bg-slate-100'}
    `}>
      <Flame className={`w-5 h-5 ${isActive ? 'text-sunny-500' : 'text-slate-400'}`} />
      <span className={`font-bold ${isActive ? 'text-sunny-700' : 'text-slate-500'}`}>
        {days} day streak!
      </span>
      {isActive && (
        <motion.span
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🔥
        </motion.span>
      )}
    </div>
  );
}
```

### Points & Rewards System UI

```jsx
// PointsDisplay.jsx
function PointsDisplay({ points, onEarn }) {
  return (
    <motion.div
      className="flex items-center gap-2 bg-meadow-50 px-4 py-2 rounded-full"
      animate={onEarn ? { scale: [1, 1.1, 1] } : {}}
    >
      <Leaf className="w-5 h-5 text-meadow-500" />
      <span className="font-bold text-meadow-700">{points.toLocaleString()}</span>
      <span className="text-meadow-600 text-sm">eco-points</span>
    </motion.div>
  );
}
```

---

## 7. React/Tailwind Implementation

### Project Setup

```bash
# Create Vite React project
npm create vite@latest ecologic-simulator -- --template react

# Install dependencies
npm install tailwindcss @tailwindcss/forms @tailwindcss/typography postcss autoprefixer
npm install framer-motion recharts lucide-react
npm install clsx tailwind-merge  # Utility for className management

# Initialize Tailwind
npx tailwindcss init -p
```

### Complete tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        meadow: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },
        ocean: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          200: '#BAE6FD',
          300: '#7DD3FC',
          400: '#38BDF8',
          500: '#0EA5E9',
          600: '#0284C7',
          700: '#0369A1',
          800: '#075985',
          900: '#0C4A6E',
        },
        sunny: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          300: '#FCD34D',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
          800: '#92400E',
          900: '#78350F',
        },
        earth: {
          50: '#FDF8F6',
          100: '#F2E8E5',
          200: '#EADDD7',
          300: '#E0CEC7',
          400: '#D2BAB0',
          500: '#BFA094',
          600: '#A18072',
          700: '#977669',
          800: '#846358',
          900: '#43302B',
        },
        moss: {
          50: '#F5F7F2',
          100: '#E8EDE2',
          200: '#D4DFC8',
          300: '#B5C9A1',
          400: '#8FB174',
          500: '#6B9950',
          600: '#527A3C',
          700: '#415F31',
          800: '#364D2A',
          900: '#2E4125',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        display: ['Nunito', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'pulse-gentle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 1s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'flow': 'flow 2s linear infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        flow: {
          '0%': { strokeDashoffset: '100' },
          '100%': { strokeDashoffset: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Utility Functions

```javascript
// lib/utils.js
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Merge Tailwind classes intelligently
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Impact level to color mapping
export function getImpactColor(level) {
  const colors = {
    positive: 'text-meadow-500 bg-meadow-50',
    negative: 'text-red-500 bg-red-50',
    neutral: 'text-slate-500 bg-slate-50',
    warning: 'text-sunny-500 bg-sunny-50',
  };
  return colors[level] || colors.neutral;
}
```

---

## 8. Component Styling Guidelines

### Card Component

```jsx
// components/Card.jsx
function Card({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-white border border-slate-200',
    success: 'bg-meadow-50 border border-meadow-200',
    warning: 'bg-sunny-50 border border-sunny-200',
    info: 'bg-ocean-50 border border-ocean-200',
    danger: 'bg-red-50 border border-red-200',
  };

  return (
    <div className={cn(
      'rounded-2xl p-6 shadow-sm',
      variants[variant],
      className
    )}>
      {children}
    </div>
  );
}
```

### Button Components

```jsx
// components/Button.jsx
const buttonVariants = {
  primary: `
    bg-meadow-500 hover:bg-meadow-600 text-white
    shadow-lg shadow-meadow-500/25
  `,
  secondary: `
    bg-ocean-500 hover:bg-ocean-600 text-white
    shadow-lg shadow-ocean-500/25
  `,
  outline: `
    border-2 border-meadow-500 text-meadow-600
    hover:bg-meadow-50
  `,
  ghost: `
    text-slate-600 hover:bg-slate-100
  `,
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
  xl: 'px-8 py-4 text-xl',
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-semibold rounded-full',
        'transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-meadow-500',
        buttonVariants[variant],
        buttonSizes[size],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </motion.button>
  );
}
```

### Node Component (for Causal Graphs)

```jsx
// components/CausalNode.jsx
function CausalNode({
  id,
  label,
  icon: Icon,
  type = 'default',
  isActive = false,
  isPropagating = false,
  onClick
}) {
  const typeStyles = {
    default: 'bg-white border-slate-200',
    cause: 'bg-sunny-50 border-sunny-300',
    effect: 'bg-ocean-50 border-ocean-300',
    positive: 'bg-meadow-50 border-meadow-300',
    negative: 'bg-red-50 border-red-300',
  };

  return (
    <motion.div
      className={cn(
        'relative p-4 rounded-2xl border-2 cursor-pointer',
        'transition-all duration-200',
        typeStyles[type],
        isActive && 'ring-4 ring-meadow-400/50 border-meadow-400'
      )}
      onClick={() => onClick?.(id)}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      animate={isPropagating ? {
        boxShadow: [
          '0 0 0 0 rgba(34, 197, 94, 0)',
          '0 0 20px 10px rgba(34, 197, 94, 0.3)',
          '0 0 0 0 rgba(34, 197, 94, 0)',
        ]
      } : {}}
      transition={isPropagating ? { duration: 0.6, repeat: 1 } : {}}
    >
      <div className="flex items-center gap-3">
        <div className={cn(
          'p-2 rounded-xl',
          type === 'positive' ? 'bg-meadow-100' :
          type === 'negative' ? 'bg-red-100' : 'bg-slate-100'
        )}>
          <Icon className={cn(
            'w-6 h-6',
            type === 'positive' ? 'text-meadow-600' :
            type === 'negative' ? 'text-red-600' : 'text-slate-600'
          )} />
        </div>
        <span className="font-medium text-slate-800">{label}</span>
      </div>
    </motion.div>
  );
}
```

### Interactive Helper/Mascot

```jsx
// components/EcoHelper.jsx
function EcoHelper({ message, isVisible = true }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          className="fixed bottom-6 right-6 flex items-end gap-3"
        >
          {/* Speech bubble */}
          <motion.div
            className="bg-white rounded-2xl rounded-br-sm p-4 shadow-lg max-w-xs"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-slate-700 text-sm">{message}</p>
          </motion.div>

          {/* Mascot icon */}
          <motion.div
            className="w-16 h-16 bg-meadow-500 rounded-full flex items-center justify-center shadow-lg"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Leaf className="w-8 h-8 text-white" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Quick Reference: Do's and Don'ts

### DO:
- Use rounded corners (rounded-xl, rounded-2xl)
- Use generous padding and spacing
- Animate with purpose (show relationships, not just decoration)
- Use bright, saturated colors from the nature palette
- Include immediate visual feedback for interactions
- Make touch targets at least 44x44px
- Use large, readable typography (16px minimum)
- Include helpful icons alongside text
- Add subtle shadows for depth (shadow-sm, shadow-md)

### DON'T:
- Use dark backgrounds as primary
- Use sharp corners or harsh lines
- Animate excessively or distractingly
- Use corporate blues/grays as primary colors
- Use thin, hard-to-read fonts
- Overwhelm with too many elements
- Use jargon without explanation
- Make interactive elements look static
- Use small, cramped layouts

---

## Resources & References

### Color & Design
- [Piktochart - Kids Color Palette Combinations](https://piktochart.com/tips/kids-color-palette)
- [UX Matters - Color in Applications for Children](https://www.uxmatters.com/mt/archives/2011/10/effective-use-of-color-and-graphics-in-applications-for-children-part-i-toddlers-and-preschoolers.php)
- [Thought Media - Color Psychology in Children's Apps](https://www.thoughtmedia.com/role-color-psychology-childrens-app-design-engaging-young-minds/)
- [Shopney - Nature-Inspired Mobile App Colors](https://shopney.co/blog/color-in-mobile-app-design-inspiration-from-nature/)

### Typography
- [Microsoft Design - Kermit Typeface for Kids](https://microsoft.design/articles/introducing-kermit-a-typeface-for-kids/)
- [Medium - Typography in Digital Products for Kids](https://medium.com/ux-of-edtech/typography-in-digital-products-for-kids-f10ce0588555)
- [Colour My Learning - Child-Friendly Google Fonts](https://www.colourmylearning.com/2025/08/best-child-friendly-print-fonts-from-google-fonts-for-early-readers/)

### UX Design for Children
- [Aufait UX - UI/UX Tips for Child-Friendly Interfaces](https://www.aufaitux.com/blog/ui-ux-designing-for-children/)
- [Eleken - UX Design for Children](https://www.eleken.co/blog-posts/ux-design-for-children-how-to-create-a-product-children-will-love)
- [Ramotion - UX Design for Kids](https://www.ramotion.com/blog/ux-design-for-kids/)
- [Gapsy Studio - Creating Engaging Interfaces for Kids](https://gapsystudio.com/blog/ux-design-for-kids/)

### Data Visualization
- [PolicyViz - Teaching Data Visualization to Kids](https://policyviz.com/2018/11/19/teaching-data-visualization-to-kids/)
- [Nightingale - Data Visualization for Kids](https://nightingaledvs.com/data-visualization-for-kids/)
- [Infogram - Interactive Classroom Data Stories](https://infogram.com/solutions/education)

### Gamification
- [Eastern Peak - Gamification in Educational Apps](https://easternpeak.com/blog/gamification-strategies-in-educational-apps/)
- [BuddyBoss - Points, Badges & Rewards](https://www.buddyboss.com/blog/gamification-for-learning-to-boost-engagement-with-points-badges-rewards/)
- [Trophy - Badges in Gamification Examples](https://trophy.so/blog/badges-feature-gamification-examples)
- [Riseapps - Gamification in Learning Apps](https://riseapps.co/gamification-in-learning-apps/)

### Animation & Implementation
- [Tailwind CSS - Animation Documentation](https://tailwindcss.com/docs/animation)
- [Motion (Framer Motion) - React Animation](https://motion.dev/docs/react-animation)
- [Maxime Heckel - Advanced Framer Motion Patterns](https://blog.maximeheckel.com/posts/advanced-animation-patterns-with-framer-motion/)
- [Hover.dev - Animated UI Components](https://www.hover.dev/)

### Icon Libraries
- [Lucide Icons](https://lucide.dev/)
- [Phosphor Icons](https://phosphoricons.com/)
- [Heroicons](https://heroicons.com/)
- [Flaticon - Eco Friendly Icons](https://www.flaticon.com/free-icons/eco-friendly)
- [IconScout - Sustainability Icons](https://iconscout.com/icons/sustainability)

### Tailwind CSS
- [Tailwind CSS - Customizing Colors](https://tailwindcss.com/docs/customizing-colors)
- [Tailwind CSS - Theme Configuration](https://tailwindcss.com/docs/theme)
- [UI Colors - Tailwind Palette Generator](https://uicolors.app/generate)

---

*Document created for EcoLogic Simulator project. Last updated: January 2026.*
