import type Decimal from "decimal.js";

import { useHints } from "~/lib/client-hints/client-hints.js";
import { formatCurrency } from "~/lib/ui/currency.format.js";

export interface CurrencyProps {
  value: string | number | Decimal;
}

export function Currency({ value }: CurrencyProps) {
  const { locale } = useHints();
  return (
    <span className="text-sm text-green-500 tabular-nums slashed-zero">
      {formatCurrency(value, locale)}
    </span>
  );
}
