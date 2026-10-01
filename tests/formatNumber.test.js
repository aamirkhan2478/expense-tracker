import { describe, it, expect } from "vitest";
import { formatNumber } from "@/utils/formatNumber";
import { formatMoney } from "@/hooks/useSettings";

const usd = { currency: "$", currencyCode: "USD" };
const pkr = { currency: "Rs", currencyCode: "PKR" };

describe("formatNumber", () => {
  it("keeps values below 10,000 as grouped numbers", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(500)).toBe("500");
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(9999)).toBe("9,999");
    expect(formatNumber(1234.5)).toBe("1,234.5");
  });

  it("formats thousands with up to 3 significant digits", () => {
    expect(formatNumber(10000)).toBe("10K");
    expect(formatNumber(12000)).toBe("12K");
    expect(formatNumber(10500)).toBe("10.5K");
    expect(formatNumber(11250)).toBe("11.3K");
    expect(formatNumber(15000)).toBe("15K");
    expect(formatNumber(15500)).toBe("15.5K");
    expect(formatNumber(99999)).toBe("100K");
    expect(formatNumber(100000)).toBe("100K");
    expect(formatNumber(125000)).toBe("125K");
  });

  it("formats millions, billions and trillions", () => {
    expect(formatNumber(999999)).toBe("1M");
    expect(formatNumber(1000000)).toBe("1M");
    expect(formatNumber(1250000)).toBe("1.25M");
    expect(formatNumber(1500000)).toBe("1.5M");
    expect(formatNumber(10000000)).toBe("10M");
    expect(formatNumber(1000000000)).toBe("1B");
    expect(formatNumber(1500000000)).toBe("1.5B");
    expect(formatNumber(1000000000000)).toBe("1T");
    expect(formatNumber(2500000000000)).toBe("2.5T");
  });

  it("promotes the tier when rounding reaches 1000", () => {
    expect(formatNumber(999400)).toBe("999K");
    expect(formatNumber(999999)).toBe("1M");
    expect(formatNumber(999999999)).toBe("1B");
    expect(formatNumber(999999999999)).toBe("1T");
  });

  it("handles negative numbers", () => {
    expect(formatNumber(-500)).toBe("-500");
    expect(formatNumber(-15500)).toBe("-15.5K");
    expect(formatNumber(-1500000)).toBe("-1.5M");
  });

  it("handles decimal numbers", () => {
    expect(formatNumber(10.5)).toBe("10.5");
    expect(formatNumber(0.25)).toBe("0.25");
    expect(formatNumber(15500.75)).toBe("15.5K");
  });

  it("falls back to 0 for invalid input", () => {
    expect(formatNumber(null)).toBe("0");
    expect(formatNumber(undefined)).toBe("0");
    expect(formatNumber(NaN)).toBe("0");
    expect(formatNumber(Infinity)).toBe("0");
    expect(formatNumber(-Infinity)).toBe("0");
    expect(formatNumber("")).toBe("0");
    expect(formatNumber("abc")).toBe("0");
    expect(formatNumber()).toBe("0");
    expect(formatNumber({})).toBe("0");
  });

  it("accepts numeric strings", () => {
    expect(formatNumber("15500")).toBe("15.5K");
    expect(formatNumber(" 1000 ")).toBe("1,000");
  });

  it("supports a custom locale and threshold", () => {
    expect(formatNumber(15500, { locale: "de-DE" })).toBe("15,5K");
    expect(formatNumber(1500, { threshold: 1000 })).toBe("1.5K");
  });
});

describe("formatMoney", () => {
  it("keeps the currency prefix and groups small amounts", () => {
    expect(formatMoney(1250.5, usd)).toBe("$1,250.5");
    expect(formatMoney(9999, pkr)).toBe("Rs9,999");
    expect(formatMoney(0, usd)).toBe("$0");
  });

  it("compacts large amounts", () => {
    expect(formatMoney(15500, usd)).toBe("$15.5K");
    expect(formatMoney(999999, usd)).toBe("$1M");
    expect(formatMoney(1250000, usd)).toBe("$1.25M");
    expect(formatMoney(1500000000, pkr)).toBe("Rs1.5B");
    expect(formatMoney(-15500, usd)).toBe("$-15.5K");
  });

  it("falls back to a zero amount for invalid input", () => {
    expect(formatMoney(null, usd)).toBe("$0");
    expect(formatMoney(undefined, usd)).toBe("$0");
    expect(formatMoney("", usd)).toBe("$0");
    expect(formatMoney(NaN, usd)).toBe("$0");
    expect(formatMoney("abc", usd)).toBe("$0");
  });

  it("defaults to $ when settings are missing", () => {
    expect(formatMoney(15500)).toBe("$15.5K");
    expect(formatMoney(null)).toBe("$0");
  });
});