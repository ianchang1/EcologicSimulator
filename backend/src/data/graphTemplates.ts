import { GraphTemplate, Assumption } from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// CAUSAL GRAPH TEMPLATES
// These define the structure of cause-and-effect relationships for each scenario
// ═══════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 1: Food Substitution (Beef → Chicken)
// ─────────────────────────────────────────────────────────────────────────────

export const foodSubstitutionTemplate: GraphTemplate = {
  id: 'food_substitution',
  name: 'Food Substitution',
  description: 'Model the cascading effects of switching between protein sources',
  shockNodes: ['beef_consumption', 'chicken_consumption'],

  nodes: [
    // Behavior nodes (user actions)
    {
      id: 'beef_consumption',
      label: 'Beef Consumption',
      category: 'behavior',
      unit: 'kg/week',
      description: 'Weekly beef intake by the individual or group',
    },
    {
      id: 'chicken_consumption',
      label: 'Chicken Consumption',
      category: 'behavior',
      unit: 'kg/week',
      description: 'Weekly chicken intake by the individual or group',
    },

    // Direct emissions
    {
      id: 'beef_emissions',
      label: 'Beef Production Emissions',
      category: 'emissions',
      unit: 'kg CO₂e/week',
      description: 'Greenhouse gases from cattle farming, including methane',
    },
    {
      id: 'chicken_emissions',
      label: 'Chicken Production Emissions',
      category: 'emissions',
      unit: 'kg CO₂e/week',
      description: 'Greenhouse gases from poultry farming',
    },

    // Water usage
    {
      id: 'beef_water',
      label: 'Beef Water Footprint',
      category: 'water',
      unit: 'liters/week',
      description: 'Water used in beef production including feed crops',
    },
    {
      id: 'chicken_water',
      label: 'Chicken Water Footprint',
      category: 'water',
      unit: 'liters/week',
      description: 'Water used in chicken production including feed',
    },

    // Land use (second order)
    {
      id: 'pasture_land',
      label: 'Pasture Land Required',
      category: 'resource',
      unit: 'm²/week',
      description: 'Grazing land needed for cattle',
    },
    {
      id: 'feed_crop_land',
      label: 'Feed Crop Land',
      category: 'resource',
      unit: 'm²/week',
      description: 'Agricultural land for growing animal feed',
    },

    // Market effects
    {
      id: 'beef_demand',
      label: 'Beef Market Demand',
      category: 'market',
      unit: 'relative',
      description: 'Aggregate demand signal to beef industry',
    },
    {
      id: 'chicken_demand',
      label: 'Chicken Market Demand',
      category: 'market',
      unit: 'relative',
      description: 'Aggregate demand signal to poultry industry',
    },

    // Rebound effects
    {
      id: 'cost_savings',
      label: 'Cost Savings',
      category: 'rebound',
      unit: '$/week',
      description: 'Money saved from cheaper protein (chicken vs beef)',
    },
    {
      id: 'rebound_spending',
      label: 'Rebound Consumption',
      category: 'rebound',
      unit: 'kg CO₂e/week',
      description: 'Additional emissions from spending saved money elsewhere',
    },

    // Waste
    {
      id: 'packaging_waste',
      label: 'Packaging Waste',
      category: 'waste',
      unit: 'kg/week',
      description: 'Packaging materials from meat purchases',
    },

    // Third order effects
    {
      id: 'deforestation_pressure',
      label: 'Deforestation Pressure',
      category: 'emissions',
      unit: 'relative',
      description: 'Pressure on forests for agricultural expansion',
    },
  ],

  edges: [
    // Direct consumption → emissions
    { source: 'beef_consumption', target: 'beef_emissions', sign: 1, strength: 0.95, confidence: 0.9, rationale: 'Direct relationship: more beef consumed = more beef produced = more emissions', lagSteps: 0 },
    { source: 'chicken_consumption', target: 'chicken_emissions', sign: 1, strength: 0.95, confidence: 0.9, rationale: 'Direct relationship: more chicken consumed = more chicken produced = more emissions', lagSteps: 0 },

    // Consumption → water
    { source: 'beef_consumption', target: 'beef_water', sign: 1, strength: 0.95, confidence: 0.85, rationale: 'Beef production is water-intensive (feed, drinking, processing)', lagSteps: 0 },
    { source: 'chicken_consumption', target: 'chicken_water', sign: 1, strength: 0.95, confidence: 0.85, rationale: 'Chicken production requires water for birds and feed crops', lagSteps: 0 },

    // Consumption → market demand
    { source: 'beef_consumption', target: 'beef_demand', sign: 1, strength: 0.7, confidence: 0.6, rationale: 'Individual choices aggregate into market signals, but effect is diluted', lagSteps: 1 },
    { source: 'chicken_consumption', target: 'chicken_demand', sign: 1, strength: 0.7, confidence: 0.6, rationale: 'Increased chicken consumption increases market demand', lagSteps: 1 },

    // Consumption → land use
    { source: 'beef_consumption', target: 'pasture_land', sign: 1, strength: 0.8, confidence: 0.75, rationale: 'Cattle require significant grazing land', lagSteps: 0 },
    { source: 'beef_consumption', target: 'feed_crop_land', sign: 1, strength: 0.6, confidence: 0.7, rationale: 'Feedlot cattle require crops; grass-fed less so', lagSteps: 0 },
    { source: 'chicken_consumption', target: 'feed_crop_land', sign: 1, strength: 0.85, confidence: 0.8, rationale: 'Chickens are primarily grain-fed', lagSteps: 0 },

    // Land use → deforestation
    { source: 'pasture_land', target: 'deforestation_pressure', sign: 1, strength: 0.5, confidence: 0.5, rationale: 'More pasture demand can drive forest conversion, but depends on geography', lagSteps: 2 },
    { source: 'feed_crop_land', target: 'deforestation_pressure', sign: 1, strength: 0.4, confidence: 0.5, rationale: 'Soy/grain expansion linked to deforestation in some regions', lagSteps: 2 },

    // Deforestation → emissions
    { source: 'deforestation_pressure', target: 'beef_emissions', sign: 1, strength: 0.3, confidence: 0.4, rationale: 'Land use change emissions add to production emissions', lagSteps: 1 },

    // Cost savings → rebound
    { source: 'beef_consumption', target: 'cost_savings', sign: -1, strength: 0.8, confidence: 0.7, rationale: 'Less beef spending = more money available', lagSteps: 0 },
    { source: 'chicken_consumption', target: 'cost_savings', sign: -1, strength: 0.3, confidence: 0.7, rationale: 'Chicken costs offset some savings', lagSteps: 0 },
    { source: 'cost_savings', target: 'rebound_spending', sign: 1, strength: 0.5, confidence: 0.4, rationale: 'Saved money may be spent on other goods with carbon footprint', lagSteps: 1 },

    // Packaging
    { source: 'beef_consumption', target: 'packaging_waste', sign: 1, strength: 0.3, confidence: 0.6, rationale: 'Meat purchases generate packaging waste', lagSteps: 0 },
    { source: 'chicken_consumption', target: 'packaging_waste', sign: 1, strength: 0.35, confidence: 0.6, rationale: 'Chicken often has more packaging per kg', lagSteps: 0 },
  ],

  defaultAssumptions: [
    { id: 'beef_co2_per_kg', label: 'Beef emissions intensity', value: 27, unit: 'kg CO₂e/kg', adjustable: true, min: 20, max: 35, confidence: 0.8, source: 'PLACEHOLDER: lifecycle assessment studies' },
    { id: 'chicken_co2_per_kg', label: 'Chicken emissions intensity', value: 6.9, unit: 'kg CO₂e/kg', adjustable: true, min: 4, max: 10, confidence: 0.8, source: 'PLACEHOLDER: lifecycle assessment studies' },
    { id: 'beef_water_per_kg', label: 'Beef water intensity', value: 15400, unit: 'liters/kg', adjustable: true, min: 10000, max: 20000, confidence: 0.7, source: 'PLACEHOLDER: water footprint network' },
    { id: 'chicken_water_per_kg', label: 'Chicken water intensity', value: 4325, unit: 'liters/kg', adjustable: true, min: 3000, max: 6000, confidence: 0.7, source: 'PLACEHOLDER: water footprint network' },
    { id: 'beef_price_per_kg', label: 'Beef price', value: 12, unit: '$/kg', adjustable: true, min: 8, max: 20, confidence: 0.9, source: 'PLACEHOLDER: market averages' },
    { id: 'chicken_price_per_kg', label: 'Chicken price', value: 5, unit: '$/kg', adjustable: true, min: 3, max: 8, confidence: 0.9, source: 'PLACEHOLDER: market averages' },
    { id: 'rebound_rate', label: 'Rebound spending rate', value: 0.3, unit: 'fraction', adjustable: true, min: 0, max: 1, confidence: 0.4, source: 'PLACEHOLDER: economic studies' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 2: Transport Substitution (Uber → Bike)
// ─────────────────────────────────────────────────────────────────────────────

export const transportSubstitutionTemplate: GraphTemplate = {
  id: 'transport_substitution',
  name: 'Transport Substitution',
  description: 'Model the effects of switching between transportation modes',
  shockNodes: ['rideshare_trips', 'bike_trips'],

  nodes: [
    // Behavior
    { id: 'rideshare_trips', label: 'Rideshare Trips', category: 'behavior', unit: 'trips/week', description: 'Weekly Uber/Lyft trips' },
    { id: 'bike_trips', label: 'Bike Trips', category: 'behavior', unit: 'trips/week', description: 'Weekly bicycle trips' },

    // Direct emissions
    { id: 'vehicle_emissions', label: 'Vehicle Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Direct tailpipe emissions from rideshare vehicles' },
    { id: 'bike_emissions', label: 'Bike Lifecycle Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Amortized emissions from bike manufacturing' },

    // Energy
    { id: 'fuel_consumption', label: 'Fuel Consumption', category: 'energy', unit: 'liters/week', description: 'Gasoline used by rideshare vehicles' },
    { id: 'calorie_expenditure', label: 'Calorie Expenditure', category: 'energy', unit: 'kcal/week', description: 'Human energy burned while cycling' },

    // Second order - food
    { id: 'food_intake', label: 'Additional Food Intake', category: 'behavior', unit: 'kcal/week', description: 'Extra calories consumed to fuel cycling' },
    { id: 'food_emissions', label: 'Food-Related Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Emissions from producing extra food' },

    // Market effects
    { id: 'rideshare_demand', label: 'Rideshare Demand', category: 'market', unit: 'relative', description: 'Market signal to rideshare companies' },
    { id: 'deadhead_miles', label: 'Deadhead Miles', category: 'emissions', unit: 'km/week', description: 'Empty miles driven between pickups' },

    // Health co-benefits
    { id: 'physical_activity', label: 'Physical Activity', category: 'behavior', unit: 'minutes/week', description: 'Exercise time from cycling' },
    { id: 'health_benefit', label: 'Health Co-benefit', category: 'policy', unit: 'QALY', description: 'Quality-adjusted life years from exercise' },

    // Rebound
    { id: 'cost_savings', label: 'Cost Savings', category: 'rebound', unit: '$/week', description: 'Money saved from not using rideshare' },
    { id: 'rebound_travel', label: 'Rebound Travel', category: 'rebound', unit: 'kg CO₂e/week', description: 'Emissions from additional travel enabled by savings' },

    // Infrastructure
    { id: 'road_wear', label: 'Road Wear', category: 'resource', unit: 'relative', description: 'Infrastructure degradation from vehicle use' },

    // Waste
    { id: 'vehicle_waste', label: 'Vehicle Maintenance Waste', category: 'waste', unit: 'kg/week', description: 'Tires, oil, parts from vehicle maintenance' },
  ],

  edges: [
    // Direct effects
    { source: 'rideshare_trips', target: 'vehicle_emissions', sign: 1, strength: 0.95, confidence: 0.9, rationale: 'Each trip burns fuel and emits CO2', lagSteps: 0 },
    { source: 'rideshare_trips', target: 'fuel_consumption', sign: 1, strength: 0.95, confidence: 0.95, rationale: 'Direct relationship between trips and fuel', lagSteps: 0 },
    { source: 'bike_trips', target: 'bike_emissions', sign: 1, strength: 0.2, confidence: 0.7, rationale: 'Minimal emissions from bike wear and amortized manufacturing', lagSteps: 0 },

    // Energy expenditure chain
    { source: 'bike_trips', target: 'calorie_expenditure', sign: 1, strength: 0.9, confidence: 0.85, rationale: 'Cycling burns calories proportional to distance', lagSteps: 0 },
    { source: 'calorie_expenditure', target: 'food_intake', sign: 1, strength: 0.6, confidence: 0.5, rationale: 'Some additional food intake to compensate for exercise', lagSteps: 0 },
    { source: 'food_intake', target: 'food_emissions', sign: 1, strength: 0.8, confidence: 0.6, rationale: 'Food production has carbon footprint', lagSteps: 0 },

    // Market/deadhead
    { source: 'rideshare_trips', target: 'rideshare_demand', sign: 1, strength: 0.5, confidence: 0.5, rationale: 'Individual trips contribute to aggregate demand', lagSteps: 1 },
    { source: 'rideshare_trips', target: 'deadhead_miles', sign: 1, strength: 0.4, confidence: 0.6, rationale: 'Rideshare involves empty miles to reach passengers', lagSteps: 0 },
    { source: 'deadhead_miles', target: 'vehicle_emissions', sign: 1, strength: 0.8, confidence: 0.85, rationale: 'Deadhead miles produce emissions too', lagSteps: 0 },

    // Health
    { source: 'bike_trips', target: 'physical_activity', sign: 1, strength: 0.95, confidence: 0.95, rationale: 'Cycling is exercise', lagSteps: 0 },
    { source: 'physical_activity', target: 'health_benefit', sign: 1, strength: 0.7, confidence: 0.6, rationale: 'Regular exercise improves health outcomes', lagSteps: 2 },

    // Cost/rebound
    { source: 'rideshare_trips', target: 'cost_savings', sign: -1, strength: 0.9, confidence: 0.9, rationale: 'Fewer rideshare trips = less spending', lagSteps: 0 },
    { source: 'cost_savings', target: 'rebound_travel', sign: 1, strength: 0.3, confidence: 0.3, rationale: 'Some saved money may fund other carbon-intensive activities', lagSteps: 1 },

    // Infrastructure/waste
    { source: 'rideshare_trips', target: 'road_wear', sign: 1, strength: 0.6, confidence: 0.7, rationale: 'Vehicle weight causes road degradation', lagSteps: 0 },
    { source: 'rideshare_trips', target: 'vehicle_waste', sign: 1, strength: 0.4, confidence: 0.6, rationale: 'Vehicle use generates maintenance waste', lagSteps: 0 },
  ],

  defaultAssumptions: [
    { id: 'trip_distance', label: 'Average trip distance', value: 8, unit: 'km', adjustable: true, min: 2, max: 20, confidence: 0.7, source: 'PLACEHOLDER: urban mobility studies' },
    { id: 'rideshare_co2_per_km', label: 'Rideshare emissions', value: 0.21, unit: 'kg CO₂e/km', adjustable: true, min: 0.15, max: 0.3, confidence: 0.8, source: 'PLACEHOLDER: vehicle efficiency data' },
    { id: 'deadhead_ratio', label: 'Deadhead ratio', value: 0.4, unit: 'fraction', adjustable: true, min: 0.2, max: 0.6, confidence: 0.6, source: 'PLACEHOLDER: rideshare studies' },
    { id: 'cycling_calories_per_km', label: 'Cycling energy', value: 30, unit: 'kcal/km', adjustable: true, min: 20, max: 50, confidence: 0.8, source: 'PLACEHOLDER: exercise physiology' },
    { id: 'food_co2_per_kcal', label: 'Food emissions', value: 0.001, unit: 'kg CO₂e/kcal', adjustable: true, min: 0.0005, max: 0.003, confidence: 0.5, source: 'PLACEHOLDER: average diet' },
    { id: 'rideshare_cost_per_km', label: 'Rideshare cost', value: 1.5, unit: '$/km', adjustable: true, min: 0.8, max: 3, confidence: 0.8, source: 'PLACEHOLDER: market prices' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 3: Single-Use Plastic Ban
// ─────────────────────────────────────────────────────────────────────────────

export const plasticBanTemplate: GraphTemplate = {
  id: 'plastic_ban',
  name: 'Single-Use Plastic Ban',
  description: 'Model the effects of banning single-use plastics in a region',
  shockNodes: ['plastic_bag_use', 'paper_bag_use', 'reusable_bag_use'],

  nodes: [
    // Behavior
    { id: 'plastic_bag_use', label: 'Plastic Bag Use', category: 'behavior', unit: 'bags/week', description: 'Single-use plastic bags consumed' },
    { id: 'paper_bag_use', label: 'Paper Bag Use', category: 'behavior', unit: 'bags/week', description: 'Paper bags as substitutes' },
    { id: 'reusable_bag_use', label: 'Reusable Bag Use', category: 'behavior', unit: 'bags/week', description: 'Reusable bag trips' },

    // Production emissions
    { id: 'plastic_production_emissions', label: 'Plastic Production Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Emissions from manufacturing plastic bags' },
    { id: 'paper_production_emissions', label: 'Paper Production Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Emissions from paper bag production' },
    { id: 'reusable_production_emissions', label: 'Reusable Bag Emissions', category: 'emissions', unit: 'kg CO₂e/week', description: 'Amortized emissions from reusable bags' },

    // Water
    { id: 'paper_water_use', label: 'Paper Production Water', category: 'water', unit: 'liters/week', description: 'Water used in paper manufacturing' },
    { id: 'cotton_water_use', label: 'Cotton Bag Water', category: 'water', unit: 'liters/week', description: 'Water for cotton cultivation (reusable bags)' },

    // Waste streams
    { id: 'plastic_waste', label: 'Plastic Waste', category: 'waste', unit: 'kg/week', description: 'Plastic entering waste stream' },
    { id: 'paper_waste', label: 'Paper Waste', category: 'waste', unit: 'kg/week', description: 'Paper entering waste stream' },
    { id: 'ocean_plastic', label: 'Ocean Plastic', category: 'waste', unit: 'kg/week', description: 'Plastic leakage to ocean' },

    // Resource use
    { id: 'petroleum_demand', label: 'Petroleum Demand', category: 'resource', unit: 'liters/week', description: 'Oil used for plastic production' },
    { id: 'forestry_demand', label: 'Forestry Demand', category: 'resource', unit: 'm²/week', description: 'Forest resources for paper' },

    // Market
    { id: 'plastic_industry', label: 'Plastic Industry Revenue', category: 'market', unit: '$/week', description: 'Economic activity in plastic sector' },
    { id: 'alternative_industry', label: 'Alternative Industry Revenue', category: 'market', unit: '$/week', description: 'Economic activity in alternatives' },

    // Rebound/unintended
    { id: 'bag_forgetting', label: 'Forgotten Bag Purchases', category: 'rebound', unit: 'bags/week', description: 'Extra bags bought when reusables forgotten' },
    { id: 'thicker_plastic', label: 'Thicker Plastic Bags', category: 'rebound', unit: 'kg/week', description: 'Heavier "reusable" plastic bags as workaround' },
  ],

  edges: [
    // Direct production effects
    { source: 'plastic_bag_use', target: 'plastic_production_emissions', sign: 1, strength: 0.95, confidence: 0.9, rationale: 'More bags = more production = more emissions', lagSteps: 0 },
    { source: 'paper_bag_use', target: 'paper_production_emissions', sign: 1, strength: 0.95, confidence: 0.85, rationale: 'Paper bag production has significant emissions', lagSteps: 0 },
    { source: 'reusable_bag_use', target: 'reusable_production_emissions', sign: 1, strength: 0.3, confidence: 0.7, rationale: 'Amortized over many uses, per-trip emissions low', lagSteps: 0 },

    // Water use
    { source: 'paper_bag_use', target: 'paper_water_use', sign: 1, strength: 0.9, confidence: 0.8, rationale: 'Paper production is water-intensive', lagSteps: 0 },
    { source: 'reusable_bag_use', target: 'cotton_water_use', sign: 1, strength: 0.5, confidence: 0.6, rationale: 'Cotton bags have high water footprint amortized', lagSteps: 0 },

    // Waste
    { source: 'plastic_bag_use', target: 'plastic_waste', sign: 1, strength: 0.95, confidence: 0.95, rationale: 'Single-use plastic becomes waste', lagSteps: 0 },
    { source: 'paper_bag_use', target: 'paper_waste', sign: 1, strength: 0.9, confidence: 0.9, rationale: 'Paper bags become waste (but biodegradable)', lagSteps: 0 },
    { source: 'plastic_waste', target: 'ocean_plastic', sign: 1, strength: 0.1, confidence: 0.4, rationale: 'Some plastic leaks to ocean; varies by waste management', lagSteps: 1 },

    // Resources
    { source: 'plastic_bag_use', target: 'petroleum_demand', sign: 1, strength: 0.8, confidence: 0.85, rationale: 'Plastic derived from petroleum', lagSteps: 0 },
    { source: 'paper_bag_use', target: 'forestry_demand', sign: 1, strength: 0.7, confidence: 0.7, rationale: 'Paper requires wood pulp', lagSteps: 0 },

    // Market shifts
    { source: 'plastic_bag_use', target: 'plastic_industry', sign: 1, strength: 0.8, confidence: 0.8, rationale: 'Bag sales contribute to industry revenue', lagSteps: 0 },
    { source: 'paper_bag_use', target: 'alternative_industry', sign: 1, strength: 0.8, confidence: 0.8, rationale: 'Paper bags create alternative market', lagSteps: 0 },
    { source: 'reusable_bag_use', target: 'alternative_industry', sign: 1, strength: 0.6, confidence: 0.7, rationale: 'Reusable bags are one-time purchases', lagSteps: 0 },

    // Rebound effects
    { source: 'reusable_bag_use', target: 'bag_forgetting', sign: 1, strength: 0.3, confidence: 0.5, rationale: 'People sometimes forget reusable bags', lagSteps: 0 },
    { source: 'bag_forgetting', target: 'paper_bag_use', sign: 1, strength: 0.6, confidence: 0.6, rationale: 'Forgotten bags lead to single-use purchases', lagSteps: 0 },
    { source: 'plastic_bag_use', target: 'thicker_plastic', sign: -1, strength: 0.2, confidence: 0.4, rationale: 'Bans may shift to "reusable" thick plastic', lagSteps: 1 },
  ],

  defaultAssumptions: [
    { id: 'plastic_bag_co2', label: 'Plastic bag emissions', value: 0.04, unit: 'kg CO₂e/bag', adjustable: true, min: 0.02, max: 0.06, confidence: 0.8, source: 'PLACEHOLDER: LCA studies' },
    { id: 'paper_bag_co2', label: 'Paper bag emissions', value: 0.08, unit: 'kg CO₂e/bag', adjustable: true, min: 0.05, max: 0.12, confidence: 0.75, source: 'PLACEHOLDER: LCA studies' },
    { id: 'reusable_bag_co2', label: 'Reusable bag emissions', value: 1.5, unit: 'kg CO₂e/bag', adjustable: true, min: 0.5, max: 20, confidence: 0.6, source: 'PLACEHOLDER: varies by material' },
    { id: 'reusable_bag_uses', label: 'Reusable bag lifetime uses', value: 100, unit: 'uses', adjustable: true, min: 20, max: 500, confidence: 0.5, source: 'PLACEHOLDER: consumer studies' },
    { id: 'plastic_bag_weight', label: 'Plastic bag weight', value: 0.006, unit: 'kg', adjustable: true, min: 0.004, max: 0.01, confidence: 0.9, source: 'PLACEHOLDER: product specs' },
    { id: 'ocean_leakage_rate', label: 'Ocean leakage rate', value: 0.02, unit: 'fraction', adjustable: true, min: 0.005, max: 0.1, confidence: 0.3, source: 'PLACEHOLDER: waste management studies' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// TEMPLATE 4: Reusable Water Bottle Adoption
// ─────────────────────────────────────────────────────────────────────────────

export const reusableBottleTemplate: GraphTemplate = {
  id: 'reusable_adoption',
  name: 'Reusable Water Bottle Adoption',
  description: 'Model the lifecycle effects of switching from disposable to reusable bottles',
  shockNodes: ['disposable_bottles', 'reusable_bottle_use'],

  nodes: [
    // Behavior
    { id: 'disposable_bottles', label: 'Disposable Bottles', category: 'behavior', unit: 'bottles/week', description: 'Single-use plastic water bottles consumed' },
    { id: 'reusable_bottle_use', label: 'Reusable Bottle Use', category: 'behavior', unit: 'fills/week', description: 'Times reusable bottle is filled' },

    // Production
    { id: 'pet_production', label: 'PET Bottle Production', category: 'emissions', unit: 'kg CO₂e/week', description: 'Emissions from manufacturing disposable bottles' },
    { id: 'reusable_production', label: 'Reusable Bottle Production', category: 'emissions', unit: 'kg CO₂e/week', description: 'Amortized emissions from reusable bottle manufacturing' },

    // Water
    { id: 'bottled_water_extraction', label: 'Water Extraction', category: 'water', unit: 'liters/week', description: 'Water extracted for bottling (often more than bottle contains)' },
    { id: 'washing_water', label: 'Washing Water', category: 'water', unit: 'liters/week', description: 'Water used to clean reusable bottles' },
    { id: 'tap_water', label: 'Tap Water Use', category: 'water', unit: 'liters/week', description: 'Municipal water used to fill reusable bottles' },

    // Energy
    { id: 'transportation_energy', label: 'Transportation Energy', category: 'energy', unit: 'kWh/week', description: 'Energy to transport bottled water' },
    { id: 'refrigeration_energy', label: 'Refrigeration Energy', category: 'energy', unit: 'kWh/week', description: 'Energy to chill bottled water in stores' },

    // Waste
    { id: 'plastic_bottle_waste', label: 'Plastic Bottle Waste', category: 'waste', unit: 'kg/week', description: 'Disposable bottles entering waste stream' },
    { id: 'recycling_rate', label: 'Recycling Diversion', category: 'waste', unit: 'kg/week', description: 'Bottles successfully recycled' },
    { id: 'landfill_waste', label: 'Landfill Waste', category: 'waste', unit: 'kg/week', description: 'Bottles going to landfill' },

    // Market
    { id: 'bottled_water_demand', label: 'Bottled Water Demand', category: 'market', unit: '$/week', description: 'Market demand for bottled water' },
    { id: 'reusable_bottle_market', label: 'Reusable Bottle Market', category: 'market', unit: '$/week', description: 'Market for reusable bottles' },

    // Infrastructure
    { id: 'water_fountain_demand', label: 'Water Fountain Demand', category: 'policy', unit: 'relative', description: 'Demand for public water fountains' },

    // Rebound
    { id: 'cost_savings', label: 'Cost Savings', category: 'rebound', unit: '$/week', description: 'Money saved vs buying bottled water' },
    { id: 'convenience_effect', label: 'Convenience Offset', category: 'rebound', unit: 'bottles/week', description: 'Occasional bottled water purchases for convenience' },
  ],

  edges: [
    // Production emissions
    { source: 'disposable_bottles', target: 'pet_production', sign: 1, strength: 0.95, confidence: 0.9, rationale: 'Each bottle requires manufacturing', lagSteps: 0 },
    { source: 'reusable_bottle_use', target: 'reusable_production', sign: 1, strength: 0.15, confidence: 0.7, rationale: 'Amortized over hundreds of uses', lagSteps: 0 },

    // Water
    { source: 'disposable_bottles', target: 'bottled_water_extraction', sign: 1, strength: 0.95, confidence: 0.85, rationale: 'Bottled water requires water extraction', lagSteps: 0 },
    { source: 'reusable_bottle_use', target: 'washing_water', sign: 1, strength: 0.6, confidence: 0.7, rationale: 'Reusable bottles need washing', lagSteps: 0 },
    { source: 'reusable_bottle_use', target: 'tap_water', sign: 1, strength: 0.95, confidence: 0.95, rationale: 'Reusable bottles filled with tap water', lagSteps: 0 },

    // Energy
    { source: 'disposable_bottles', target: 'transportation_energy', sign: 1, strength: 0.8, confidence: 0.8, rationale: 'Bottled water is heavy and transported long distances', lagSteps: 0 },
    { source: 'disposable_bottles', target: 'refrigeration_energy', sign: 1, strength: 0.6, confidence: 0.7, rationale: 'Store refrigeration for cold bottles', lagSteps: 0 },

    // Waste flow
    { source: 'disposable_bottles', target: 'plastic_bottle_waste', sign: 1, strength: 0.95, confidence: 0.95, rationale: 'Disposable bottles become waste', lagSteps: 0 },
    { source: 'plastic_bottle_waste', target: 'recycling_rate', sign: 1, strength: 0.3, confidence: 0.5, rationale: 'Some bottles are recycled', lagSteps: 0 },
    { source: 'plastic_bottle_waste', target: 'landfill_waste', sign: 1, strength: 0.7, confidence: 0.6, rationale: 'Most bottles end in landfill', lagSteps: 0 },

    // Market
    { source: 'disposable_bottles', target: 'bottled_water_demand', sign: 1, strength: 0.8, confidence: 0.8, rationale: 'Purchases signal demand', lagSteps: 0 },
    { source: 'reusable_bottle_use', target: 'reusable_bottle_market', sign: 1, strength: 0.5, confidence: 0.6, rationale: 'Adoption grows reusable market', lagSteps: 1 },
    { source: 'reusable_bottle_use', target: 'water_fountain_demand', sign: 1, strength: 0.4, confidence: 0.4, rationale: 'More reusable users want fill stations', lagSteps: 2 },

    // Rebound
    { source: 'disposable_bottles', target: 'cost_savings', sign: -1, strength: 0.9, confidence: 0.9, rationale: 'Fewer purchases = savings', lagSteps: 0 },
    { source: 'reusable_bottle_use', target: 'convenience_effect', sign: 1, strength: 0.2, confidence: 0.4, rationale: 'Sometimes buy bottled for convenience', lagSteps: 0 },
    { source: 'convenience_effect', target: 'disposable_bottles', sign: 1, strength: 0.8, confidence: 0.7, rationale: 'Convenience purchases add to disposable use', lagSteps: 0 },
  ],

  defaultAssumptions: [
    { id: 'pet_bottle_co2', label: 'PET bottle emissions', value: 0.082, unit: 'kg CO₂e/bottle', adjustable: true, min: 0.05, max: 0.15, confidence: 0.8, source: 'PLACEHOLDER: LCA studies' },
    { id: 'reusable_bottle_co2', label: 'Reusable bottle emissions', value: 2.5, unit: 'kg CO₂e/bottle', adjustable: true, min: 1, max: 8, confidence: 0.6, source: 'PLACEHOLDER: varies by material' },
    { id: 'reusable_bottle_lifetime', label: 'Reusable bottle lifetime', value: 500, unit: 'fills', adjustable: true, min: 100, max: 2000, confidence: 0.5, source: 'PLACEHOLDER: product lifespan studies' },
    { id: 'bottle_water_ratio', label: 'Water extraction ratio', value: 1.5, unit: 'liters extracted per liter bottled', adjustable: true, min: 1.2, max: 3, confidence: 0.6, source: 'PLACEHOLDER: industry reports' },
    { id: 'washing_water_per_wash', label: 'Washing water', value: 0.5, unit: 'liters/wash', adjustable: true, min: 0.2, max: 2, confidence: 0.7, source: 'PLACEHOLDER: household studies' },
    { id: 'recycling_rate_value', label: 'Recycling rate', value: 0.29, unit: 'fraction', adjustable: true, min: 0.1, max: 0.9, confidence: 0.7, source: 'PLACEHOLDER: EPA data' },
    { id: 'bottled_water_cost', label: 'Bottled water cost', value: 1.5, unit: '$/bottle', adjustable: true, min: 0.5, max: 3, confidence: 0.9, source: 'PLACEHOLDER: market prices' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Export all templates
// ─────────────────────────────────────────────────────────────────────────────

export const graphTemplates: Record<string, GraphTemplate> = {
  food_substitution: foodSubstitutionTemplate,
  transport_substitution: transportSubstitutionTemplate,
  plastic_ban: plasticBanTemplate,
  reusable_adoption: reusableBottleTemplate,
};

export default graphTemplates;
