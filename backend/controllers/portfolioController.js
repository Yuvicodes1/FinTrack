const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const { getCurrentStockPrice } = require("../services/stockService");
const { getConversionRate } = require("../services/currencyService");

// ===============================
// Create portfolio (if not exists)
// ===============================
exports.createPortfolio = async (req, res) => {
  try {
    const { firebaseUID } = req.body;
    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: user._id, stocks: [] });
    }
    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Create Portfolio Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Add stock
// Converts buyPrice from user's display currency → USD before storing
// ===============================
exports.addStock = async (req, res) => {
  try {
    const { firebaseUID, symbol, quantity, buyPrice, estSellPrice, isCustom } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    let buyPriceUsd = buyPrice;

    if (!isCustom) {
      // ── Convert user-entered price back to USD for storage ──────────────
      const userCurrency = user.preferredCurrency || "INR";
      const conversionRate = await getConversionRate(userCurrency);
      buyPriceUsd = parseFloat((buyPrice / conversionRate).toFixed(6));
    }

    portfolio.stocks.push({
      symbol,
      quantity,
      buyPrice: buyPriceUsd,        // always stored in USD for live stocks
      estSellPrice: isCustom ? estSellPrice : null,
      isCustom: isCustom || false,
    });

    await portfolio.save();
    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Add Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Get portfolio
// Returns all values in USD — frontend handles display conversion
// ===============================
exports.getPortfolio = async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    let portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) {
      portfolio = await Portfolio.create({ user: user._id, stocks: [] });
    }

    let totalInvestedUsd = 0;
    let totalCurrentValueUsd = 0;
    const enrichedStocks = [];

    for (const stock of portfolio.stocks) {

      // ── Custom assets: stored in user's own currency, return as-is ───────
      if (stock.isCustom) {
        const investedAmount = parseFloat((stock.quantity * stock.buyPrice).toFixed(2));
        const currentValue = parseFloat(
          (stock.quantity * (stock.estSellPrice || stock.buyPrice)).toFixed(2)
        );
        const profitLoss = parseFloat((currentValue - investedAmount).toFixed(2));

        enrichedStocks.push({
          stockId: stock._id,
          symbol: stock.symbol,
          quantity: stock.quantity,
          buyPrice: stock.buyPrice,
          currentPrice: stock.estSellPrice || stock.buyPrice,
          investedAmount,
          currentValue,
          profitLoss,
          isCustom: true,
          estSellPrice: stock.estSellPrice || null,
        });

        // Custom assets are not included in USD totals since they're user-currency
        continue;
      }

      // ── Live stock: buyPrice and currentPrice are both in USD ─────────────
      let currentPriceUsd = 0;
      try {
        currentPriceUsd = await getCurrentStockPrice(stock.symbol);
      } catch (err) {
        console.log("Live price fetch failed:", stock.symbol);
        currentPriceUsd = stock.buyPrice; // fallback to buy price
      }

      const investedAmountUsd = parseFloat((stock.quantity * stock.buyPrice).toFixed(2));
      const currentValueUsd = parseFloat((stock.quantity * currentPriceUsd).toFixed(2));
      const profitLossUsd = parseFloat((currentValueUsd - investedAmountUsd).toFixed(2));

      totalInvestedUsd += investedAmountUsd;
      totalCurrentValueUsd += currentValueUsd;

      enrichedStocks.push({
        stockId: stock._id,
        symbol: stock.symbol,
        quantity: stock.quantity,
        buyPrice: stock.buyPrice,         // USD
        currentPrice: currentPriceUsd,    // USD
        investedAmount: investedAmountUsd,
        currentValue: currentValueUsd,
        profitLoss: profitLossUsd,
        isCustom: false,
        estSellPrice: null,
      });
    }

    // Return USD values + the user's preferred currency so frontend knows what to convert to
    res.status(200).json({
      stocks: enrichedStocks,
      summary: {
        totalInvested: parseFloat(totalInvestedUsd.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValueUsd.toFixed(2)),
        totalProfitLoss: parseFloat((totalCurrentValueUsd - totalInvestedUsd).toFixed(2)),
      },
      baseCurrency: "USD",
      preferredCurrency: user.preferredCurrency || "INR",
    });

  } catch (error) {
    console.error("Get Portfolio Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Update stock — lookup by stockId (_id) not symbol
// ===============================
exports.updateStock = async (req, res) => {
  try {
    const { firebaseUID, stockId, quantity, buyPrice, estSellPrice } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    // Find by _id — safe even if same symbol appears twice
    const stock = portfolio.stocks.id(stockId);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    if (quantity !== undefined) stock.quantity = quantity;

    if (buyPrice !== undefined) {
      if (!stock.isCustom) {
        const userCurrency = user.preferredCurrency || "INR";
        const conversionRate = await getConversionRate(userCurrency);
        stock.buyPrice = parseFloat((buyPrice / conversionRate).toFixed(6));
      } else {
        stock.buyPrice = buyPrice;
      }
    }

    if (estSellPrice !== undefined) stock.estSellPrice = estSellPrice;

    await portfolio.save();
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Remove stock — lookup by stockId (_id) not symbol
// ===============================
exports.removeStock = async (req, res) => {
  try {
    const { firebaseUID, stockId } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio) return res.status(404).json({ message: "Portfolio not found" });

    portfolio.stocks = portfolio.stocks.filter(
      (s) => s._id.toString() !== stockId
    );
    await portfolio.save();
    res.status(200).json({ message: "Stock removed successfully" });
  } catch (error) {
    console.error("Remove Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};