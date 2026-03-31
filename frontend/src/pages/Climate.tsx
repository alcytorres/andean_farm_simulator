import { useEffect, useState } from "react";
import { api } from "../services/api";
import ParamInput from "../components/ParamInput";

export default function RiskCases() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const [bullHail, setBullHail] = useState(1);
  const [bullFrost, setBullFrost] = useState(3);
  const [bullPrice, setBullPrice] = useState(10);
  const [bearHail, setBearHail] = useState(5);
  const [bearFrost, setBearFrost] = useState(10);
  const [bearPrice, setBearPrice] = useState(-10);

  useEffect(() => {
    api.getBaseline().then((b) => {
      setBullHail(b.params.bull_hailstorms);
      setBullFrost(b.params.bull_frost_events);
      setBullPrice(b.params.bull_price_modifier);
      setBearHail(b.params.bear_hailstorms);
      setBearFrost(b.params.bear_frost_events);
      setBearPrice(b.params.bear_price_modifier);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveMsg("");
    await api.updateBaseline({
      bull_hailstorms: bullHail,
      bull_frost_events: bullFrost,
      bull_price_modifier: bullPrice,
      bear_hailstorms: bearHail,
      bear_frost_events: bearFrost,
      bear_price_modifier: bearPrice,
    });
    setSaving(false);
    setSaveMsg("Saved");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  if (loading) return <div className="p-8 text-slate-400">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Risk Cases</h2>
      <p className="text-sm text-slate-500 mb-6">
        Define the weather and price assumptions for bull and bear projections.
        These apply globally across all scenario comparisons.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Bull */}
          <div>
            <h3 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Bull Case
            </h3>
            <p className="text-xs text-slate-400 mb-3">Good year — favorable weather and prices</p>
            <ParamInput label="Hailstorms/yr" value={bullHail} onChange={setBullHail} step={0.5} min={0} />
            <ParamInput label="Frost events/yr" value={bullFrost} onChange={setBullFrost} step={1} min={0} />
            <ParamInput label="Price modifier" value={bullPrice} onChange={setBullPrice} suffix="%" step={5} />
            <p className="text-xs text-slate-400 mt-3">
              Price modifier shifts milk and broccoli $/unit by this percentage.
            </p>
          </div>

          {/* Bear */}
          <div>
            <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-1">
              Bear Case
            </h3>
            <p className="text-xs text-slate-400 mb-3">Bad year — severe weather and lower prices</p>
            <ParamInput label="Hailstorms/yr" value={bearHail} onChange={setBearHail} step={0.5} min={0} />
            <ParamInput label="Frost events/yr" value={bearFrost} onChange={setBearFrost} step={1} min={0} />
            <ParamInput label="Price modifier" value={bearPrice} onChange={setBearPrice} suffix="%" step={5} />
            <p className="text-xs text-slate-400 mt-3">
              More hail and frost events reduce net broccoli tons harvested.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 text-white text-sm font-medium px-6 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saveMsg && <span className="text-sm text-emerald-600">{saveMsg}</span>}
        </div>
      </div>

      <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-semibold text-slate-600 mb-1">How bull / bear cases work</p>
        <p>
          Each scenario you create always shows three projections using the same inputs.
          The <span className="text-blue-600 font-medium">bull</span> case swaps in the hailstorms and frost counts above and applies the positive price modifier to milk and broccoli revenue.
          The <span className="text-red-500 font-medium">bear</span> case does the same with the adverse values.
          The <span className="text-emerald-600 font-medium">base</span> case uses the weather inputs you entered directly in the Scenario Builder — no override.
        </p>
      </div>
    </div>
  );
}
