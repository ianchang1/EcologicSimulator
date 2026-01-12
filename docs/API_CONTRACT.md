# EcoLogic Simulator API Contract

## Overview

The EcoLogic Simulator API provides endpoints for running environmental impact simulations. It models causal relationships between behavioral or policy changes and their downstream effects on carbon emissions, water usage, and waste generation.

**Base URL:** `/api/v1`

**Content-Type:** `application/json`

---

## Endpoints

### POST /simulate

Runs a full simulation based on a parsed scenario, propagating effects through a causal graph and returning comprehensive impact metrics.

---

## TypeScript Type Definitions

### Request Types

```typescript
/**
 * Supported scenario types for environmental impact simulation
 */
type ScenarioType =
  | 'food_substitution'      // Replacing one food item with another
  | 'transport_substitution' // Changing transportation mode
  | 'plastic_ban'            // Policy banning single-use plastics
  | 'reusable_adoption';     // Adoption of reusable alternatives

/**
 * Frequency unit for behavioral changes
 */
type FrequencyUnit = 'week' | 'month' | 'year';

/**
 * The parsed scenario input for simulation
 */
interface ParsedScenario {
  /**
   * The type of environmental scenario being simulated
   */
  scenarioType: ScenarioType;

  /**
   * What is being replaced (e.g., "beef consumption", "car commute")
   */
  baseline: string;

  /**
   * What it's changing to (e.g., "chicken consumption", "bicycle commute")
   */
  change: string;

  /**
   * Number of times the change occurs per frequency unit
   * @example 2 (for "twice per week")
   */
  frequency: number;

  /**
   * The unit of time for the frequency
   */
  frequencyUnit: FrequencyUnit;

  /**
   * Adoption rate for policy scenarios (0-1 scale)
   * @minimum 0
   * @maximum 1
   * @example 0.75 (75% adoption)
   */
  adoptionRate: number;

  /**
   * Geographic context affecting supply chain calculations
   * @optional
   * @example "United States", "California", "Global"
   */
  geography?: string;

  /**
   * Number of weeks to simulate
   * @minimum 1
   * @example 52 (one year)
   */
  timeframe: number;

  /**
   * Explicit assumptions made in the scenario
   * @example ["Average serving size of 200g", "Local sourcing assumed"]
   */
  assumptions: string[];
}
```

### Response Types

