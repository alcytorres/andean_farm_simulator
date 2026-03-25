import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import { formatCurrencyFull } from "../services/format";
import type { ScenarioData, BaselineResponse } from "../types/farm";

export default function CompareScenarios() {
  const [scenarios, setScenarios] = useState<ScenarioData[]>([]);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getScenarios(), api.getBaseline()]).then(([sc, bl]) => {
      setScenarios(sc);
      setBaseline(bl);
      setLoading(false);
    });
  }, []);

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 4) next.add(id);
      return next;
    });
  };

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;

  type CompareItem = {
    name: string;
    bear: number;
    base: number;
    bull: number;
    revenue: number;
    costs: number;
    broccoli_acres?: number;
    pasture_acres?: number;
    milking_cows?: number;
    weather_exposure: number;
  };

  const items: CompareItem[] = [];

  if (baseline) {
    items.push({
      name: "Baseline",
      bear: baseline.results.bear.profit,
      base: baseline.results.base.profit,
      bull: baseline.results.bull.profit,
      revenue: baseline.results.base.revenue.total,
      costs: baseline.results.base.costs.total,
      broccoli_acres: baseline.params.broccoli_acres,
      pasture_acres: baseline.params.pasture_acres,
      milking_cows: baseline.params.milking_cows,
      weather_exposure: baseline.results.base.weather_exposure_pct,
    });
  }

  for (const s of scenarios) {
    if (!selected.has(s.id)) continue;
    items.push({
      name: s.name,
      bear: s.results.bear.profit,
      base: s.results.base.profit,
      bull: s.results.bull.profit,
      revenue: s.results.base.revenue.total,
      costs: s.results.base.costs.total,
      broccoli_acres: s.overrides.broccoli_acres ?? baseline?.params.broccoli_acres,
      pasture_acres: s.overrides.pasture_acres ?? baseline?.params.pasture_acres,
      milking_cows: s.overrides.milking_cows ?? baseline?.params.milking_cows,
      weather_exposure: s.results.base.weather_exposure_pct,
    });
  }

  const bestBase = items.length > 0 ? items.reduce((a, b) => (a.base > b.base ? a : b)) : null;
  const highestRisk = items.length > 0 ? items.reduce((a, b) => (a.base - a.bear > b.base - b.bear ? a : b)) : null;
  const mostStable = items.length > 0 ? items.reduce((a, b) => (a.bull - a.bear < b.bull - b.bear ? a : b)) : null;

  return (
    <div className="p-8 max-w-7xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Compare Scenarios</h2>

      {scenarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
          No saved scenarios yet. Create some in the Scenario Builder first.
        </div>
      ) : (
        <>
          {/* Scenario picker */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">
              Select Scenarios to Compare (max 4)
            </h3>
            <div className="flex flex-wrap gap-2">
              {scenarios.map((s) => (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                    selected.has(s.id)
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {items.length > 1 && (
            <>
              {/* Profit Comparison Chart */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                  Profit Comparison (Bear / Base / Bull)
                </h3>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={items}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
                    <Legend />
                    <Bar dataKey="bear" name="Bear" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="base" name="Base" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="bull" name="Bull" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 mb-6 overflow-x-auto">
                <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
                  Detailed Comparison
                </h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 pr-4 text-slate-500 font-medium">Metric</th>
                      {items.map((item) => (
                        <th key={item.name} className="text-right py-2 px-3 text-slate-700 font-semibold">
                          {item.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {([
                      ["Base Profit", "base"],
                      ["Bull Profit", "bull"],
                      ["Bear Profit", "bear"],
                      ["Revenue", "revenue"],
                      ["Costs", "costs"],
                      ["Broccoli Acres", "broccoli_acres"],
                      ["Pasture Acres", "pasture_acres"],
                      ["Milking Cows", "milking_cows"],
                      ["Weather Exposure", "weather_exposure"],
                    ] as [string, keyof CompareItem][]).map(([label, key]) => (
                      <tr key={key}>
                        <td className="py-2 pr-4 text-slate-500">{label}</td>
                        {items.map((item) => {
                          const val = item[key];
                          const display =
                            key === "weather_exposure"
                              ? `${(val as number).toFixed(1)}%`
                              : key === "broccoli_acres" || key === "pasture_acres"
                                ? `${val} ac`
                                : key === "milking_cows"
                                  ? String(val)
                                  : formatCurrencyFull(val as number);
                          return (
                            <td key={item.name} className="text-right py-2 px-3 font-medium text-slate-700">
                              {display}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {bestBase && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-600 uppercase">Highest Base Profit</p>
                    <p className="text-lg font-bold text-emerald-800 mt-1">{bestBase.name}</p>
                    <p className="text-sm text-emerald-600">{formatCurrencyFull(bestBase.base)}</p>
                  </div>
                )}
                {highestRisk && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-amber-600 uppercase">Highest Risk</p>
                    <p className="text-lg font-bold text-amber-800 mt-1">{highestRisk.name}</p>
                    <p className="text-sm text-amber-600">
                      Bear drop: {formatCurrencyFull(highestRisk.base - highestRisk.bear)}
                    </p>
                  </div>
                )}
                {mostStable && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-blue-600 uppercase">Most Stable</p>
                    <p className="text-lg font-bold text-blue-800 mt-1">{mostStable.name}</p>
                    <p className="text-sm text-blue-600">
                      Spread: {formatCurrencyFull(mostStable.bull - mostStable.bear)}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {items.length <= 1 && selected.size === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
              Select at least one scenario above to compare against the baseline.
            </div>
          )}
        </>
      )}
    </div>
  );
}
