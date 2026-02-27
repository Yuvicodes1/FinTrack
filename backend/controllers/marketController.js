const axios = require("axios");
const asyncHandler = require("../middleware/asyncHandler");
const { getFromCache, setCache, TTL } = require("../utils/cache");
const { getAllRates } = require("../services/currencyService");

const API_KEY = process.env.FINNHUB_API_KEY;


// ======================================================
// 🔎 SEARCH STOCK (Finnhub)
// ======================================================
exports.searchStock = asyncHandler(async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    const error = new Error("Symbol is required");
    error.statusCode = 400;
    throw error;
  }

  const response = await axios.get("https://finnhub.io/api/v1/search", {
    params: { q: symbol, token: API_KEY },
  });

  res.status(200).json({
    success: true,
    data: response.data.result,
  });
});


// ======================================================
// 📈 GET HISTORICAL DATA (Yahoo Finance)
// ======================================================
exports.getHistoricalData = asyncHandler(async (req, res) => {
  const { symbol, range } = req.query;

  if (!symbol) {
    const error = new Error("Symbol is required");
    error.statusCode = 400;
    throw error;
  }

  let yahooRange = "1mo";
  if (range === "6M") yahooRange = "6mo";
  if (range === "1Y") yahooRange = "1y";

  const cacheKey = `history_${symbol}_${yahooRange}`;

  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log("Yahoo history cache hit:", symbol);
    return res.status(200).json({ success: true, data: cached });
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${yahooRange}&interval=1d`;
  const response = await axios.get(url);

  if (!response.data.chart || !response.data.chart.result) {
    return res.status(200).json({ success: true, data: [] });
  }

  const result = response.data.chart.result[0];
  const timestamps = result.timestamp;
  const closes = result.indicators.quote[0].close;

  const formattedData = timestamps.map((time, index) => ({
    date: new Date(time * 1000).toISOString().split("T")[0],
    close: closes[index],
  }));

  setCache(cacheKey, formattedData, TTL.HISTORY);

  res.status(200).json({ success: true, data: formattedData });
});


// ======================================================
// 📊 GET TOP STOCKS — cached as a single batch
// ======================================================
exports.getTopStocks = asyncHandler(async (req, res) => {
  const CACHE_KEY = "top_stocks_batch";

  // ── Return cached batch if still fresh ──────────────────────────────────
  const cached = getFromCache(CACHE_KEY);
  if (cached) {
    console.log("Top stocks cache hit");
    return res.status(200).json({ success: true, data: cached });
  }

  const symbols = [
    // ── Mega-cap Tech ──────────────────────────────────────────────────────
    "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
    "NVDA", "META", "NFLX", "AMD", "INTC",
    "ORCL", "IBM", "ADBE", "CRM", "PYPL",
    "QCOM", "AVGO", "ASML", "TXN", "MU",

    // ── Consumer & Retail ──────────────────────────────────────────────────
    "WMT", "COST", "TGT", "HD", "LOW",
    "MCD", "SBUX", "YUM", "CMG", "NKE",
    "LULU", "BURL", "ROST", "TJX",

    // ── Social & Internet ──────────────────────────────────────────────────
    "SNAP", "PINS", "RDDT", "LYFT", "UBER",
    "DASH", "ABNB", "BKNG", "EXPE",

    // ── Streaming & Entertainment ──────────────────────────────────────────
    "DIS", "PARA", "WBD", "SPOT", "RBLX",
    "EA", "TTWO", "ATVI",

    // ── Fintech & Payments ─────────────────────────────────────────────────
    "V", "MA", "AXP", "GS", "JPM",
    "BAC", "WFC", "MS", "C", "SQ",
    "COIN", "HOOD",

    // ── Cloud & SaaS ───────────────────────────────────────────────────────
    "SNOW", "PLTR", "ZS", "NET", "DDOG",
    "CRWD", "PANW", "OKTA", "MDB", "ZM",
    "TEAM", "SHOP", "HCP",

    // ── Healthcare & Pharma ────────────────────────────────────────────────
    "JNJ", "PFE", "MRK", "ABBV", "LLY",
    "BMY", "AMGN", "GILD", "BIIB", "REGN",
    "MDT", "ABT", "TMO",

    // ── Energy ────────────────────────────────────────────────────────────
    "XOM", "CVX", "COP", "SLB", "EOG",
    "OXY", "PSX", "VLO",

    // ── Consumer Staples & Food ────────────────────────────────────────────
    "KO", "PEP", "PG", "CL", "KHC",
    "GIS", "K", "HSY", "MDLZ",

    // ── Industrials & Aerospace ────────────────────────────────────────────
    "BA", "CAT", "GE", "HON", "LMT",
    "RTX", "NOC", "DE", "MMM",

    // ── Semiconductors ────────────────────────────────────────────────────
    "TSM", "AMAT", "LRCX", "KLAC", "MRVL",
    "SWKS", "MPWR", "ON",

    // ── Telecom ────────────────────────────────────────────────────────────
    "T", "VZ", "TMUS",

    // ── Autos & EV ─────────────────────────────────────────────────────────
    "F", "GM", "RIVN", "LCID", "NIO",

    // ── Real Estate & Infrastructure ───────────────────────────────────────
    "AMT", "PLD", "EQIX", "CCI",

    // ── ETFs (tracked like stocks) ─────────────────────────────────────────
    "SPY", "QQQ", "IWM", "DIA", "GLD",
  ];

  // ── Batch requests to avoid Finnhub rate limits (30 req/s free tier) ─────
  const BATCH_SIZE = 25;
  const BATCH_DELAY_MS = 1200; // 1.2s between batches stays well under limit

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  let results = [];
  for (let i = 0; i < symbols.length; i += BATCH_SIZE) {
    const batch = symbols.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((symbol) =>
        axios
          .get("https://finnhub.io/api/v1/quote", {
            params: { symbol, token: API_KEY },
          })
          .then((response) => {
            // Skip symbols with no data (price = 0 means Finnhub doesn't carry it)
            if (!response.data.c) return null;
            return {
              symbol,
              currentPrice: response.data.c,
              change: response.data.d,
              percentChange: response.data.dp,
              open: response.data.o,
              high: response.data.h,
              low: response.data.l,
              prevClose: response.data.pc,
            };
          })
          .catch(() => null)
      )
    );
    results = results.concat(batchResults.filter(Boolean));
    if (i + BATCH_SIZE < symbols.length) await sleep(BATCH_DELAY_MS);
  }

  // ── Cache the full batch result ──────────────────────────────────────────
  setCache(CACHE_KEY, results, TTL.TOP_STOCKS);
  console.log(`Top stocks fetched and cached: ${results.length}/${symbols.length} symbols`);

  res.status(200).json({ success: true, data: results });
});


// ======================================================
// 💱 GET EXCHANGE RATES (for frontend conversion)
// ======================================================
exports.getRates = asyncHandler(async (req, res) => {
  const rates = await getAllRates();
  res.status(200).json({ success: true, rates });
});