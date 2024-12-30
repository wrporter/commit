export interface CurrencyProps {
  value: number;
}

export function Currency({ value }: CurrencyProps) {
  return (
    <span className="text-sm text-green-500 tabular-nums slashed-zero">
      ${value.toFixed(2)}
    </span>
  );
}
