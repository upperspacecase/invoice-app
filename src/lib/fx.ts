import type { CurrencyCode } from "./types";

export type FxSnapshot = {
  base: CurrencyCode;
  rates: Record<CurrencyCode, number>;
  fetchedAt: number;
};

const FALLBACK: FxSnapshot = {
  base: "USD",
  rates: {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    AUD: 1.51,
    CAD: 1.37,
    JPY: 152,
  },
  fetchedAt: 0,
};

let cache: FxSnapshot | null = null;
let inflight: Promise<FxSnapshot> | null = null;

const TTL = 24 * 60 * 60 * 1000;

const SUPPORTED: CurrencyCode[] = [
  "USD",
  "EUR",
  "GBP",
  "AUD",
  "CAD",
  "JPY",
];

async function fetchRates(): Promise<FxSnapshot> {
  const url = "https://api.exchangerate.host/latest?base=USD";
  try {
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`fx fetch failed: ${res.status}`);
    const json = (await res.json()) as {
      base?: string;
      rates?: Record<string, number>;
    };
    if (!json.rates) throw new Error("fx payload missing rates");
    const rates = SUPPORTED.reduce((acc, code) => {
      const v = json.rates?.[code];
      acc[code] =
        typeof v === "number" && Number.isFinite(v)
          ? v
          : FALLBACK.rates[code];
      return acc;
    }, {} as Record<CurrencyCode, number>);
    return { base: "USD", rates, fetchedAt: Date.now() };
  } catch {
    return { ...FALLBACK, fetchedAt: Date.now() };
  }
}

export async function getRates(): Promise<FxSnapshot> {
  if (cache && Date.now() - cache.fetchedAt < TTL) return cache;
  if (inflight) return inflight;
  inflight = fetchRates().then((snap) => {
    cache = snap;
    inflight = null;
    return snap;
  });
  return inflight;
}

export async function convert(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode
): Promise<number> {
  if (from === to) return amount;
  const { rates } = await getRates();
  const inUsd = amount / rates[from];
  return inUsd * rates[to];
}

export async function convertSync(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  snap: FxSnapshot
): Promise<number> {
  if (from === to) return amount;
  const inUsd = amount / snap.rates[from];
  return inUsd * snap.rates[to];
}
