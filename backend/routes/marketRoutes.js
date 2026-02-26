const express = require("express");
const router = express.Router();
const {
  searchStock,
  getHistoricalData,
  getTopStocks,
  getRates,
} = require("../controllers/marketController");

router.get("/search", searchStock);
router.get("/history", getHistoricalData);
router.get("/top", getTopStocks);
router.get("/rates", getRates);   // live USD→INR/EUR rates for frontend

module.exports = router;