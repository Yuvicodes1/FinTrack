const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

const {
  createPortfolio,
  addStock,
  getPortfolio,
  updateStock,
  removeStock,
} = require("../controllers/portfolioController");

// ── Apply auth middleware to every portfolio route ───────────────────────────
router.use(verifyToken);

// Create portfolio (if not exists)
router.post("/", createPortfolio);

// Add stock
router.post("/add-stock", addStock);

// Get portfolio by firebaseUID
router.get("/:firebaseUID", getPortfolio);

// Update stock
router.put("/update-stock", updateStock);

// Remove stock
router.delete("/remove-stock", removeStock);

module.exports = router; 