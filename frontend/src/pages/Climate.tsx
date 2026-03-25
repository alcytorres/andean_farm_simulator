import { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { api } from "../services/api";
import type { ClimateData, BaselineResponse } from "../types/farm";
import ParamInput from "../components/ParamInput";

export default function Climate() {
  const [climate, setClimate] = useState<ClimateData | null>(null);
  const [baseline, setBaseline] = useState<BaselineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [bullHail, setBullHail] = useState(1);
  const [bullFrost, setBullFrost] = useState(3);
  const [bullPrice, setBullPrice] = useState(10);
  const [bearHail, setBearHail] = useState(5);
  const [bearFrost, setBearFrost] = useState(10);
  const [bearPrice, setBearPrice] = useState(-10);

  useEffect(() => {
    Promise.all([api.getClimate(), api.getBaseline()]).then(([c, b]) => {
      setClimate(c);
      setBaseline(b);
      setBullHail(b.params.bull_hailstorms);
      setBullFrost(b.params.bull_frost_events);
      setBullPrice(b.params.bull_price_modifier);
      setBearHail(b.params.bear_hailstorms);
      setBearFrost(b.params.bear_frost_events);
      setBearPrice(b.params.bear_price_modifier);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveCases = async () => {
    setSaving(true);
    await api.updateBaseline({
      bull_hailstorms: bullHail,
      bull_frost_events: bullFrost,
      bull_price_modifier: bullPrice,
      bear_hailstorms: bearHail,
      bear_frost_events: bearFrost,
      bear_price_modifier: bearPrice,
    });
    setSaving(false);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading climate data...</div>;

  return (
    <div className="p-8 max-w-7xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Climate Data</h2>
      {baseline && (
        <p className="text-sm text-slate-500 mb-6">
          {climate?.location.name} · {climate?.location.elevation_m}m elevation
        </p>
      )}

      <div className="grid grid-cols-1 gap-6">
        {/* Frost Events */}
        {climate && climate.frost_events_by_year.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Frost Events Per Year (days below 0°C)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={climate.frost_events_by_year}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  name="Frost Events"
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-slate-400 mt-2">
              Source: Open-Meteo historical archive · Coordinates: {climate.location.latitude}, {climate.location.longitude}
            </p>
          </div>
        )}

        {/* Temperature */}
        {climate && climate.temperature_by_month.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Monthly Temperature Range (°C)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={climate.temperature_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip formatter={(val: number) => `${val}°C`} />
                <Area
                  type="monotone"
                  dataKey="avg_max"
                  stroke="#ef4444"
                  fill="#fecaca"
                  name="Avg Max"
                />
                <Area
                  type="monotone"
                  dataKey="avg_min"
                  stroke="#3b82f6"
                  fill="#bfdbfe"
                  name="Avg Min"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Precipitation */}
        {climate && climate.precipitation_by_month.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
              Monthly Precipitation (avg mm)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={climate.precipitation_by_month}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val: number) => `${val} mm`} />
                <Bar dataKey="avg_mm" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Precipitation" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* No data fallback */}
        {(!climate || climate.frost_events_by_year.length === 0) && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-400">
            Unable to load climate data from Open-Meteo. The weather API may be temporarily unavailable.
          </div>
        )}

        {/* Bull/Bear Case Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-4">
            Case Assumptions
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            These settings define the bull and bear weather/price assumptions used across all scenario comparisons.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-blue-600 mb-2">Bull Case (Good Year)</h4>
              <ParamInput label="Hailstorms/yr" value={bullHail} onChange={setBullHail} step={0.5} min={0} />
              <ParamInput label="Frost events/yr" value={bullFrost} onChange={setBullFrost} step={1} min={0} />
              <ParamInput label="Price modifier" value={bullPrice} onChange={setBullPrice} suffix="%" step={5} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-red-600 mb-2">Bear Case (Bad Year)</h4>
              <ParamInput label="Hailstorms/yr" value={bearHail} onChange={setBearHail} step={0.5} min={0} />
              <ParamInput label="Frost events/yr" value={bearFrost} onChange={setBearFrost} step={1} min={0} />
              <ParamInput label="Price modifier" value={bearPrice} onChange={setBearPrice} suffix="%" step={5} />
            </div>
          </div>
          <button
            onClick={handleSaveCases}
            disabled={saving}
            className="mt-4 bg-emerald-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Case Assumptions"}
          </button>
        </div>
      </div>
    </div>
  );
}
