const axios = require("axios");

// ── In-memory cache for exchange rate ────────────────────────────────────────
let cachedRate = null;
let cacheTimestamp = null;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in ms

/**
 * Returns the current USD → INR exchange rate.
 * Fetches fresh from ExchangeRate-API if cache is stale or empty.
 * Falls back to a safe hardcoded rate if the fetch fails.
 */
exports.getUsdToInrRate = async () => {
  const now = Date.now();

  // ── Return cached rate if still fresh ────────────────────────────────────
  if (cachedRate && cacheTimestamp && now - cacheTimestamp < CACHE_TTL) {
    console.log("Currency cache hit. Rate:", cachedRate);
    return cachedRate;
  }

  try {
    console.log("Fetching fresh USD/INR exchange rate...");
    const response = await axios.get(
      "https://api.exchangerate-api.com/v4/latest/USD",
      { timeout: 5000 }
    );

    const rate = response.data?.rates?.INR;

    if (!rate || isNaN(rate)) {
      throw new Error("Invalid rate in response");
    }

    // ── Update cache ──────────────────────────────────────────────────────
    cachedRate = rate;
    cacheTimestamp = now;

    console.log("Fresh USD/INR rate fetched:", rate);
    return rate;

  } catch (error) {
    console.error("Exchange rate fetch failed:", error.message);

    // ── Fallback: use stale cache if available, else hardcoded safe value ──
    if (cachedRate) {
      console.warn("Using stale cached rate:", cachedRate);
      return cachedRate;
    }

    const FALLBACK_RATE = 84;
    console.warn("Using hardcoded fallback rate:", FALLBACK_RATE);
    return FALLBACK_RATE;
  }
};