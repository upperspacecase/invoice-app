import type { CurrencyCode } from "./types";

export type CurrencyMeta = {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
};

export const CURRENCIES: CurrencyMeta[] = [
  { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0 },
];

export function currencyMeta(code: CurrencyCode): CurrencyMeta {
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0];
}

export function symbolFor(code: CurrencyCode): string {
  return currencyMeta(code).symbol;
}

export function formatMoney(
  amount: number,
  code: CurrencyCode,
  opts: { withCode?: boolean; minDecimals?: number } = {}
): string {
  const meta = currencyMeta(code);
  const min = opts.minDecimals ?? 0;
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: Math.min(min, meta.decimals),
    maximumFractionDigits: meta.decimals,
  });
  return opts.withCode
    ? `${meta.symbol}${formatted} ${code}`
    : `${meta.symbol}${formatted}`;
}

export function isCurrencyCode(v: unknown): v is CurrencyCode {
  return (
    typeof v === "string" &&
    CURRENCIES.some((c) => c.code === v)
  );
}
