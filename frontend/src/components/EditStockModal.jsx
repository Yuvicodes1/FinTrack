import { useState } from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Props:
 *  stock      — the stock object being edited { symbol, quantity, buyPrice, isCustom, estSellPrice }
 *  onClose    — called when modal is dismissed
 *  onSave     — called with { quantity, buyPrice, estSellPrice } when user saves
 */
const EditStockModal = ({ stock, onClose, onSave }) => {
  const [quantity, setQuantity] = useState(String(stock.quantity));
  const [buyPrice, setBuyPrice] = useState(String(stock.buyPrice));
  const [estSellPrice, setEstSellPrice] = useState(
    String(stock.estSellPrice || "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (!buyPrice || Number(buyPrice) <= 0) {
      setError("Please enter a valid buy price.");
      return;
    }
    if (stock.isCustom && (!estSellPrice || Number(estSellPrice) <= 0)) {
      setError("Please enter a valid estimated sell price.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await onSave({
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        estSellPrice: stock.isCustom ? Number(estSellPrice) : undefined,
      });
      onClose();
    } catch (err) {
      console.error("Edit save error:", err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="relative w-[90%] max-w-md
        bg-white dark:bg-darkCard
        rounded-2xl shadow-2xl p-8"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4
          text-gray-400 hover:text-gray-600
          dark:hover:text-gray-200 transition"
          aria-label="Close"
        >
          <FaTimes size={20} />
        </button>

        <h2 className="text-xl font-bold mb-1">Edit {stock.symbol}</h2>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
          Update your position details below.
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Quantity */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Quantity
          </label>
          <input
            type="number"
            min="0"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full p-3 rounded-lg border
            bg-white dark:bg-darkBg
            border-gray-300 dark:border-darkBorder
            focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent"
          />
        </div>

        {/* Buy Price */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
            Buy Price (₹)
          </label>
          <input
            type="number"
            min="0"
            value={buyPrice}
            onChange={(e) => setBuyPrice(e.target.value)}
            className="w-full p-3 rounded-lg border
            bg-white dark:bg-darkBg
            border-gray-300 dark:border-darkBorder
            focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent"
          />
        </div>

        {/* Est. Sell Price — only for custom assets */}
        {stock.isCustom && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-600 dark:text-gray-400">
              Estimated Sell Price (₹)
            </label>
            <input
              type="number"
              min="0"
              value={estSellPrice}
              onChange={(e) => setEstSellPrice(e.target.value)}
              className="w-full p-3 rounded-lg border
              bg-white dark:bg-darkBg
              border-gray-300 dark:border-darkBorder
              focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-lg border
            border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkBg
            transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:scale-105 transition
            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditStockModal;