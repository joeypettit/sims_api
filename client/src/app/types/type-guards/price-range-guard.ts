import type { PriceRange } from "../price-range";

export function isPriceRange(value: any): value is PriceRange {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.lowPriceInDollars === "number" &&
    typeof value.highPriceInDollars === "number"
  );
}
