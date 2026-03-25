export function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString()}`;
}

export function formatPct(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatDelta(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${formatCurrency(value)}`;
}
