interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: "green" | "red" | "neutral";
}

const colorMap = {
  green: "text-emerald-600",
  red: "text-red-500",
  neutral: "text-slate-800",
};

export default function StatCard({ label, value, sub, color = "neutral" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${colorMap[color]}`}>{value}</p>
      {sub && <p className="text-sm text-slate-400 mt-1">{sub}</p>}
    </div>
  );
}
