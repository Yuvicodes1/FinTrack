import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import API from "../services/Api";
import AddInvestmentModal from "../components/AddInvestmentModal";
import EditStockModal from "../components/EditStockModal";
import AppLayout from "../components/layout/AppLayout";

const Portfolio = () => {
  const { user, authLoading } = useAuth();
  const { format, convert, currencyMeta, currencyLoading } = useCurrency();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }
    fetchPortfolio();
  }, [user, authLoading]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get(`/portfolio/${user.uid}`);
      setPortfolio(res.data);
    } catch (err) {
      console.error("Portfolio load error:", err);
      setError("Failed to load portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (symbol) => {
    try {
      await API.delete("/portfolio/remove-stock", {
        data: { firebaseUID: user.uid, symbol },
      });
      fetchPortfolio();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handleEditSave = async ({ quantity, buyPrice, estSellPrice }) => {
    await API.put("/portfolio/update-stock", {
      firebaseUID: user.uid,
      symbol: editingStock.symbol,
      quantity,
      buyPrice,       // backend will convert from display currency → USD
      estSellPrice,
    });
    fetchPortfolio();
  };

  if (authLoading || loading || currencyLoading) {
    return (
      <AppLayout title="Portfolio">
        <div className="text-center mt-20 text-lg">Loading portfolio...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Portfolio">
        <div className="text-center mt-20 text-red-500">{error}</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Portfolio">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Portfolio</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2.5 rounded-xl bg-lightAccent dark:bg-darkAccent
          text-white dark:text-black font-medium hover:scale-105 transition"
        >
          + Add Investment
        </button>
      </div>

      {portfolio?.stocks?.length === 0 && (
        <p className="text-gray-600 dark:text-gray-400">No investments yet.</p>
      )}

      {/* Stock Cards — all values converted from USD via format() */}
      <div className="grid md:grid-cols-2 gap-6">
        {portfolio?.stocks?.map((stock) => (
          <div
            key={stock.symbol}
            className="p-6 rounded-2xl bg-white dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder
            shadow-sm hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold mb-3 text-gray-800 dark:text-white">
              {stock.symbol}
            </h3>
            <div className="space-y-1 text-gray-700 dark:text-gray-300">
              <p>Quantity: {stock.quantity}</p>
              <div className="flex items-baseline gap-2">
                <p>Buy Price:</p>
                <span className="font-medium">
                  {stock.isCustom ? `${currencyMeta.symbol}${stock.buyPrice}` : format(stock.buyPrice)}
                </span>
                {!stock.isCustom && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (${stock.buyPrice.toFixed(2)} USD)
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <p>Current Price:</p>
                <span className="font-medium">
                  {stock.isCustom ? `${currencyMeta.symbol}${stock.currentPrice}` : format(stock.currentPrice)}
                </span>
                {!stock.isCustom && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    (${stock.currentPrice.toFixed(2)} USD)
                  </span>
                )}
              </div>
            </div>
            <p className="mt-4 font-semibold">
              P/L:{" "}
              <span className={stock.profitLoss >= 0 ? "text-green-500" : "text-red-500"}>
                {stock.isCustom ? `${currencyMeta.symbol}${stock.profitLoss}` : format(stock.profitLoss)}
              </span>
            </p>
            {stock.isCustom && (
              <p className="text-purple-400 text-sm mt-2">Custom Asset</p>
            )}
            <div className="flex gap-6 mt-5 text-sm font-medium">
              <button onClick={() => setEditingStock(stock)} className="text-blue-500 hover:underline">Edit</button>
              <button onClick={() => handleDelete(stock.symbol)} className="text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-12 p-8 rounded-2xl bg-white dark:bg-darkCard
        border border-gray-200 dark:border-darkBorder shadow-sm">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white">Portfolio Summary</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total Invested</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {format(portfolio?.summary?.totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Current Value</p>
            <p className="text-lg font-semibold text-gray-800 dark:text-white">
              {format(portfolio?.summary?.totalCurrentValue)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Total P/L</p>
            <p className={`text-lg font-semibold ${
              portfolio?.summary?.totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
            }`}>
              {format(portfolio?.summary?.totalProfitLoss)}
            </p>
          </div>
        </div>
      </div>

      {editingStock && (
        <EditStockModal
          stock={{
            ...editingStock,
            // Show buy price in display currency so user edits in familiar units
            buyPrice: editingStock.isCustom
              ? editingStock.buyPrice
              : convert(editingStock.buyPrice),
          }}
          onClose={() => setEditingStock(null)}
          onSave={handleEditSave}
        />
      )}

      {showModal && (
        <AddInvestmentModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPortfolio}
        />
      )}
    </AppLayout>
  );
};

export default Portfolio;