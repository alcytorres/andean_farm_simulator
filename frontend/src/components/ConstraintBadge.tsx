interface ConstraintBadgeProps {
  label: string;
  value: string;
  ok: boolean;
  warning?: string;
}

export default function ConstraintBadge({ label, value, ok, warning }: ConstraintBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
        ok
          ? "bg-emerald-50 text-emerald-700"
          : "bg-red-50 text-red-700"
      }`}
    >
      <span>{ok ? "✓" : "⚠"}</span>
      <span className="font-medium">{label}:</span>
      <span>{value}</span>
      {!ok && warning && (
        <span className="text-xs ml-1">— {warning}</span>
      )}
    </div>
  );
}