```typescript
/**
 * Category classification for causal graph nodes
 */
type NodeCategory =
  | 'behavior'        // Human behavioral changes
  | 'production'      // Manufacturing/production processes
  | 'resource'        // Natural resource consumption
  | 'emission'        // Emissions (CO2, methane, etc.)
  | 'waste'           // Waste generation
  | 'ecosystem'       // Ecosystem impacts
  | 'economic'        // Economic factors
  | 'social';         // Social/health impacts

/**
 * A node in the causal graph representing a factor in the system
 */
interface CausalNode {
  /**
   * Unique identifier for the node
   * @example "beef_production", "methane_emissions"
   */
  id: string;

  /**
   * Human-readable label for display
   * @example "Beef Production", "Methane Emissions"
   */
  label: string;

  /**
   * Category classification for the node
   */
  category: NodeCategory;

  /**
   * Unit of measurement for this node's values
   * @example "kg CO2e", "liters", "kg"
   */
  unit: string;

  /**
   * Detailed description of what this node represents
   */
  description: string;

  /**
   * The change in this node's value after simulation
   * Positive values indicate increase, negative indicate decrease
   */
  delta: number;
}

/**
 * An edge in the causal graph representing a relationship between nodes
 */
interface CausalEdge {
  /**
   * ID of the source node
   */
  source: string;

  /**
   * ID of the target node
   */
  target: string;

  /**
   * Direction of influence: +1 for positive correlation, -1 for negative
   * @example 1 (increase in source causes increase in target)
   * @example -1 (increase in source causes decrease in target)
   */
  sign: 1 | -1;

  /**
   * Strength of the causal relationship (0-1 scale)
   * @minimum 0
   * @maximum 1
   * @example 0.8 (strong relationship)
   */
  strength: number;

  /**
   * Confidence level in this relationship (0-1 scale)
   * Based on available research and data quality
   * @minimum 0
   * @maximum 1
   */
  confidence: number;

  /**
   * Explanation of why this relationship exists
   * @example "Cattle farming directly produces methane through enteric fermentation"
   */
  rationale: string;

  /**
   * Number of time steps (weeks) for effect to propagate
   * @minimum 0
   * @example 0 (immediate effect), 4 (one month lag)
   */
  lagSteps: number;
}

/**
 * Breakdown component for a metric result
 */
interface MetricBreakdown {
  /**
   * Label for this breakdown component
   * @example "Direct emissions", "Supply chain", "Land use change"
   */
  label: string;

  /**
   * Value for this component
   */
  value: number;

  /**
   * Percentage contribution to total
   */
  percentage: number;
}

/**
 * Result for a specific environmental metric
 */
interface MetricResult {
  /**
   * The calculated value (can be positive or negative)
   * Negative values indicate reduction
   */
  value: number;

  /**
   * Unit of measurement
   * @example "kg CO2e", "liters", "kg"
   */
  unit: string;

  /**
   * Confidence level in this result (0-1 scale)
   * @minimum 0
   * @maximum 1
   */
  confidence: number;

  /**
   * Breakdown of contributing factors
   */
  breakdown: MetricBreakdown[];
}

/**
 * Order classification for effects
 * 1 = First-order (direct)
 * 2 = Second-order (one step removed)
 * 3 = Third-order or higher (downstream)
 */
type EffectOrder = 1 | 2 | 3;

/**
 * An individual effect in the causal chain
 */
interface Effect {
  /**
   * ID of the affected node
   */
  nodeId: string;

  /**
   * Human-readable label for the effect
   */
  label: string;

  /**
   * Change in value (positive or negative)
   */
  delta: number;

  /**
   * Unit of measurement
   */
  unit: string;

  /**
   * Order of the effect in the causal chain
   */
  order: EffectOrder;
}

/**
 * A driver contributing to the overall impact
 */
interface Driver {
  /**
   * ID of the driver node
   */
  nodeId: string;

  /**
   * Human-readable label
   */
  label: string;

  /**
   * Contribution to total impact (can be positive or negative)
   */
  contribution: number;

  /**
   * Unit of the contribution
   */
  unit: string;

  /**
   * Percentage of total impact this driver represents
   * @minimum 0
   * @maximum 100
   */
  percentage: number;

  /**
   * Brief explanation of why this is a significant driver
   */
  explanation: string;
}

/**
 * Record of a single node affected during propagation
 */
interface AffectedNode {
  /**
   * ID of the affected node
   */
  nodeId: string;

  /**
   * Label of the affected node
   */
  label: string;

  /**
   * Change in value during this step
   */
  delta: number;

  /**
   * Unit of measurement
   */
  unit: string;
}

/**
 * A single step in the propagation process
 */
interface PropagationStep {
  /**
   * Step number in the propagation sequence (0-indexed)
   * Step 0 is the initial change, subsequent steps show cascading effects
   */
  step: number;

  /**
   * Nodes affected during this propagation step
   */
  affectedNodes: AffectedNode[];

  /**
   * Cumulative total delta across all metrics at this step
   * Expressed in a common unit (typically kg CO2e)
   */
  totalDelta: number;
}

/**
 * An assumption made during simulation
 */
interface Assumption {
  /**
   * Unique identifier for the assumption
   */
  id: string;

  /**
   * Category of assumption
   */
  category: 'data' | 'methodology' | 'scope' | 'behavior';

  /**
   * Description of the assumption
   */
  description: string;

  /**
   * Impact on results if assumption is incorrect
   */
  sensitivity: 'low' | 'medium' | 'high';

  /**
   * Source or basis for this assumption
   */
  source?: string;
}

/**
 * The complete simulation result
 */
interface SimulationResult {
  /**
   * The causal graph with nodes and edges showing relationships
   */
  graph: {
    nodes: CausalNode[];
    edges: CausalEdge[];
  };

  /**
   * Step-by-step propagation showing how effects cascade
   */
  propagationSteps: PropagationStep[];

  /**
   * Total environmental impact metrics
   */
  totals: {
    /**
     * Carbon dioxide equivalent emissions impact
     */
    carbon: MetricResult;

    /**
     * Water usage impact
     */
    water: MetricResult;

    /**
     * Waste generation impact
     */
    waste: MetricResult;
  };

  /**
   * Direct, first-order effects of the change
   */
  firstOrderEffects: Effect[];

  /**
   * Indirect effects propagated through the causal graph
   */
  downstreamEffects: Effect[];

  /**
   * Rebound effects that may offset some benefits
   * (e.g., money saved leads to other consumption)
   */
  reboundEffects: Effect[];

  /**
   * Top contributing factors to the overall impact
   */
  topDrivers: Driver[];

  /**
   * Plain-English narrative explaining the results
   */
  narrative: string;

  /**
   * Assumptions made during the simulation
   */
  assumptions: Assumption[];

  /**
   * Known limitations of the simulation
   */
  limitations: string[];
}
```

