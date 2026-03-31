import { useEffect, useState } from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { api } from "../services/api";
import { formatCurrencyFull, formatPct } from "../services/format";
import StatCard from "../components/StatCard";
import type { BaselineResponse } from "../types/farm";

const LAND_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#94a3b8", "#cbd5e1"];

export default function Dashboard() {
  const [data, setData] = useState<BaselineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBaseline().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;
  if (!data) return <div className="p-8 text-red-500">Failed to load baseline data.</div>;

  const { params, results } = data;
  const { base } = results;

  const landData = [
    { name: "Pasture", value: params.pasture_acres },
    { name: "Broccoli", value: params.broccoli_acres },
    { name: "Young Cattle", value: params.young_cattle_acres },
    { name: "Flowers", value: params.flower_acres },
    { name: "Fallow", value: params.fallow_acres },
    { name: "Non-productive", value: params.non_productive_acres },
  ].sort((a, b) => b.value - a.value);

  const revenueData = [
    { name: "Milk", value: base.revenue.milk },
    { name: "Broccoli", value: base.revenue.broccoli },
    { name: "Flowers", value: base.revenue.flowers },
  ];

  const costData = [
    { name: "Labor", value: base.costs.labor },
    { name: "Feed", value: base.costs.feed },
    { name: "Crop Inputs", value: base.costs.crop_inputs },
    { name: "Vet", value: base.costs.vet },
    { name: "Fuel", value: base.costs.fuel_transport },
    { name: "Other", value: base.costs.other },
  ];

  const caseComparison = [
    { name: "Bear", profit: results.bear.profit, revenue: results.bear.revenue.total },
    { name: "Base", profit: results.base.profit, revenue: results.base.revenue.total },
    { name: "Bull", profit: results.bull.profit, revenue: results.bull.revenue.total },
  ];

  return (
    <div className="p-8 max-w-7xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Farm Dashboard</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Annual Revenue"
          value={formatCurrencyFull(base.revenue.total)}
          sub="base case"
          color="neutral"
        />
        <StatCard
          label="Annual Costs"
          value={formatCurrencyFull(base.costs.total)}
          color="red"
        />
        <StatCard
          label="Annual Profit"
          value={formatCurrencyFull(base.profit)}
          sub={`Bull: ${formatCurrencyFull(results.bull.profit)} · Bear: ${formatCurrencyFull(results.bear.profit)}`}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Land Allocation Donut */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Land Allocation ({params.total_acres} acres)
          </h3>
          <div className="flex items-center gap-4">
            <div className="shrink-0" style={{ width: 180, height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={landData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={82}
                    dataKey="value"
                    label={false}
                    labelLine={false}
                  >
                    {landData.map((_, i) => (
                      <Cell key={i} fill={LAND_COLORS[i % LAND_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: number, name: string) => [`${val} acres`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-1.5">
              {landData.map((item, i) => {
                const pct = ((item.value / params.total_acres) * 100).toFixed(1);
                return (
                  <div key={item.name} className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: LAND_COLORS[i % LAND_COLORS.length] }}
                    />
                    <span className="text-sm text-slate-600 flex-1">{item.name}</span>
                    <span className="text-sm font-semibold text-slate-700">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Revenue Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" width={70} />
              <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
              <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Cost Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={costData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
              <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Base/Bull/Bear Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Base / Bull / Bear Profit
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={caseComparison}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(val: number) => formatCurrencyFull(val)} />
              <Legend />
              <Bar dataKey="profit" name="Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
          Key Metrics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Milking cows</span>
            <p className="font-semibold text-slate-700">{params.milking_cows}</p>
          </div>
          <div>
            <span className="text-slate-400">Young cattle</span>
            <p className="font-semibold text-slate-700">{params.young_cattle}</p>
          </div>
          <div>
            <span className="text-slate-400">Milk/cow/day</span>
            <p className="font-semibold text-slate-700">{params.milk_per_cow_per_day} L</p>
          </div>
          <div>
            <span className="text-slate-400">Broccoli cycles/yr</span>
            <p className="font-semibold text-slate-700">{params.broccoli_cycles_per_year}</p>
          </div>
          <div>
            <span className="text-slate-400">Hailstorms/yr</span>
            <p className="font-semibold text-slate-700">{params.hailstorms_per_year}</p>
          </div>
          <div>
            <span className="text-slate-400">Frost events/yr</span>
            <p className="font-semibold text-slate-700">{params.frost_events_per_year}</p>
          </div>
          <div>
            <span className="text-slate-400">Stocking rate</span>
            <p className="font-semibold text-slate-700">{base.constraints.stocking_rate}/ha</p>
          </div>
          <div>
            <span className="text-slate-400">Weather exposure</span>
            <p className="font-semibold text-slate-700">{formatPct(base.weather_exposure_pct)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
