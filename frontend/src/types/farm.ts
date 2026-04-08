export interface FarmParams {
  id: number;
  name: string;
  total_acres: number;
  pasture_acres: number;
  broccoli_acres: number;
  young_cattle_acres: number;
  flower_acres: number;
  fallow_acres: number;
  non_productive_acres: number;
  milking_cows: number;
  young_cattle: number;
  milk_per_cow_per_day: number;
  broccoli_tons_per_hectare: number;
  broccoli_cycles_per_year: number;
  milk_price_per_liter: number;
  broccoli_price_per_ton: number;
  flower_annual_revenue: number;
  num_workers: number;
  worker_monthly_salary: number;
  manager_pct_of_revenue: number;
  manager_wife_pct_of_revenue: number;
  feed_cost_per_cow_per_month: number;
  crop_input_cost_per_hectare: number;
  vet_annual: number;
  fuel_transport_annual: number;
  other_costs_annual: number;
  hailstorms_per_year: number;
  frost_events_per_year: number;
  crop_loss_per_hailstorm: number;
  crop_loss_per_frost: number;
  bull_hailstorms: number;
  bull_frost_events: number;
  bull_price_modifier: number;
  bear_hailstorms: number;
  bear_frost_events: number;
  bear_price_modifier: number;
  max_stocking_rate: number;
  min_fallow_pct: number;
}

export interface CaseResult {
  revenue: {
    milk: number;
    broccoli: number;
    flowers: number;
    total: number;
  };
  costs: {
    labor: number;
    feed: number;
    crop_inputs: number;
    vet: number;
    fuel_transport: number;
    other: number;
    total: number;
  };
  profit: number;
  weather_impact: {
    hailstorms: number;
    frost_events: number;
    total_crop_loss_pct: number;
    gross_broccoli_tons: number;
    net_broccoli_tons: number;
  };
  constraints: {
    stocking_rate: number;
    stocking_rate_ok: boolean;
    fallow_ratio: number;
    fallow_ratio_ok: boolean;
    total_acres_allocated: number;
    total_acres_ok: boolean;
  };
  weather_exposure_pct: number;
}

export interface AllCases {
  base: CaseResult;
  bull: CaseResult;
  bear: CaseResult;
}

export interface BaselineResponse {
  params: FarmParams;
  results: AllCases;
}

export interface ScenarioData {
  id: number;
  name: string;
  description: string | null;
  overrides: Record<string, number>;
  results: AllCases;
  created_at: string;
}