---

## Example Request/Response

### Example: Switch Beef to Chicken Twice Per Week

#### Request

```http
POST /api/v1/simulate
Content-Type: application/json
```

```json
{
  "scenarioType": "food_substitution",
  "baseline": "beef consumption",
  "change": "chicken consumption",
  "frequency": 2,
  "frequencyUnit": "week",
  "adoptionRate": 1.0,
  "geography": "United States",
  "timeframe": 52,
  "assumptions": [
    "Average serving size of 200g",
    "Conventional (non-organic) sourcing",
    "National average supply chain distances",
    "No change in total caloric intake"
  ]
}
```

#### Response

```json
{
  "graph": {
    "nodes": [
      {
        "id": "beef_consumption",
        "label": "Beef Consumption",
        "category": "behavior",
        "unit": "kg/year",
        "description": "Individual consumption of beef products",
        "delta": -20.8
      },
      {
        "id": "chicken_consumption",
        "label": "Chicken Consumption",
        "category": "behavior",
        "unit": "kg/year",
        "description": "Individual consumption of chicken products",
        "delta": 20.8
      },
      {
        "id": "beef_production",
        "label": "Beef Production",
        "category": "production",
        "unit": "kg/year",
        "description": "Cattle farming and beef processing",
        "delta": -20.8
      },
      {
        "id": "chicken_production",
        "label": "Chicken Production",
        "category": "production",
        "unit": "kg/year",
        "description": "Poultry farming and processing",
        "delta": 20.8
      },
      {
        "id": "methane_emissions",
        "label": "Methane Emissions",
        "category": "emission",
        "unit": "kg CH4/year",
        "description": "Methane from enteric fermentation and manure",
        "delta": -18.7
      },
      {
        "id": "feed_crop_demand",
        "label": "Feed Crop Demand",
        "category": "resource",
        "unit": "kg/year",
        "description": "Grain and soy required for animal feed",
        "delta": -124.8
      },
      {
        "id": "land_use",
        "label": "Agricultural Land Use",
        "category": "resource",
        "unit": "m²/year",
        "description": "Land required for grazing and feed production",
        "delta": -156.0
      },
      {
        "id": "water_consumption",
        "label": "Water Consumption",
        "category": "resource",
        "unit": "liters/year",
        "description": "Water for livestock and feed irrigation",
        "delta": -312480
      },
      {
        "id": "co2_emissions",
        "label": "CO2 Emissions",
        "category": "emission",
        "unit": "kg CO2/year",
        "description": "Carbon dioxide from energy and transport",
        "delta": -89.4
      }
    ],
    "edges": [
      {
        "source": "beef_consumption",
        "target": "beef_production",
        "sign": 1,
        "strength": 1.0,
        "confidence": 0.95,
        "rationale": "Consumer demand directly drives production levels",
        "lagSteps": 0
      },
      {
        "source": "chicken_consumption",
        "target": "chicken_production",
        "sign": 1,
        "strength": 1.0,
        "confidence": 0.95,
        "rationale": "Consumer demand directly drives production levels",
        "lagSteps": 0
      },
      {
        "source": "beef_production",
        "target": "methane_emissions",
        "sign": 1,
        "strength": 0.9,
        "confidence": 0.88,
        "rationale": "Cattle produce methane through enteric fermentation; beef cattle emit ~2.5kg CH4 per kg meat",
        "lagSteps": 0
      },
      {
        "source": "beef_production",
        "target": "feed_crop_demand",
        "sign": 1,
        "strength": 0.85,
        "confidence": 0.82,
        "rationale": "Beef requires approximately 6kg feed per kg meat produced",
        "lagSteps": 0
      },
      {
        "source": "beef_production",
        "target": "land_use",
        "sign": 1,
        "strength": 0.88,
        "confidence": 0.85,
        "rationale": "Cattle require significant grazing land and cropland for feed",
        "lagSteps": 0
      },
      {
        "source": "beef_production",
        "target": "water_consumption",
        "sign": 1,
        "strength": 0.82,
        "confidence": 0.78,
        "rationale": "Beef production requires ~15,000 liters of water per kg",
        "lagSteps": 0
      },
      {
        "source": "feed_crop_demand",
        "target": "co2_emissions",
        "sign": 1,
        "strength": 0.7,
        "confidence": 0.75,
        "rationale": "Feed production involves fertilizer, machinery, and transport emissions",
        "lagSteps": 2
      },
      {
        "source": "methane_emissions",
        "target": "co2_emissions",
        "sign": 1,
        "strength": 0.0,
        "confidence": 0.9,
        "rationale": "Methane tracked separately but contributes to CO2e calculations",
        "lagSteps": 0
      }
    ]
  },
  "propagationSteps": [
    {
      "step": 0,
      "affectedNodes": [
        {
          "nodeId": "beef_consumption",
          "label": "Beef Consumption",
          "delta": -20.8,
          "unit": "kg/year"
        },
        {
          "nodeId": "chicken_consumption",
          "label": "Chicken Consumption",
          "delta": 20.8,
          "unit": "kg/year"
        }
      ],
      "totalDelta": 0
    },
    {
      "step": 1,
      "affectedNodes": [
        {
          "nodeId": "beef_production",
          "label": "Beef Production",
          "delta": -20.8,
          "unit": "kg/year"
        },
        {
          "nodeId": "chicken_production",
          "label": "Chicken Production",
          "delta": 20.8,
          "unit": "kg/year"
        }
      ],
      "totalDelta": -312.0
    },
    {
      "step": 2,
      "affectedNodes": [
        {
          "nodeId": "methane_emissions",
          "label": "Methane Emissions",
          "delta": -18.7,
          "unit": "kg CH4/year"
        },
        {
          "nodeId": "feed_crop_demand",
          "label": "Feed Crop Demand",
          "delta": -124.8,
          "unit": "kg/year"
        },
        {
          "nodeId": "land_use",
          "label": "Agricultural Land Use",
          "delta": -156.0,
          "unit": "m²/year"
        },
        {
          "nodeId": "water_consumption",
          "label": "Water Consumption",
          "delta": -312480,
          "unit": "liters/year"
        }
      ],
      "totalDelta": -467.5
    },
    {
      "step": 3,
      "affectedNodes": [
        {
          "nodeId": "co2_emissions",
          "label": "CO2 Emissions",
          "delta": -89.4,
          "unit": "kg CO2/year"
        }
      ],
      "totalDelta": -556.9
    }
  ],
  "totals": {
    "carbon": {
      "value": -556.9,
      "unit": "kg CO2e/year",
      "confidence": 0.82,
      "breakdown": [
        {
          "label": "Methane reduction (CO2e)",
          "value": -467.5,
          "percentage": 83.9
        },
        {
          "label": "Direct CO2 reduction",
          "value": -89.4,
          "percentage": 16.1
        },
        {
          "label": "Chicken production emissions",
          "value": 52.0,
          "percentage": -9.3
        }
      ]
    },
    "water": {
      "value": -312480,
      "unit": "liters/year",
      "confidence": 0.78,
      "breakdown": [
        {
          "label": "Beef water footprint avoided",
          "value": -374400,
          "percentage": 119.8
        },
        {
          "label": "Chicken water footprint added",
          "value": 61920,
          "percentage": -19.8
        }
      ]
    },
    "waste": {
      "value": -8.3,
      "unit": "kg/year",
      "confidence": 0.65,
      "breakdown": [
        {
          "label": "Reduced manure waste",
          "value": -12.5,
          "percentage": 150.6
        },
        {
          "label": "Poultry litter added",
          "value": 4.2,
          "percentage": -50.6
        }
      ]
    }
  },
  "firstOrderEffects": [
    {
      "nodeId": "beef_consumption",
      "label": "Reduced beef consumption",
      "delta": -20.8,
      "unit": "kg/year",
      "order": 1
    },
    {
      "nodeId": "chicken_consumption",
      "label": "Increased chicken consumption",
      "delta": 20.8,
      "unit": "kg/year",
      "order": 1
    }
  ],
  "downstreamEffects": [
    {
      "nodeId": "methane_emissions",
      "label": "Reduced methane from cattle",
      "delta": -18.7,
      "unit": "kg CH4/year",
      "order": 2
    },
    {
      "nodeId": "feed_crop_demand",
      "label": "Reduced feed crop demand",
      "delta": -124.8,
      "unit": "kg/year",
      "order": 2
    },
    {
      "nodeId": "land_use",
      "label": "Reduced land use",
      "delta": -156.0,
      "unit": "m²/year",
      "order": 2
    },
    {
      "nodeId": "water_consumption",
      "label": "Reduced water consumption",
      "delta": -312480,
      "unit": "liters/year",
      "order": 2
    },
    {
      "nodeId": "co2_emissions",
      "label": "Reduced CO2 from feed production",
      "delta": -89.4,
      "unit": "kg CO2/year",
      "order": 3
    }
  ],
  "reboundEffects": [
    {
      "nodeId": "cost_savings_spending",
      "label": "Spending from cost savings",
      "delta": 15.2,
      "unit": "kg CO2e/year",
      "order": 2
    }
  ],
  "topDrivers": [
    {
      "nodeId": "methane_emissions",
      "label": "Methane Reduction",
      "contribution": -467.5,
      "unit": "kg CO2e/year",
      "percentage": 83.9,
      "explanation": "Cattle produce significant methane through enteric fermentation; chickens do not"
    },
    {
      "nodeId": "feed_crop_demand",
      "label": "Feed Efficiency Gains",
      "contribution": -45.2,
      "unit": "kg CO2e/year",
      "percentage": 8.1,
      "explanation": "Chickens require 2.5x less feed per kg meat than cattle"
    },
    {
      "nodeId": "land_use",
      "label": "Land Use Reduction",
      "contribution": -28.6,
      "unit": "kg CO2e/year",
      "percentage": 5.1,
      "explanation": "Reduced grazing land and feed cropland requirements"
    },
    {
      "nodeId": "co2_emissions",
      "label": "Direct Energy Savings",
      "contribution": -15.6,
      "unit": "kg CO2e/year",
      "percentage": 2.8,
      "explanation": "Lower energy intensity in poultry vs cattle operations"
    }
  ],
  "narrative": "Switching from beef to chicken for 2 meals per week over one year reduces your carbon footprint by approximately 557 kg CO2e - equivalent to driving 1,400 miles in an average car. The primary driver of this reduction (84%) is the elimination of methane emissions from cattle, as cows produce significant methane through their digestive process while chickens do not. Additionally, you would save over 312,000 liters of water annually, as beef production is one of the most water-intensive foods. The change also reduces agricultural land demand by 156 square meters. While chicken production does have environmental impacts, they are substantially lower than beef across all measured categories. A small rebound effect (~15 kg CO2e) may occur if cost savings are spent on other goods and services.",
  "assumptions": [
    {
      "id": "serving_size",
      "category": "data",
      "description": "Average serving size of 200g per meal",
      "sensitivity": "high",
      "source": "USDA Dietary Guidelines"
    },
    {
      "id": "sourcing",
      "category": "scope",
      "description": "Conventional (non-organic) meat production assumed",
      "sensitivity": "medium",
      "source": "Default production method"
    },
    {
      "id": "supply_chain",
      "category": "data",
      "description": "National average supply chain distances for US",
      "sensitivity": "low",
      "source": "USDA Economic Research Service"
    },
    {
      "id": "emission_factors",
      "category": "data",
      "description": "Emission factors based on peer-reviewed LCA studies",
      "sensitivity": "medium",
      "source": "Poore & Nemecek (2018), Science"
    },
    {
      "id": "substitution_ratio",
      "category": "behavior",
      "description": "1:1 weight substitution with no change in total consumption",
      "sensitivity": "medium"
    },
    {
      "id": "rebound_effect",
      "category": "methodology",
      "description": "10% of cost savings assumed to be spent on average consumption basket",
      "sensitivity": "low",
      "source": "Environmental Economics literature"
    }
  ],
  "limitations": [
    "Does not account for individual dietary nutritional requirements or health impacts",
    "Supply chain emissions may vary significantly by specific producer and retailer",
    "Seasonal variations in production efficiency not modeled",
    "Does not capture potential market-level effects if behavior is widely adopted",
    "Organic, grass-fed, or other production method variations not included",
    "End-of-life impacts (food waste at consumer level) not differentiated by meat type",
    "Regional electricity grid mix variations not fully captured",
    "Does not account for biodiversity impacts beyond land use metrics"
  ]
}
```

