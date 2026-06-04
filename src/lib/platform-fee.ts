// Nudge's whole price, in one place: 1% of an invoice, taken only when it
// actually gets paid, capped per business per calendar year. The cap is in the
// business's default currency. Validate these on real users before treating
// them as final.
export const PLATFORM_FEE_RATE = 0.01; // 1%
export const ANNUAL_FEE_CAP_MAJOR = 2000; // $2,000 / year, business currency
