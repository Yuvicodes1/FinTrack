const { Expense, Salary, CATEGORIES } = require("../models/Expense");
const User = require("../models/User");
const Anthropic = require("@anthropic-ai/sdk");

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });


// ── Helper: get MongoDB user from firebaseUID ─────────────────────────────────
const getUser = async (firebaseUID) => {
  const user = await User.findOne({ firebaseUID });
  if (!user) throw Object.assign(new Error("User not found"), { statusCode: 404 });
  return user;
};


// ── Helper: parse month string or default to current month ───────────────────
const parseMonth = (month) => {
  if (month) return month;
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};


// ==============================
// GET /expenses/:firebaseUID
// Query params: month (optional, "YYYY-MM")
// ==============================
exports.getExpenses = async (req, res) => {
  try {
    const { firebaseUID } = req.params;
    const { month } = req.query;
    const user = await getUser(firebaseUID);

    let query = { user: user._id };

    if (month) {
      const [year, mon] = month.split("-").map(Number);
      const start = new Date(year, mon - 1, 1);
      const end = new Date(year, mon, 1);
      query.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(query).sort({ date: -1 });

    // ── Category totals for pie chart ─────────────────────────────────────
    const categoryTotals = CATEGORIES.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {});

    expenses.forEach((e) => {
      categoryTotals[e.category] = parseFloat(
        ((categoryTotals[e.category] || 0) + e.amount).toFixed(2)
      );
    });

    const totalSpent = parseFloat(
      expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)
    );

    // ── Fetch salary for this month ───────────────────────────────────────
    const targetMonth = parseMonth(month);
    const salaryDoc = await Salary.findOne({ user: user._id, month: targetMonth });

    res.status(200).json({
      expenses,
      summary: {
        totalSpent,
        categoryTotals,
        month: targetMonth,
        salary: salaryDoc?.amount ?? null,
        remaining: salaryDoc ? parseFloat((salaryDoc.amount - totalSpent).toFixed(2)) : null,
      },
    });
  } catch (error) {
    console.error("Get Expenses Error:", error);
    res.status(error.statusCode || 500).json({ message: error.message || "Server error" });
  }
};


// ==============================
// POST /expenses
// ==============================
exports.addExpense = async (req, res) => {
  try {
    const { firebaseUID, amount, category, note, date } = req.body;

    if (!CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Invalid category. Must be one of: ${CATEGORIES.join(", ")}` });
    }

    const user = await getUser(firebaseUID);

    const expense = await Expense.create({
      user: user._id,
      amount,
      category,
      note: note || "",
      date: date ? new Date(date) : new Date(),
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Add Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// PUT /expenses/:expenseId
// ==============================
exports.updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const { amount, category, note, date } = req.body;

    const expense = await Expense.findByIdAndUpdate(
      expenseId,
      { amount, category, note, date: date ? new Date(date) : undefined },
      { new: true, runValidators: true }
    );

    if (!expense) return res.status(404).json({ message: "Expense not found" });

    res.status(200).json(expense);
  } catch (error) {
    console.error("Update Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// DELETE /expenses/:expenseId
// ==============================
exports.deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;
    const expense = await Expense.findByIdAndDelete(expenseId);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete Expense Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// POST /expenses/salary
// Set or update salary for a month
// ==============================
exports.setSalary = async (req, res) => {
  try {
    const { firebaseUID, amount, month } = req.body;
    const user = await getUser(firebaseUID);
    const targetMonth = parseMonth(month);

    const salary = await Salary.findOneAndUpdate(
      { user: user._id, month: targetMonth },
      { amount },
      { upsert: true, new: true }
    );

    res.status(200).json(salary);
  } catch (error) {
    console.error("Set Salary Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// ==============================
// POST /expenses/ai-chat
// Chat interface powered by Claude Haiku
// ==============================
exports.aiChat = async (req, res) => {
  try {
    const { firebaseUID, message, history, month } = req.body;
    const user = await getUser(firebaseUID);

    // ── Fetch current month expense data to give Claude context ───────────
    const targetMonth = parseMonth(month);
    const [year, mon] = targetMonth.split("-").map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1);

    const expenses = await Expense.find({
      user: user._id,
      date: { $gte: start, $lt: end },
    }).sort({ date: -1 });

    const salaryDoc = await Salary.findOne({ user: user._id, month: targetMonth });

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryTotals = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = parseFloat(
        ((categoryTotals[e.category] || 0) + e.amount).toFixed(2)
      );
    });

    // ── Build system prompt with full expense context ─────────────────────
    const systemPrompt = `You are a helpful personal finance assistant analyzing a user's expenses for ${targetMonth}.

Here is their financial data:
- Monthly Salary: ${salaryDoc ? `₹${salaryDoc.amount}` : "Not set"}
- Total Spent: ₹${totalSpent.toFixed(2)}
- Remaining: ${salaryDoc ? `₹${(salaryDoc.amount - totalSpent).toFixed(2)}` : "Unknown"}

Spending by category:
${Object.entries(categoryTotals).map(([cat, amt]) => `- ${cat}: ₹${amt}`).join("\n")}

Recent expenses (up to 20):
${expenses.slice(0, 20).map((e) =>
  `- ${new Date(e.date).toLocaleDateString("en-IN")}: ₹${e.amount} on ${e.category}${e.note ? ` (${e.note})` : ""}`
).join("\n")}

Be concise, friendly, and give specific actionable advice. Use ₹ for currency. If the user asks something unrelated to finance, gently redirect them.`;

    // ── Build conversation history for multi-turn chat ────────────────────
    const messages = [
      ...(history || []),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    res.status(200).json({
      reply: response.content[0].text,
      usage: response.usage,
    });

  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ message: "AI service error. Please try again." });
  }
};


// ==============================
// GET /expenses/categories
// ==============================
exports.getCategories = async (req, res) => {
  res.status(200).json({ categories: CATEGORIES });
};