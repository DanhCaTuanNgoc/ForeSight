/**
 * Sanitizes and cleans raw DreamDEX question strings into trader-friendly, professional format.
 * E.g. "Pricefeed test: will ETH/USDC's price be at or above 2505.80 at unix time 1789133520?"
 * becomes: "Will ETH/USDC settle at or above $2,505.80 at expiry?"
 */
export function sanitizeMarketQuestion(
  rawQuestion?: string,
  underlyingAsset?: string,
  strikePrice?: number
): string {
  const asset = underlyingAsset || "Asset";

  if (!rawQuestion || typeof rawQuestion !== "string") {
    return strikePrice && strikePrice > 0
      ? `Will ${asset} settle at or above $${strikePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} at expiry?`
      : `Will ${asset} settle at or above opening price at expiry?`;
  }

  let clean = rawQuestion.trim();

  // 1. Remove testnet / pricefeed prefix noise
  clean = clean.replace(/^(pricefeed\s*test|pricefeed|testnet|test|mock)\s*:\s*/i, "");

  // 2. Remove "at unix time <timestamp>" or replace with "at expiry"
  clean = clean.replace(/at\s+unix\s+time\s+\d+\??/i, "at expiry?");
  clean = clean.replace(/at\s+unix\s+time\b/i, "at expiry");

  // 3. Format raw numbers into currency if missing $
  // e.g. "at or above 2505.80" -> "at or above $2,505.80"
  clean = clean.replace(/(at or above|above|below|reach)\s+(\d+(?:\.\d+)?)/i, (match, prefix, numStr) => {
    const val = Number(numStr);
    if (!isNaN(val) && val > 0) {
      const formatted = val >= 1000
        ? `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `$${val}`;
      return `${prefix} ${formatted}`;
    }
    return match;
  });

  // 4. Polish grammar and phrasing
  clean = clean.replace(/^will\s+([A-Z0-9\/-]+)'s\s+price\s+be\s+/i, "Will $1 settle ");
  clean = clean.replace(/^will\s+([A-Z0-9\/-]+)\s+be\s+at\s+or\s+above/i, "Will $1 settle at or above");

  // 5. Clean whitespace & ensure proper capitalization and question mark
  clean = clean.replace(/\s+/g, " ").trim();
  if (clean.length > 0) {
    clean = clean.charAt(0).toUpperCase() + clean.slice(1);
  }
  if (!clean.endsWith("?")) {
    clean += "?";
  }

  return clean;
}
