import Decimal from "decimal.js";

const currencyFormat: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "USD",
};

const currencyFormatterCache = new Map<string, Intl.NumberFormat>();

export function formatCurrency(
  amount: number | string | Decimal,
  locale: string
): string {
  const value = new Decimal(amount);
  const formatter = getCurrencyFormatter(locale);
  return formatter.format(value.toNumber());
}

export function getCurrencyFormatter(locale: string): Intl.NumberFormat {
  if (currencyFormatterCache.has(locale)) {
    return currencyFormatterCache.get(locale) as Intl.NumberFormat;
  }
  const formatter = new Intl.NumberFormat(locale, currencyFormat);
  currencyFormatterCache.set(locale, formatter);
  return formatter;
}
