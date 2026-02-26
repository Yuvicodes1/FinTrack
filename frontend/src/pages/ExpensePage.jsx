import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { useAuth } from "../context/AuthContext";
import API from "../services/Api";
import ExpenseChart from "../components/dashboard/ExpenseChart";
import AddExpenseModal from "../components/AddExpenseModal";
import AIChat from "../components/AIChat";
import {
  FaPlus, FaRobot, FaWallet,
  FaChevronLeft, FaChevronRight,
  FaPencilAlt, FaTrash,
} from "react-icons/fa";

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️", "Transport": "🚗",
  "Entertainment": "🎬", "Shopping": "🛍️",
  "Utilities": "💡", "Travel": "✈️", "Other": "📌",
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatMonth = (monthStr) => {
  const [year, mon] = monthStr.split("-");
  return new Date(year, mon - 1).toLocaleDateString("en-IN", {
    month: "long", year: "numeric",
  });
};

const prevMonth = (monthStr) => {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 2);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

const nextMonth = (monthStr) => {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

export default function ExpensePage() {
  const { user, authLoading } = useAuth();

  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [showAI, setShowAI] = useState(false);

  const [salaryInput, setSalaryInput] = useState("");
  const [salaryEditing, setSalaryEditing] = useState(false);
  const [salaryLoading, setSalaryLoading] = useState(false);

  useEffect(() => {
    if (authLoading || !user) return;
    fetchExpenses();
  }, [user, authLoading, month]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/expenses/${user.uid}?month=${month}`);
      setData(res.data);
      setSalaryInput(res.data.summary.salary ?? "");
    } catch (err) {
      console.error("Fetch expenses error:", err);
      setError("Failed to load expenses.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSalary = async () => {
    if (!salaryInput || Number(salaryInput) <= 0) return;
    try {
      setSalaryLoading(true);
      await API.post("/expenses/salary", {
        firebaseUID: user.uid,
        amount: Number(salaryInput),
        month,
      });
      setSalaryEditing(false);
      fetchExpenses();
    } catch (err) {
      console.error("Salary save error:", err);
    } finally {
      setSalaryLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await API.delete(`/expenses/${expenseId}`);
      fetchExpenses();
    } catch (err) {
      console.error("Delete expense error:", err);
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout title="Expenses">
        <div className="text-center mt-20 text-lg">Loading expenses...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Expenses">
        <div className="text-center mt-20 text-red-500">{error}</div>
      </AppLayout>
    );
  }

  const { expenses, summary } = data;
  const savingsRate = summary.salary
    ? Math.round(((summary.salary - summary.totalSpent) / summary.salary) * 100)
    : null;

  return (
    <AppLayout title="Expenses">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* ── LEFT COLUMN ────────────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* Month Navigator */}
          <div className="flex items-center justify-between
            p-5 rounded-2xl
            bg-white dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder shadow-sm"
          >
            <button
              onClick={() => setMonth(prevMonth(month))}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkBg transition"
            >
              <FaChevronLeft className="text-lightMuted dark:text-gray-400" />
            </button>

            <div className="text-center">
              <h2 className="text-lg font-bold text-lightText dark:text-darkText">
                {formatMonth(month)}
              </h2>
              {month === getCurrentMonth() && (
                <span className="text-xs text-lightAccent dark:text-darkAccent font-medium">
                  Current Month
                </span>
              )}
            </div>

            <button
              onClick={() => setMonth(nextMonth(month))}
              disabled={month >= getCurrentMonth()}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkBg
              transition disabled:opacity-30"
            >
              <FaChevronRight className="text-lightMuted dark:text-gray-400" />
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

            {/* Salary */}
            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard
              border border-gray-200 dark:border-darkBorder shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Monthly Salary</p>
              {salaryEditing ? (
                <div className="flex gap-2 items-center mt-2">
                  <input
                    type="number"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    placeholder="Amount"
                    className="flex-1 px-2 py-1 rounded border text-sm
                    bg-white dark:bg-darkBg
                    border-gray-300 dark:border-darkBorder
                    text-lightText dark:text-darkText
                    focus:outline-none focus:ring-1 focus:ring-lightAccent"
                  />
                  <button
                    onClick={handleSaveSalary}
                    disabled={salaryLoading}
                    className="px-2 py-1 rounded bg-lightAccent dark:bg-darkAccent
                    text-white dark:text-black text-xs font-medium disabled:opacity-50"
                  >
                    {salaryLoading ? "..." : "Set"}
                  </button>
                </div>
              ) : (
                <div
                  className="flex items-baseline gap-2 cursor-pointer group"
                  onClick={() => setSalaryEditing(true)}
                >
                  <p className="text-xl font-bold text-lightText dark:text-darkText">
                    {summary.salary ? `₹${summary.salary.toLocaleString("en-IN")}` : "—"}
                  </p>
                  <FaPencilAlt
                    size={10}
                    className="text-gray-400 group-hover:text-lightAccent
                    dark:group-hover:text-darkAccent transition"
                  />
                </div>
              )}
            </div>

            {/* Total Spent */}
            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard
              border border-gray-200 dark:border-darkBorder shadow-sm">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Spent</p>
              <p className="text-xl font-bold text-red-500">
                ₹{summary.totalSpent.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Remaining / Savings Rate */}
            <div className="p-5 rounded-2xl bg-white dark:bg-darkCard
              border border-gray-200 dark:border-darkBorder shadow-sm
              col-span-2 md:col-span-1">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                {summary.salary ? "Remaining" : "Set salary to see remaining"}
              </p>
              <p className={`text-xl font-bold ${
                summary.remaining >= 0 ? "text-green-500" : "text-red-500"
              }`}>
                {summary.remaining !== null
                  ? `₹${summary.remaining.toLocaleString("en-IN")}`
                  : "—"
                }
              </p>
              {savingsRate !== null && (
                <p className="text-xs text-gray-400 mt-1">
                  {savingsRate >= 0 ? `${savingsRate}% saved` : "Over budget"}
                </p>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="p-6 rounded-2xl bg-white dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder shadow-sm">
            <h3 className="text-base font-semibold mb-4 text-lightText dark:text-darkText">
              Spending Breakdown
            </h3>
            <ExpenseChart categoryTotals={summary.categoryTotals} />
          </div>

          {/* Expense List */}
          <div className="rounded-2xl bg-white dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder shadow-sm overflow-hidden">

            <div className="flex items-center justify-between px-6 py-4
              border-b border-gray-200 dark:border-darkBorder">
              <h3 className="font-semibold text-lightText dark:text-darkText">
                Transactions ({expenses.length})
              </h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                bg-lightAccent dark:bg-darkAccent
                text-white dark:text-black text-sm font-medium
                hover:scale-105 transition"
              >
                <FaPlus size={12} />
                Add
              </button>
            </div>

            {expenses.length === 0 ? (
              <div className="text-center py-12 text-gray-400 dark:text-gray-500 text-sm">
                No expenses yet for {formatMonth(month)}.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-darkBorder">
                {expenses.map((exp) => (
                  <div key={exp._id}
                    className="flex items-center justify-between px-6 py-4
                    hover:bg-gray-50 dark:hover:bg-darkBg transition"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{CATEGORY_ICONS[exp.category]}</span>
                      <div>
                        <p className="font-medium text-sm text-lightText dark:text-darkText">
                          {exp.category}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(exp.date).toLocaleDateString("en-IN")}
                          {exp.note && ` · ${exp.note}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-red-500">
                        −₹{exp.amount.toLocaleString("en-IN")}
                      </span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditExpense(exp)}
                          className="text-blue-400 hover:text-blue-600 transition text-sm"
                        >
                          <FaPencilAlt size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(exp._id)}
                          className="text-red-400 hover:text-red-600 transition text-sm"
                        >
                          <FaTrash size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN — AI Chat ──────────────────────────────────────── */}
        <div className="lg:w-96 flex flex-col">

          {/* Toggle button on mobile */}
          <button
            onClick={() => setShowAI(!showAI)}
            className="lg:hidden mb-4 flex items-center justify-center gap-2
            px-5 py-3 rounded-xl
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black font-medium
            hover:scale-105 transition"
          >
            <FaRobot size={16} />
            {showAI ? "Hide AI Assistant" : "Ask AI Assistant"}
          </button>

          <div className={`${showAI ? "flex" : "hidden"} lg:flex flex-col`}
            style={{ height: "calc(100vh - 12rem)" }}
          >
            <AIChat month={month} onClose={() => setShowAI(false)} />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddExpenseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchExpenses}
        />
      )}
      {editExpense && (
        <AddExpenseModal
          editExpense={editExpense}
          onClose={() => setEditExpense(null)}
          onSuccess={fetchExpenses}
        />
      )}
    </AppLayout>
  );
}