"""
Profit calculation engine for Hacienda Yerovi.

Takes a set of farm parameters and computes projected annual revenue,
costs, profit, and constraint validation. Supports base/bull/bear case
generation by varying weather and price assumptions.
"""

ACRES_PER_HECTARE = 2.47105


def calculate_profit(params, weather_override=None, price_modifier_pct=0):
    """
    Calculate projected annual financials for a given farm configuration.

    Args:
        params: dict of farm parameters (merged baseline + scenario overrides)
        weather_override: optional dict with hailstorms_per_year, frost_events_per_year
        price_modifier_pct: percentage to shift broccoli and milk prices (e.g. 10 = +10%)

    Returns:
        dict with revenue, cost, profit breakdowns and constraint checks
    """
    p = params
    weather = weather_override or {}
    hailstorms = weather.get("hailstorms_per_year", p["hailstorms_per_year"])
    frost_events = weather.get("frost_events_per_year", p["frost_events_per_year"])

    price_mult = 1 + (price_modifier_pct / 100)

    # --- REVENUE ---

    # Milk: liters/cow/day × cows × 365 × price/liter
    annual_milk_liters = p["milk_per_cow_per_day"] * p["milking_cows"] * 365
    milk_price = p["milk_price_per_liter"] * price_mult
    milk_revenue = annual_milk_liters * milk_price

    # Broccoli: hectares × tons/ha/cycle × cycles/year × price/ton, minus weather losses
    broccoli_hectares = p["broccoli_acres"] / ACRES_PER_HECTARE
    gross_broccoli_tons = (
        broccoli_hectares
        * p["broccoli_tons_per_hectare"]
        * p["broccoli_cycles_per_year"]
    )

    # Weather damage: each event destroys a % of the annual crop
    # Cap total loss at 80% — even in a catastrophic year, some broccoli survives
    hail_loss_pct = hailstorms * p["crop_loss_per_hailstorm"]
    frost_loss_pct = frost_events * p["crop_loss_per_frost"]
    total_crop_loss_pct = min(hail_loss_pct + frost_loss_pct, 80)

    net_broccoli_tons = gross_broccoli_tons * (1 - total_crop_loss_pct / 100)
    broccoli_price = p["broccoli_price_per_ton"] * price_mult
    broccoli_revenue = net_broccoli_tons * broccoli_price

    flower_revenue = p["flower_annual_revenue"]

    total_revenue = milk_revenue + broccoli_revenue + flower_revenue

    # --- COSTS ---

    # Labor
    worker_cost = p["num_workers"] * p["worker_monthly_salary"] * 12
    manager_cost = total_revenue * (p["manager_pct_of_revenue"] / 100)
    manager_wife_cost = total_revenue * (p["manager_wife_pct_of_revenue"] / 100)
    total_labor = worker_cost + manager_cost + manager_wife_cost

    # Feed for all cattle (milking + young at reduced rate)
    milking_feed = p["milking_cows"] * p["feed_cost_per_cow_per_month"] * 12
    young_feed = p["young_cattle"] * (p["feed_cost_per_cow_per_month"] * 0.4) * 12
    total_feed = milking_feed + young_feed

    # Crop inputs (broccoli only — flowers are the lessee's cost)
    crop_inputs = broccoli_hectares * p["crop_input_cost_per_hectare"]

    vet_cost = p["vet_annual"]
    fuel_cost = p["fuel_transport_annual"]
    other_cost = p["other_costs_annual"]

    total_costs = total_labor + total_feed + crop_inputs + vet_cost + fuel_cost + other_cost

    profit = total_revenue - total_costs

    # --- CONSTRAINTS ---

    pasture_hectares = p["pasture_acres"] / ACRES_PER_HECTARE
    stocking_rate = p["milking_cows"] / pasture_hectares if pasture_hectares > 0 else 999

    productive_broccoli_land = p["broccoli_acres"] + p["fallow_acres"]
    fallow_ratio = (
        (p["fallow_acres"] / productive_broccoli_land * 100)
        if productive_broccoli_land > 0
        else 0
    )

    allocated = (
        p["pasture_acres"]
        + p["broccoli_acres"]
        + p["young_cattle_acres"]
        + p["flower_acres"]
        + p["fallow_acres"]
        + p["non_productive_acres"]
    )

    constraints = {
        "stocking_rate": round(stocking_rate, 2),
        "stocking_rate_ok": stocking_rate <= p["max_stocking_rate"],
        "fallow_ratio": round(fallow_ratio, 1),
        "fallow_ratio_ok": fallow_ratio >= p["min_fallow_pct"],
        "total_acres_allocated": round(allocated, 1),
        "total_acres_ok": abs(allocated - p["total_acres"]) < 0.5,
    }

    # Weather risk: % of revenue from weather-vulnerable broccoli
    weather_exposure = (broccoli_revenue / total_revenue * 100) if total_revenue > 0 else 0

    return {
        "revenue": {
            "milk": round(milk_revenue),
            "broccoli": round(broccoli_revenue),
            "flowers": round(flower_revenue),
            "total": round(total_revenue),
        },
        "costs": {
            "labor": round(total_labor),
            "feed": round(total_feed),
            "crop_inputs": round(crop_inputs),
            "vet": round(vet_cost),
            "fuel_transport": round(fuel_cost),
            "other": round(other_cost),
            "total": round(total_costs),
        },
        "profit": round(profit),
        "weather_impact": {
            "hailstorms": hailstorms,
            "frost_events": frost_events,
            "total_crop_loss_pct": round(total_crop_loss_pct, 1),
            "gross_broccoli_tons": round(gross_broccoli_tons, 1),
            "net_broccoli_tons": round(net_broccoli_tons, 1),
        },
        "constraints": constraints,
        "weather_exposure_pct": round(weather_exposure, 1),
    }


def calculate_all_cases(params, baseline_params):
    """
    Generate base, bull, and bear case projections for a set of params.
    Bull/bear weather and price settings come from the baseline config.
    """
    base = calculate_profit(params)

    bull_weather = {
        "hailstorms_per_year": baseline_params["bull_hailstorms"],
        "frost_events_per_year": baseline_params["bull_frost_events"],
    }
    bull = calculate_profit(
        params,
        weather_override=bull_weather,
        price_modifier_pct=baseline_params["bull_price_modifier"],
    )

    bear_weather = {
        "hailstorms_per_year": baseline_params["bear_hailstorms"],
        "frost_events_per_year": baseline_params["bear_frost_events"],
    }
    bear = calculate_profit(
        params,
        weather_override=bear_weather,
        price_modifier_pct=baseline_params["bear_price_modifier"],
    )

    return {"base": base, "bull": bull, "bear": bear}