---

## Error Responses

### 400 Bad Request

Returned when the request body is malformed or contains invalid values.

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Validation failed",
    "details": [
      {
        "field": "adoptionRate",
        "message": "Must be between 0 and 1",
        "received": 1.5
      }
    ]
  }
}
```

### 422 Unprocessable Entity

Returned when the request is valid but the scenario cannot be simulated.

```json
{
  "error": {
    "code": "UNSUPPORTED_SCENARIO",
    "message": "Cannot model substitution between unrelated categories",
    "details": {
      "baseline": "beef consumption",
      "change": "solar panels"
    }
  }
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs during simulation.

```json
{
  "error": {
    "code": "SIMULATION_ERROR",
    "message": "An unexpected error occurred during graph propagation",
    "requestId": "req_abc123"
  }
}
```

---

## Rate Limits

| Tier       | Requests/minute | Requests/day |
|------------|-----------------|--------------|
| Free       | 10              | 100          |
| Pro        | 60              | 1,000        |
| Enterprise | 300             | 10,000       |

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1704412800
```

---

## Versioning

The API uses URL-based versioning. The current version is `v1`.

Breaking changes will result in a new version (e.g., `v2`). Non-breaking additions (new optional fields, new scenario types) may be added to the current version.

---

## Changelog

### v1.0.0 (2024-01-04)

- Initial API release
- Support for food_substitution, transport_substitution, plastic_ban, and reusable_adoption scenarios
- Full causal graph propagation with step-by-step tracking
- Carbon, water, and waste impact metrics
- Rebound effect modeling
