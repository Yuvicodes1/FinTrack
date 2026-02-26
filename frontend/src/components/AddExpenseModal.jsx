import { useState } from "react";
import { FaTimes } from "react-icons/fa";
import API from "../services/Api";

const CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Travel",
  "Other",
];

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  "Transport": "🚗",
  "Entertainment": "🎬",
  "Shopping": "🛍️",
  "Utilities": "💡",
  "Travel": "✈️",
  "Other": "📌",
};

const AddExpenseModal = ({ onClose, onSuccess, editExpense = null }) => {
  const [amount, setAmount] = useState(editExpense?.amount ?? "");
  const [category, setCategory] = useState(editExpense?.category ?? "Food & Dining");
  const [note, setNote] = useState(editExpense?.note ?? "");
  const [date, setDate] = useState(
    editExpense?.date
      ? new Date(editExpense.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!editExpense;

  const handleSubmit = async () => {
    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (isEdit) {
        await API.put(`/expenses/${editExpense._id}`, {
          amount: Number(amount),
          category,
          note,
          date,
        });
      } else {
        const user = (await import("../firebase")).auth.currentUser;
        await API.post("/expenses", {
          firebaseUID: user.uid,
          amount: Number(amount),
          category,
          note,
          date,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Expense save error:", err);
      setError("Failed to save expense. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = `w-full p-3 rounded-lg border
    bg-white dark:bg-darkBg
    text-lightText dark:text-darkText
    border-gray-300 dark:border-darkBorder
    focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent
    transition`;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-[90%] max-w-md
        bg-white dark:bg-darkCard
        rounded-2xl shadow-2xl p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600
          dark:hover:text-gray-200 transition"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1 text-lightText dark:text-darkText">
          {isEdit ? "Edit Expense" : "Add Expense"}
        </h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
          {isEdit ? "Update your expense details." : "Track a new expense."}
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Amount */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Amount (₹)
          </label>
          <input
            type="number"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={inputClasses}
          />
        </div>

        {/* Category */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-gray-600 dark:text-gray-400">
            Category
          </label>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs
                  transition
                  ${category === cat
                    ? "border-lightAccent dark:border-darkAccent bg-lightAccent/10 dark:bg-darkAccent/10 text-lightAccent dark:text-darkAccent font-semibold"
                    : "border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkBg"
                  }`}
              >
                <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
                <span className="text-center leading-tight">{cat.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={inputClasses}
          />
        </div>

        {/* Note */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Note (optional)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Lunch with team"
            maxLength={200}
            className={inputClasses}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkBg transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-lg
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:scale-105 transition
            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Expense"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddExpenseModal;