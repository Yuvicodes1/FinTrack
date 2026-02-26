import { useState } from "react";
import { auth } from "../firebase";
import API from "../services/Api";
import { useCurrency } from "../context/CurrencyContext";

const AddInvestmentModal = ({ onClose, onSuccess }) => {
  const [symbol, setSymbol] = useState("");
  const [quantity, setQuantity] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [estSellPrice, setEstSellPrice] = useState("");

  const { currencyMeta } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // ─── Basic validation ─────────────────────────────────────────────────
    if (!symbol.trim()) {
      setError("Please enter a symbol or asset name.");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Please enter a valid quantity.");
      return;
    }
    if (!buyPrice || Number(buyPrice) <= 0) {
      setError("Please enter a valid buy price.");
      return;
    }
    if (isCustom && (!estSellPrice || Number(estSellPrice) <= 0)) {
      setError("Please enter an estimated sell price for custom assets.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to add investments.");
        return;
      }

      await API.post("/portfolio/add-stock", {
        firebaseUID: user.uid,
        symbol: symbol.trim().toUpperCase(),
        quantity: Number(quantity),
        buyPrice: Number(buyPrice),
        estSellPrice: isCustom ? Number(estSellPrice) : null,
        isCustom,
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Add investment error:", err);
      setError("Failed to add investment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-darkCard p-6 rounded-xl w-96 shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Add Investment</h2>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <input
          type="text"
          placeholder={isCustom ? "Asset Name" : "Stock Symbol (e.g. AAPL)"}
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="w-full mb-3 p-2 border rounded
          bg-white dark:bg-darkBg
          border-gray-300 dark:border-darkBorder"
        />

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          min="0"
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full mb-3 p-2 border rounded
          bg-white dark:bg-darkBg
          border-gray-300 dark:border-darkBorder"
        />

        <input
          type="number"
          placeholder={`Buy Price (${currencyMeta.symbol})`}
          value={buyPrice}
          min="0"
          onChange={(e) => setBuyPrice(e.target.value)}
          className="w-full mb-3 p-2 border rounded
          bg-white dark:bg-darkBg
          border-gray-300 dark:border-darkBorder"
        />

        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="isCustom"
            checked={isCustom}
            onChange={() => setIsCustom(!isCustom)}
          />
          <label htmlFor="isCustom" className="text-sm cursor-pointer">
            Custom Asset (manual price)
          </label>
        </div>

        {isCustom && (
          <input
            type="number"
            placeholder={`Estimated Sell Price (${currencyMeta.symbol})`}
            value={estSellPrice}
            min="0"
            onChange={(e) => setEstSellPrice(e.target.value)}
            className="w-full mb-3 p-2 border rounded
            bg-white dark:bg-darkBg
            border-gray-300 dark:border-darkBorder"
          />
        )}

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded border
            hover:bg-gray-100 dark:hover:bg-darkBg transition
            disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 rounded
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:scale-105 transition
            disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddInvestmentModal;