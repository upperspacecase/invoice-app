import { describe, it, expect } from "vitest";
import { netPreview } from "./fee-preview";
import { clampFeeMinor, ANNUAL_FEE_CAP_MAJOR, PLATFORM_FEE_RATE } from "./platform-fee";

describe("netPreview (wizard net-after-fees math)", () => {
  it("£1,850 GBP → Stripe ~1.5%+20p, Nudge 1%, net = amount − both", () => {
    const p = netPreview(1850, "GBP");
    expect(p.stripe).toBeCloseTo(1850 * 0.015 + 0.2, 2); // 27.95
    expect(p.nudge).toBeCloseTo(18.5, 2);
    expect(p.net).toBeCloseTo(1850 - p.stripe - p.nudge, 2); // ~1803.55
    // sanity: net is below the headline amount, never above
    expect(p.net).toBeLessThan(1850);
  });

  it("uses the per-currency fixed fee (USD 30¢, JPY 0)", () => {
    expect(netPreview(1000, "USD").stripe).toBeCloseTo(1000 * 0.015 + 0.3, 2);
    expect(netPreview(1000, "JPY").stripe).toBeCloseTo(1000 * 0.015, 2);
  });

  it("zero / invalid amount → all zeros, never negative net", () => {
    expect(netPreview(0, "GBP")).toEqual({ amount: 0, stripe: 0, nudge: 0, net: 0 });
    expect(netPreview(-5, "GBP").net).toBe(0);
  });
});

describe("clampFeeMinor (1% clamped to the annual cap)", () => {
  it("returns the 1% when there's room", () => {
    // £500 invoice → 1% = £5 = 500p; plenty of cap room
    expect(clampFeeMinor(50000 * PLATFORM_FEE_RATE, 200000)).toBe(500);
  });

  it("clamps to the remaining cap room", () => {
    // only 150p of room left this year
    expect(clampFeeMinor(500, 150)).toBe(150);
  });

  it("never negative; zero room → zero fee", () => {
    expect(clampFeeMinor(500, 0)).toBe(0);
    expect(clampFeeMinor(500, -10)).toBe(0);
  });

  it("the GBP annual cap is £2,000", () => {
    // a year of 1% fees can't exceed £2,000 → 200000 pence
    const capMinorGBP = ANNUAL_FEE_CAP_MAJOR * 100;
    expect(capMinorGBP).toBe(200000);
    // an invoice whose 1% would exceed the remaining room is clamped to it
    expect(clampFeeMinor(300000, capMinorGBP)).toBe(200000);
  });
});
