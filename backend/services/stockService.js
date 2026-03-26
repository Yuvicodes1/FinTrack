const axios = require("axios");
const { getFromCache, setCache } = require("../utils/cache");

// ==============================
// Function to get current stock price
// ==============================
exports.getCurrentStockPrice = async (symbol) => {
  const API_KEY = process.env.FINNHUB_API_KEY;
  try {
    const cachedPrice = getFromCache(symbol);
    if (cachedPrice) {
      console.log("Cache hit for:", symbol);
      return cachedPrice;
    }

    console.log("Fetching from Finnhub:", symbol);

    const response = await axios.get("https://finnhub.io/api/v1/quote", {
      params: { symbol, token: API_KEY },
      timeout: 5000,
    });

    const price = response.data.c;

    if (!price || isNaN(price)) {
      console.log("Invalid price response:", response.data);
      return 0;
    }

    setCache(symbol, price);
    return price;

  } catch (error) {
    console.error("Finnhub API error:", error.message);
    return 0;
  }
};

// ==============================
// Function to get historical stock data
// ==============================
exports.getStockHistory = async (symbol) => {
  const API_KEY = process.env.FINNHUB_API_KEY;
  try {
    const now = Math.floor(Date.now() / 1000);
    const oneMonthAgo = now - 60 * 60 * 24 * 30;

    const response = await axios.get("https://finnhub.io/api/v1/stock/candle", {
      params: {
        symbol,
        resolution: "D",
        from: oneMonthAgo,
        to: now,
        token: API_KEY,
      },
      timeout: 5000,
    });

    if (response.data.s !== "ok") {
      console.log("No historical data found.");
      return [];
    }

    return response.data.t.map((timestamp, index) => ({
      date: new Date(timestamp * 1000),
      price: response.data.c[index],
    }));

  } catch (error) {
    console.error("History API error:", error.message);
    return [];
  }
};