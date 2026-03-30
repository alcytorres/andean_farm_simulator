import { useEffect, useState, useCallback, useRef } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { api } from "../services/api";
import { formatCurrencyFull, formatDelta } from "../services/format";
import ParamInput from "../components/ParamInput";
import ConstraintBadge from "../components/ConstraintBadge";
import type { FarmParams, AllCases } from "../types/farm";

export default function ScenarioBuilder() {
  const [baselineParams, setBaselineParams] = useState<FarmParams | null>(null);
  const [baselineResults, setBaselineResults] = useState<AllCases | null>(null);
  const [params, setParams] = useState<Record<string, number>>({});
  const [results, setResults] = useState<AllCases | null>(null);
  const [saving, setSaving] = useState(false);
  const [scenarioName, setScenarioName] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    api.getBaseline().then((data) => {
      setBaselineParams(data.params);
      setBaselineResults(data.results);
      const editable: Record<string, number> = {};
      const skip = new Set(["id", "name", "updated_at", "total_acres", "non_productive_acres",
        "bull_hailstorms", "bull_frost_events", "bull_price_modifier",
        "bear_hailstorms", "bear_frost_events", "bear_price_modifier",
        "max_stocking_rate", "min_fallow_pct"]);
      for (const [k, v] of Object.entries(data.params)) {
        if (!skip.has(k) && typeof v === "number") editable[k] = v;
      }
      setParams(editable);
      setResults(data.results);
    });
  }, []);

  const recalculate = useCallback(
    (updated: Record<string, number>) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        api.calculate(updated).then((r) => setResults(r.results)).catch(() => {});
      }, 200);
    },
    []
  );

  const set = (key: string, value: number) => {
    const updated = { ...params, [key]: value };
    setParams(updated);
    recalculate(updated);
  };

  const handleSave = async () => {
    if (!scenarioName.trim()) return;
    setSaving(true);
    setSaveMsg("");

    const overrides: Record<string, unknown> = { name: scenarioName.trim() };
    if (baselineParams) {
      const skip = new Set(["id", "name", "updated_at", "total_acres", "non_productive_acres",
        "bull_hailstorms", "bull_frost_events", "bull_price_modifier",
        "bear_hailstorms", "bear_frost_events", "bear_price_modifier",
        "max_stocking_rate", "min_fallow_pct"]);
      for (const [k, v] of Object.entries(params)) {
        const bv = baselineParams[k as keyof FarmParams];
        if (!skip.has(k) && v !== bv) overrides[k] = v;
      }
    }

    try {
      await api.createScenario(overrides as { name: string } & Record<string, unknown>);
      setSaveMsg(`Saved "${scenarioName.trim()}"`);
      setScenarioName("");
    } catch {
      setSaveMsg("Failed to save");
    }
    setSaving(false);
  };

  if (!baselineParams || !results || !baselineResults) {
    return <div className="p-6 text-slate-400">Loading...</div>;
  }

  const base = results.base;
  const baselineProfit = baselineResults.base.profit;
  const delta = base.profit - baselineProfit;

  const caseData = [
    { name: "Bear", profit: results.bear.profit },
    { name: "Base", profit: results.base.profit },
    { name: "Bull", profit: results.bull.profit },
  ];

  const revenueBreakdown = [
    { name: "Milk", value: base.revenue.milk },
    { name: "Broccoli", value: base.revenue.broccoli },
    { name: "Flowers", value: base.revenue.flowers },
  ];

  const allocatedAcres =
    (params.pasture_acres || 0) +
    (params.broccoli_acres || 0) +
    (params.young_cattle_acres || 0) +
    (params.flower_acres || 0) +
    (params.fallow_acres || 0) +
    baselineParams.non_productive_acres;

  return (
    <div className="p-5 max-w-7xl">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Scenario Builder</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Inputs */}
        <div className="space-y-3">
          {/* Land Allocation */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Land Allocation</h3>
            <ParamInput label="Pasture" value={params.pasture_acres ?? 0} onChange={(v) => set("pasture_acres", v)} suffix="ac" step={5} min={0} />
            <ParamInput label="Broccoli" value={params.broccoli_acres ?? 0} onChange={(v) => set("broccoli_acres", v)} suffix="ac" step={5} min={0} />
            <ParamInput label="Young Cattle" value={params.young_cattle_acres ?? 0} onChange={(v) => set("young_cattle_acres", v)} suffix="ac" step={5} min={0} />
            <ParamInput label="Flowers" value={params.flower_acres ?? 0} onChange={(v) => set("flower_acres", v)} suffix="ac" step={1} min={0} />
            <ParamInput label="Fallow" value={params.fallow_acres ?? 0} onChange={(v) => set("fallow_acres", v)} suffix="ac" step={5} min={0} />
            <div className={`mt-1.5 text-xs font-medium ${Math.abs(allocatedAcres - baselineParams.total_acres) < 0.5 ? "text-emerald-600" : "text-red-500"}`}>
              Total: {allocatedAcres.toFixed(1)} / {baselineParams.total_acres} acres
            </div>
          </div>

          {/* Livestock & Prices */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Livestock & Prices</h3>
            <ParamInput label="Milking cows" value={params.milking_cows ?? 0} onChange={(v) => set("milking_cows", v)} min={0} />
            <ParamInput label="Young cattle" value={params.young_cattle ?? 0} onChange={(v) => set("young_cattle", v)} min={0} />
            <ParamInput label="Milk $/L" value={params.milk_price_per_liter ?? 0} onChange={(v) => set("milk_price_per_liter", v)} prefix="$" step={0.01} min={0} />
            <ParamInput label="Broccoli $/ton" value={params.broccoli_price_per_ton ?? 0} onChange={(v) => set("broccoli_price_per_ton", v)} prefix="$" step={10} min={0} />
            <ParamInput label="Flower rev/yr" value={params.flower_annual_revenue ?? 0} onChange={(v) => set("flower_annual_revenue", v)} prefix="$" step={1000} min={0} />
          </div>

          {/* Production */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Production</h3>
            <ParamInput label="Milk L/cow/day" value={params.milk_per_cow_per_day ?? 0} onChange={(v) => set("milk_per_cow_per_day", v)} step={0.5} min={0} />
            <ParamInput label="Broccoli tons/ha" value={params.broccoli_tons_per_hectare ?? 0} onChange={(v) => set("broccoli_tons_per_hectare", v)} step={0.5} min={0} />
            <ParamInput label="Broccoli cycles/yr" value={params.broccoli_cycles_per_year ?? 0} onChange={(v) => set("broccoli_cycles_per_year", v)} step={0.5} min={0} />
          </div>

          {/* Costs */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Costs</h3>
            <ParamInput label="Workers" value={params.num_workers ?? 0} onChange={(v) => set("num_workers", v)} min={0} />
            <ParamInput label="Worker $/mo" value={params.worker_monthly_salary ?? 0} onChange={(v) => set("worker_monthly_salary", v)} prefix="$" step={25} min={0} />
            <ParamInput label="Mgr % of rev" value={params.manager_pct_of_revenue ?? 0} onChange={(v) => set("manager_pct_of_revenue", v)} suffix="%" step={0.5} min={0} />
            <ParamInput label="Feed $/cow/mo" value={params.feed_cost_per_cow_per_month ?? 0} onChange={(v) => set("feed_cost_per_cow_per_month", v)} prefix="$" step={5} min={0} />
            <ParamInput label="Crop input $/ha" value={params.crop_input_cost_per_hectare ?? 0} onChange={(v) => set("crop_input_cost_per_hectare", v)} prefix="$" step={100} min={0} />
          </div>

          {/* Weather */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Weather</h3>
            <ParamInput label="Hailstorms/yr" value={params.hailstorms_per_year ?? 0} onChange={(v) => set("hailstorms_per_year", v)} step={0.5} min={0} />
            <ParamInput label="Frost events/yr" value={params.frost_events_per_year ?? 0} onChange={(v) => set("frost_events_per_year", v)} step={1} min={0} />
            <ParamInput label="Crop loss/hail" value={params.crop_loss_per_hailstorm ?? 0} onChange={(v) => set("crop_loss_per_hailstorm", v)} suffix="%" step={1} min={0} />
            <ParamInput label="Crop loss/frost" value={params.crop_loss_per_frost ?? 0} onChange={(v) => set("crop_loss_per_frost", v)} suffix="%" step={1} min={0} />
          </div>
        </div>

        {/* Right: Results (sticky) */}
        <div className="lg:sticky lg:top-4 lg:self-start space-y-3">
          {/* Projected Results */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Projected Results
            </h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Revenue</span>
                <span className="font-semibold">{formatCurrencyFull(base.revenue.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Costs</span>
                <span className="font-semibold text-red-500">-{formatCurrencyFull(base.costs.total)}</span>
              </div>
              <hr className="my-1" />
              <div className="flex justify-between text-base">
                <span className="font-bold text-slate-700">Profit</span>
                <span className="font-bold text-emerald-600">{formatCurrencyFull(base.profit)}</span>
              </div>
              <div className={`text-xs text-right ${delta >= 0 ? "text-emerald-500" : "text-red-500"}`}>
                vs baseline: {formatDelta(delta)} ({delta !== 0 ? ((delta / baselineProfit) * 100).toFixed(1) : "0"}%)
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Constraints
            </h3>
            <div className="space-y-1.5">
              <ConstraintBadge
                label="Stocking rate"
                value={`${base.constraints.stocking_rate}/ha`}
                ok={base.constraints.stocking_rate_ok}
                warning={`exceeds ${baselineParams.max_stocking_rate}/ha max`}
              />
              <ConstraintBadge
                label="Fallow ratio"
                value={`${base.constraints.fallow_ratio}%`}
                ok={base.constraints.fallow_ratio_ok}
                warning={`below ${baselineParams.min_fallow_pct}% minimum`}
              />
              <ConstraintBadge
                label="Total acres"
                value={`${base.constraints.total_acres_allocated}/${baselineParams.total_acres}`}
                ok={base.constraints.total_acres_ok}
                warning="does not equal total farm area"
              />
            </div>
          </div>

          {/* Bull/Base/Bear */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Base / Bull / Bear
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center mb-2">
              <div className="bg-red-50 rounded-md py-2">
                <p className="text-[10px] text-red-400 uppercase">Bear</p>
                <p className="text-sm font-bold text-red-600">{formatCurrencyFull(results.bear.profit)}</p>
              </div>
              <div className="bg-emerald-50 rounded-md py-2">
                <p className="text-[10px] text-emerald-400 uppercase">Base</p>
                <p className="text-sm font-bold text-emerald-600">{formatCurrencyFull(results.base.profit)}</p>
              </div>
              <div className="bg-blue-50 rounded-md py-2">
                <p className="text-[10px] text-blue-400 uppercase">Bull</p>
                <p className="text-sm font-bold text-blue-600">{formatCurrencyFull(results.bull.profit)}</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={caseData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} width={40} />
                <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
                <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
                  {caseData.map((_, i) => (
                    <Cell key={i} fill={["#ef4444", "#10b981", "#3b82f6"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Revenue Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={110}>
              <BarChart data={revenueBreakdown} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={55} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Save */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-4 py-3">
            <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
              Save Scenario
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Scenario name..."
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="flex-1 text-xs border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleSave}
                disabled={saving || !scenarioName.trim()}
                className="bg-emerald-600 text-white text-xs font-medium px-3 py-1.5 rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
            {saveMsg && <p className="text-xs text-emerald-600 mt-1">{saveMsg}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
