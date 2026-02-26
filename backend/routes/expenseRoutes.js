const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  setSalary,
  aiChat,
  getCategories,
} = require("../controllers/expenseController");

// All expense routes are protected
router.use(verifyToken);

router.get("/categories", getCategories);
router.get("/:firebaseUID", getExpenses);
router.post("/", addExpense);
router.put("/:expenseId", updateExpense);
router.delete("/:expenseId", deleteExpense);
router.post("/salary", setSalary);
router.post("/ai-chat", aiChat);

module.exports = router;