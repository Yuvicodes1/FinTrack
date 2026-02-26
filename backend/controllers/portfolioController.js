const Portfolio = require("../models/Portfolio");
const User = require("../models/User");
const { getCurrentStockPrice } = require("../services/stockService");
const { getUsdToInrRate } = require("../services/currencyService");

// ===============================
// Create portfolio (if not exists)
// ===============================
exports.createPortfolio = async (req, res) => {
  try {
    const { firebaseUID } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let portfolio = await Portfolio.findOne({ user: user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({
        user: user._id,
        stocks: [],
      });
    }

    res.status(200).json(portfolio);
  } catch (error) {
    console.error("Create Portfolio Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Add stock
// ===============================
exports.addStock = async (req, res) => {
  try {
    const { firebaseUID, symbol, quantity, buyPrice, estSellPrice, isCustom } =
      req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio)
      return res.status(404).json({ message: "Portfolio not found" });

    portfolio.stocks.push({
      symbol,
      quantity,
      buyPrice,
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
// Get portfolio (with USD → INR conversion)
// ===============================
exports.getPortfolio = async (req, res) => {
  try {
    const { firebaseUID } = req.params;

    const user = await User.findOne({ firebaseUID });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let portfolio = await Portfolio.findOne({ user: user._id });

    if (!portfolio) {
      portfolio = await Portfolio.create({ user: user._id, stocks: [] });
    }

    // ── Fetch USD/INR rate once for this entire request ───────────────────
    const usdToInr = await getUsdToInrRate();

    let totalInvested = 0;
    let totalCurrentValue = 0;
    const enrichedStocks = [];

    for (const stock of portfolio.stocks) {
      let currentPriceUsd = 0;

      if (stock.isCustom) {
        // Custom assets are already stored in user's currency (INR)
        // so we skip conversion — store and display as-is
        const investedAmount = stock.quantity * stock.buyPrice;
        const currentValue =
          stock.quantity * (stock.estSellPrice || stock.buyPrice);
        const profitLoss = parseFloat(
          (currentValue - investedAmount).toFixed(2)
        );

        totalInvested += investedAmount;
        totalCurrentValue += currentValue;

        enrichedStocks.push({
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

        continue;
      }

      // ── Live stock: fetch USD price then convert to INR ─────────────────
      try {
        currentPriceUsd = await getCurrentStockPrice(stock.symbol);
      } catch (err) {
        console.log("Live price fetch failed:", stock.symbol);
        currentPriceUsd = stock.buyPrice / usdToInr; // reverse-estimate
      }

      const currentPriceInr = parseFloat(
        (currentPriceUsd * usdToInr).toFixed(2)
      );

      // buyPrice was entered by the user in INR already, so no conversion needed
      const investedAmount = parseFloat(
        (stock.quantity * stock.buyPrice).toFixed(2)
      );
      const currentValue = parseFloat(
        (stock.quantity * currentPriceInr).toFixed(2)
      );
      const profitLoss = parseFloat((currentValue - investedAmount).toFixed(2));

      totalInvested += investedAmount;
      totalCurrentValue += currentValue;

      enrichedStocks.push({
        symbol: stock.symbol,
        quantity: stock.quantity,
        buyPrice: stock.buyPrice,
        currentPrice: currentPriceInr,
        investedAmount,
        currentValue,
        profitLoss,
        isCustom: false,
        estSellPrice: null,
      });
    }

    const totalProfitLoss = parseFloat(
      (totalCurrentValue - totalInvested).toFixed(2)
    );

    res.status(200).json({
      stocks: enrichedStocks,
      summary: {
        totalInvested: parseFloat(totalInvested.toFixed(2)),
        totalCurrentValue: parseFloat(totalCurrentValue.toFixed(2)),
        totalProfitLoss,
      },
    });
  } catch (error) {
    console.error("Get Portfolio Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Update stock
// ===============================
exports.updateStock = async (req, res) => {
  try {
    const { firebaseUID, symbol, quantity, buyPrice, estSellPrice } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio)
      return res.status(404).json({ message: "Portfolio not found" });

    const stock = portfolio.stocks.find((s) => s.symbol === symbol);
    if (!stock) return res.status(404).json({ message: "Stock not found" });

    if (quantity !== undefined) stock.quantity = quantity;
    if (buyPrice !== undefined) stock.buyPrice = buyPrice;
    if (estSellPrice !== undefined) stock.estSellPrice = estSellPrice;

    await portfolio.save();
    res.status(200).json({ message: "Stock updated successfully" });
  } catch (error) {
    console.error("Update Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ===============================
// Remove stock
// ===============================
exports.removeStock = async (req, res) => {
  try {
    const { firebaseUID, symbol } = req.body;

    const user = await User.findOne({ firebaseUID });
    if (!user) return res.status(404).json({ message: "User not found" });

    const portfolio = await Portfolio.findOne({ user: user._id });
    if (!portfolio)
      return res.status(404).json({ message: "Portfolio not found" });

    portfolio.stocks = portfolio.stocks.filter(
      (stock) => stock.symbol !== symbol
    );

    await portfolio.save();
    res.status(200).json({ message: "Stock removed successfully" });
  } catch (error) {
    console.error("Remove Stock Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};