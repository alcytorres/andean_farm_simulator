from app import db
from datetime import datetime, timezone


class FarmBaseline(db.Model):
    __tablename__ = "farm_baseline"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, default="Hacienda Yerovi")

    # Land allocation (acres)
    total_acres = db.Column(db.Float, nullable=False, default=243.0)
    pasture_acres = db.Column(db.Float, nullable=False, default=100.0)
    broccoli_acres = db.Column(db.Float, nullable=False, default=72.0)
    young_cattle_acres = db.Column(db.Float, nullable=False, default=25.0)
    flower_acres = db.Column(db.Float, nullable=False, default=5.0)
    fallow_acres = db.Column(db.Float, nullable=False, default=21.0)
    non_productive_acres = db.Column(db.Float, nullable=False, default=20.0)

    # Livestock
    milking_cows = db.Column(db.Integer, nullable=False, default=130)
    young_cattle = db.Column(db.Integer, nullable=False, default=50)
    milk_per_cow_per_day = db.Column(db.Float, nullable=False, default=23.1)

    # Broccoli production
    broccoli_tons_per_hectare = db.Column(db.Float, nullable=False, default=14.0)
    broccoli_cycles_per_year = db.Column(db.Float, nullable=False, default=2.5)

    # Prices
    milk_price_per_liter = db.Column(db.Float, nullable=False, default=0.28)
    broccoli_price_per_ton = db.Column(db.Float, nullable=False, default=250.0)
    flower_annual_revenue = db.Column(db.Float, nullable=False, default=35000.0)

    # Labor costs
    num_workers = db.Column(db.Integer, nullable=False, default=20)
    worker_monthly_salary = db.Column(db.Float, nullable=False, default=500.0)
    manager_pct_of_revenue = db.Column(db.Float, nullable=False, default=6.0)
    manager_wife_pct_of_revenue = db.Column(db.Float, nullable=False, default=1.25)

    # Operating costs (annual)
    feed_cost_per_cow_per_month = db.Column(db.Float, nullable=False, default=70.0)
    crop_input_cost_per_hectare = db.Column(db.Float, nullable=False, default=2800.0)
    vet_annual = db.Column(db.Float, nullable=False, default=25000.0)
    fuel_transport_annual = db.Column(db.Float, nullable=False, default=30000.0)
    other_costs_annual = db.Column(db.Float, nullable=False, default=30000.0)

    # Weather parameters (base case)
    hailstorms_per_year = db.Column(db.Float, nullable=False, default=3.5)
    frost_events_per_year = db.Column(db.Float, nullable=False, default=6.0)
    crop_loss_per_hailstorm = db.Column(db.Float, nullable=False, default=3.0)
    crop_loss_per_frost = db.Column(db.Float, nullable=False, default=1.5)

    # Bull case weather
    bull_hailstorms = db.Column(db.Float, nullable=False, default=1.0)
    bull_frost_events = db.Column(db.Float, nullable=False, default=3.0)
    bull_price_modifier = db.Column(db.Float, nullable=False, default=10.0)

    # Bear case weather
    bear_hailstorms = db.Column(db.Float, nullable=False, default=5.0)
    bear_frost_events = db.Column(db.Float, nullable=False, default=10.0)
    bear_price_modifier = db.Column(db.Float, nullable=False, default=-10.0)

    # Constraints
    max_stocking_rate = db.Column(db.Float, nullable=False, default=4.0)
    min_fallow_pct = db.Column(db.Float, nullable=False, default=15.0)

    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class Scenario(db.Model):
    __tablename__ = "scenarios"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # Land allocation overrides
    pasture_acres = db.Column(db.Float, nullable=True)
    broccoli_acres = db.Column(db.Float, nullable=True)
    young_cattle_acres = db.Column(db.Float, nullable=True)
    flower_acres = db.Column(db.Float, nullable=True)
    fallow_acres = db.Column(db.Float, nullable=True)

    # Livestock overrides
    milking_cows = db.Column(db.Integer, nullable=True)
    young_cattle = db.Column(db.Integer, nullable=True)
    milk_per_cow_per_day = db.Column(db.Float, nullable=True)

    # Production overrides
    broccoli_tons_per_hectare = db.Column(db.Float, nullable=True)
    broccoli_cycles_per_year = db.Column(db.Float, nullable=True)

    # Price overrides
    milk_price_per_liter = db.Column(db.Float, nullable=True)
    broccoli_price_per_ton = db.Column(db.Float, nullable=True)
    flower_annual_revenue = db.Column(db.Float, nullable=True)

    # Labor overrides
    num_workers = db.Column(db.Integer, nullable=True)
    worker_monthly_salary = db.Column(db.Float, nullable=True)
    manager_pct_of_revenue = db.Column(db.Float, nullable=True)
    manager_wife_pct_of_revenue = db.Column(db.Float, nullable=True)

    # Operating cost overrides
    feed_cost_per_cow_per_month = db.Column(db.Float, nullable=True)
    crop_input_cost_per_hectare = db.Column(db.Float, nullable=True)
    vet_annual = db.Column(db.Float, nullable=True)
    fuel_transport_annual = db.Column(db.Float, nullable=True)
    other_costs_annual = db.Column(db.Float, nullable=True)

    # Weather overrides (base case for this scenario)
    hailstorms_per_year = db.Column(db.Float, nullable=True)
    frost_events_per_year = db.Column(db.Float, nullable=True)
    crop_loss_per_hailstorm = db.Column(db.Float, nullable=True)
    crop_loss_per_frost = db.Column(db.Float, nullable=True)

    created_at = db.Column(
        db.DateTime, default=lambda: datetime.now(timezone.utc)
    )
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

    def get_merged_params(self, baseline):
        """Merge scenario overrides with baseline defaults."""
        merged = baseline.to_dict()
        scenario_data = self.to_dict()

        skip = {"id", "name", "description", "created_at", "updated_at",
                "total_acres", "non_productive_acres",
                "bull_hailstorms", "bull_frost_events", "bull_price_modifier",
                "bear_hailstorms", "bear_frost_events", "bear_price_modifier",
                "max_stocking_rate", "min_fallow_pct"}

        for key, value in scenario_data.items():
            if key not in skip and value is not None:
                merged[key] = value

        return merged
