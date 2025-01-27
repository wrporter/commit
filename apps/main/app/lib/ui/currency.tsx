import Decimal from "decimal.js";
import { tv } from "tailwind-variants";

import { useHints } from "~/lib/client-hints/client-hints.js";
import { formatCurrency } from "~/lib/ui/currency.format.js";

const variants = tv({
  base: "text-sm tabular-nums slashed-zero",
  variants: {
    positive: {
      true: "text-green-600",
    },
  },
});

export interface CurrencyProps {
  value: string | number | Decimal;
}

export function Currency({ value }: CurrencyProps) {
  const { locale } = useHints();
  const decimal = new Decimal(value);

  return (
    <span className={variants({ positive: decimal.greaterThan(0) })}>
      {decimal.isZero() ? "-" : formatCurrency(value, locale)}
    </span>
  );
}
