const TIERS = [
  { threshold: 1e12, suffix: "T" },
  { threshold: 1e9, suffix: "B" },
  { threshold: 1e6, suffix: "M" },
  { threshold: 1e3, suffix: "K" },
];

const COMPACT_THRESHOLD = 1e4;

const SIGNIFICANT_DIGITS = 3;

const toFiniteNumber = (value) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const roundToSignificantDigits = (value, digits = SIGNIFICANT_DIGITS) =>
  Number(value.toPrecision(digits));

export function formatNumber(value, options = {}) {
  const {
    locale = "en-US",
    maxFractionDigits = 3,
    threshold = COMPACT_THRESHOLD,
  } = options;

  const numeric = toFiniteNumber(value);
  if (numeric === null) return "0";

  const sign = numeric < 0 ? "-" : "";
  const absolute = Math.abs(numeric);

  if (absolute < threshold) {
    return (
      sign +
      absolute.toLocaleString(locale, {
        maximumFractionDigits: maxFractionDigits,
      })
    );
  }

  let tierIndex = TIERS.findIndex((tier) => absolute >= tier.threshold);
  if (tierIndex === -1) tierIndex = TIERS.length - 1;

  const scaled = absolute / TIERS[tierIndex].threshold;
  let rounded = roundToSignificantDigits(scaled);

  while (rounded >= 1000 && tierIndex > 0) {
    tierIndex -= 1;
    const promoted = absolute / TIERS[tierIndex].threshold;
    rounded = roundToSignificantDigits(promoted);
  }

  const formatted = rounded.toLocaleString(locale, {
    useGrouping: false,
    maximumFractionDigits: maxFractionDigits,
  });

  return `${sign}${formatted}${TIERS[tierIndex].suffix}`;
}

export default formatNumber;