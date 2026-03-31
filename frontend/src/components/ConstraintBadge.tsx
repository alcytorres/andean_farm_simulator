interface ConstraintBadgeProps {
  label: string;
  value: string;
  ok: boolean;
  warning?: string;
  tooltip?: string;
}

export default function ConstraintBadge({ label, value, ok, warning, tooltip }: ConstraintBadgeProps) {
  return (
    <div className="relative group">
      <div
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md ${
          ok
            ? "bg-emerald-50 text-emerald-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        <span>{ok ? "✓" : "⚠"}</span>
        <span className={`font-medium ${tooltip ? "underline decoration-dotted cursor-default" : ""}`}>{label}:</span>
        <span>{value}</span>
        {!ok && warning && (
          <span className="text-xs ml-1">— {warning}</span>
        )}
      </div>
      {tooltip && (
        <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 w-60 bg-slate-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg leading-relaxed">
          {tooltip}
          <div className="absolute top-full left-4 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
