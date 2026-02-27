const cacheStore = {};

const DEFAULT_TTL = 60 * 1000;       // 60 seconds  — individual stock prices
const TOP_STOCKS_TTL = 15 * 60 * 1000; // 15 minutes  — full batch of 140 symbols

/**
 * Retrieve a value from cache. Returns null if missing or expired.
 */
exports.getFromCache = (key) => {
  const cached = cacheStore[key];
  if (!cached) return null;

  const isExpired = Date.now() - cached.timestamp > cached.ttl;
  if (isExpired) {
    delete cacheStore[key];
    return null;
  }

  return cached.value;
};

/**
 * Store a value in cache.
 * @param {string} key
 * @param {*} value
 * @param {number} ttl  - Time to live in ms. Defaults to 60 seconds.
 */
exports.setCache = (key, value, ttl = DEFAULT_TTL) => {
  cacheStore[key] = {
    value,
    timestamp: Date.now(),
    ttl,
  };
};

// Export TTL constants so controllers can reference them by name
exports.TTL = {
  DEFAULT: DEFAULT_TTL,
  TOP_STOCKS: TOP_STOCKS_TTL,
  HISTORY: 15 * 60 * 1000, // 15 minutes — historical chart data
};