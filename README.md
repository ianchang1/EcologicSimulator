# EcoLogic Simulator

**See the invisible chains of cause and effect.**

EcoLogic Simulator is an educational systems-thinking platform that models feedback loops, second-order effects, tradeoffs, and rebound effects of lifestyle and policy changes on the environment.

![EcoLogic Simulator](docs/screenshot-placeholder.png)

## What is this?

This is NOT a carbon calculator. This is a **causal modeling tool** that helps you understand:

- How your choices ripple through environmental systems
- The hidden tradeoffs in "green" decisions
- Why intuitive solutions sometimes backfire
- The interconnected nature of environmental impact

## Features

- **Interactive Causal Graphs** - Visualize cause-and-effect relationships with animated propagation
- **Multi-metric Analysis** - Track impacts on carbon, water, and waste
- **Rebound Effect Detection** - See unintended consequences that may offset benefits
- **Plain-English Narratives** - Understand results without jargon
- **Kid-Friendly Design** - Vibrant, engaging UI suitable for students and educators

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd EcologicSimulator

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Running the Application

**Start the Backend (Terminal 1):**
```bash
cd backend
npm run dev
```
The API server will start at http://localhost:3001

**Start the Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```
The frontend will start at http://localhost:5173

**Open your browser** to http://localhost:5173 and start exploring!

## Example Scenarios

### 1. Food Substitution
**Query:** "What if I switch from beef to chicken twice a week?"

This scenario models:
- Direct emissions reduction from lower methane (cattle vs poultry)
- Water footprint changes (beef: ~15,000L/kg vs chicken: ~4,300L/kg)
- Land use implications
- Feed crop demand shifts
- Cost savings and potential rebound spending

### 2. Transport Substitution
**Query:** "What if I bike instead of Uber twice a week?"

This scenario models:
- Direct vehicle emissions avoided
- Deadhead miles (empty return trips) eliminated
- Calorie expenditure and food intake offset
- Health co-benefits
- Cost savings and rebound travel risk

### 3. Plastic Ban
**Query:** "What if my city bans single-use plastic bags?"

This scenario models:
- Production emissions shift (plastic vs paper vs reusable)
- Water usage changes (paper is water-intensive)
- Waste stream modifications
- Rebound effects from "forgetting" reusable bags
- Market shifts to alternative industries

### 4. Reusable Bottle Adoption
**Query:** "What if 30% of students use reusable water bottles?"

This scenario models:
- PET bottle production avoided
- Washing water consumption added
- Transportation energy saved
- Recycling vs landfill dynamics
- Break-even analysis (uses needed to offset reusable production)

## Project Structure

```
EcologicSimulator/
├── backend/
│   ├── src/
│   │   ├── types/           # TypeScript type definitions
│   │   ├── data/            # Causal graph templates
│   │   ├── services/
│   │   │   ├── parser.ts      # Input parsing (lightweight NLP)
│   │   │   ├── graphBuilder.ts # Graph instantiation
│   │   │   ├── propagate.ts    # Simulation engine
│   │   │   ├── aggregators.ts  # Metric calculations
│   │   │   └── narrative.ts    # Story generation
│   │   └── index.ts         # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CausalGraphView.tsx   # React Flow visualization
│   │   │   ├── MetricsDisplay.tsx    # Impact metrics
│   │   │   ├── NarrativePanel.tsx    # Story & assumptions
│   │   │   └── ScenarioSelector.tsx  # Scenario picker
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── index.css        # Tailwind + custom styles
│   └── package.json
├── docs/
│   ├── PRODUCT_SPEC.md      # Product specification
│   ├── API_CONTRACT.md      # API documentation
│   └── UI_DESIGN_NOTES.md   # UI/UX guidelines
└── README.md
```

## API Endpoints

### POST /api/v1/simulate

Run a simulation from natural language or structured input.

**Request:**
```json
{
  "query": "Switch from beef to chicken twice a week"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "graph": { "nodes": [...], "edges": [...] },
    "propagationSteps": [...],
    "totals": {
      "carbon": { "value": -5.2, "unit": "kg CO₂e/week", ... },
      "water": { "value": -22200, "unit": "liters/week", ... },
      "waste": { "value": -0.01, "unit": "kg/week", ... }
    },
    "narrative": "...",
    "assumptions": [...],
    "limitations": [...]
  }
}
```

See [docs/API_CONTRACT.md](docs/API_CONTRACT.md) for full documentation.

### GET /api/v1/scenarios

List available scenario templates.

### GET /api/v1/templates/:id

Get detailed information about a specific template.

## Design Philosophy

### Model relationships, not outcomes
We prioritize showing *how* variables connect rather than claiming precise numerical predictions.

### Make assumptions explicit
Every parameter and relationship strength is visible and can be adjusted.

### Surface uncertainty
The system acknowledges what it doesn't know, distinguishing between well-established relationships and speculative connections.

### Never overclaim precision
This is an **educational causal model**, not a prediction engine.

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express
- Deterministic causal graph propagation (no ML)

**Frontend:**
- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Flow (causal graph visualization)
- Framer Motion (animations)
- Lucide React (icons)

## Contributing

Contributions are welcome! Please see the design docs in `/docs` for guidance on:
- Adding new scenario templates
- Extending the causal graph structure
- UI/UX patterns to follow

## Limitations

- This is an educational tool, not a scientific calculator
- Values are based on literature averages; individual results vary
- Market-level effects (millions adopting) are not modeled
- Regional variations in supply chains are simplified

## License

MIT

---

*EcoLogic Simulator: See the system, not just the choice.*
