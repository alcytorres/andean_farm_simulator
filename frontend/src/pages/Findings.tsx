const scenarios = [
  { name: "Current (baseline)", base: 94891, bull: 173606, bear: 25043, vs: 0 },
  { name: "More Broccoli +15ac", base: 117551, bull: 206735, bear: 39083, vs: 22661 },
  { name: "More Broccoli +25ac", base: 119162, bull: 213135, bear: 37136, vs: 24272 },
  { name: "Max Broccoli", base: 88036, bull: 191903, bear: 181, vs: -6854 },
  { name: "More Dairy +15ac", base: 99223, bull: 171849, bear: 33617, vs: 4332 },
  { name: "More Dairy +25ac", base: 104361, bull: 173292, bear: 41218, vs: 9470 },
  { name: "Max Dairy", base: 106277, bull: 161935, bear: 52713, vs: 11386 },
  { name: "Balanced Shift", base: 109998, bull: 195692, bear: 34403, vs: 15107 },
];

const fmt = (n: number) =>
  n < 0
    ? `-$${Math.abs(n).toLocaleString()}`
    : `$${n.toLocaleString()}`;

const fmtSign = (n: number) =>
  n > 0 ? `+$${n.toLocaleString()}` : n === 0 ? "$0" : `-$${Math.abs(n).toLocaleString()}`;

export default function Findings() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Findings & Recommendation</h2>
        <p className="text-sm text-slate-500 mt-1">
          What is the ideal land allocation for maximizing profit at Hacienda Yerovi?
        </p>
      </div>

      {/* Summary Table */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Scenario Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            8 scenarios tested across base, bull (good weather + prices), and bear (bad weather + prices) cases
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-2.5">Scenario</th>
                <th className="px-4 py-2.5 text-right">Base Profit</th>
                <th className="px-4 py-2.5 text-right">Bull Profit</th>
                <th className="px-4 py-2.5 text-right">Bear Profit</th>
                <th className="px-4 py-2.5 text-right">vs Current</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s, i) => (
                <tr
                  key={s.name}
                  className={`border-t border-slate-100 ${
                    i === 1 ? "bg-emerald-50" : ""
                  }`}
                >
                  <td className="px-4 py-2.5 font-medium text-slate-700">
                    {s.name}
                    {i === 1 && (
                      <span className="ml-2 text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-full uppercase font-bold">
                        Recommended
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">{fmt(s.base)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">{fmt(s.bull)}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700">{fmt(s.bear)}</td>
                  <td
                    className={`px-4 py-2.5 text-right font-mono font-semibold ${
                      s.vs > 0
                        ? "text-emerald-600"
                        : s.vs < 0
                        ? "text-red-500"
                        : "text-slate-400"
                    }`}
                  >
                    {fmtSign(s.vs)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-5 py-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Three Key Findings
        </h3>

        <div className="space-y-4">
          <div className="flex gap-3">
            <span className="text-lg font-bold text-emerald-600 shrink-0 w-6">1</span>
            <div>
              <p className="font-semibold text-slate-700">
                The current setup is the worst-performing option.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Every scenario except Max Broccoli beats it on base profit. Seven of eight
                alternatives produce more profit under normal conditions. The farm is leaving
                money on the table.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg font-bold text-emerald-600 shrink-0 w-6">2</span>
            <div>
              <p className="font-semibold text-slate-700">
                Going all-in on either side is a bad idea.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                Max Broccoli has a strong bull case but nearly wipes out profit in a bad weather
                year — just $181. Max Dairy has the best downside protection ($53K bear) but the
                lowest upside of any scenario. The extremes lose on one end or the other.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <span className="text-lg font-bold text-emerald-600 shrink-0 w-6">3</span>
            <div>
              <p className="font-semibold text-slate-700">
                The sweet spot is a moderate shift toward broccoli.
              </p>
              <p className="text-sm text-slate-500 mt-1">
                "More Broccoli +15ac" gives the best risk-adjusted return: +$23K base profit,
                bear case improves from $25K to $39K, bull case improves from $173K to $207K,
                and you keep all 130 cows at a stocking rate of 3.78/ha (still under the 4.0 limit).
                It's strong across the board with no glaring weakness.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-5 py-5 space-y-3">
        <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wide">
          Recommendation
        </h3>
        <p className="text-slate-700 leading-relaxed">
          <strong>Shift 15 acres from pasture to broccoli</strong> (85/87 split). Keep all 130 cows.
          This adds ~$23,000/year in base profit, improves the worst-case scenario by $14,000, and
          requires no herd reduction — just planting more broccoli on land that was pasture. In a
          good year (bull case), profit jumps to $207K. Unlike "More Broccoli +25ac" (which edges
          it out by $1,600), this option doesn't require cutting 10 cows from the herd.
        </p>
        <p className="text-sm text-slate-600 leading-relaxed">
          <strong>If the family is more risk-averse</strong> and worried about hailstorms getting
          worse, "More Dairy +25ac" is the defensive play. It has the second-best bear case ($41K)
          and still adds $9,500 to base profit. Its yellow bar in the comparison chart is noticeably
          taller than the broccoli scenarios, meaning the floor in a bad year is higher.
        </p>
      </div>

      {/* Model Limitations */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 px-5 py-5 space-y-3">
        <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
          Model Limitations
        </h3>
        <ul className="space-y-2 text-sm text-slate-500">
          <li className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span><strong className="text-slate-600">Static model</strong> — calculates one year at a time; doesn't account for transition costs of shifting land use.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span><strong className="text-slate-600">Linear scaling</strong> — assumes yield per hectare stays constant regardless of acreage; real yields may vary at scale.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span><strong className="text-slate-600">Uniform weather impact</strong> — applies crop loss evenly; real hailstorms may hit some fields and miss others.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span><strong className="text-slate-600">Fixed labor</strong> — doesn't model whether 20 workers can handle expanded broccoli acreage.</span>
          </li>
          <li className="flex gap-2">
            <span className="text-slate-400 shrink-0">•</span>
            <span><strong className="text-slate-600">No capital costs</strong> — buying cows, fencing, or irrigation for expanded areas is not included.</span>
          </li>
        </ul>
        <p className="text-xs text-slate-400 pt-1">
          The value of this model is in the relative ranking of scenarios, not the absolute dollar amounts.
        </p>
      </div>
    </div>
  );
}
