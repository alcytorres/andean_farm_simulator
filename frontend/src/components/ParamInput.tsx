interface ParamInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  step?: number;
  min?: number;
  max?: number;
  prefix?: string;
  suffix?: string;
}

export default function ParamInput({
  label,
  value,
  onChange,
  step = 1,
  min,
  max,
  prefix,
  suffix,
}: ParamInputProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <label className="text-sm text-slate-600 pr-3 shrink-0">{label}</label>
      <div className="flex items-center gap-1">
        {prefix && <span className="text-sm text-slate-400">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={min}
          max={max}
          className="w-24 text-right text-sm font-medium bg-slate-50 border border-slate-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}
