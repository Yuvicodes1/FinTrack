import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import API from "../services/Api";
import { useNavigate } from "react-router-dom";

export default function Market() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await API.get("/market/top");
        setStocks(res.data.data);
      } catch (err) {
        console.error("Market fetch error:", err);
        setError("Failed to load market data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchStocks();
  }, []);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <AppLayout title="Market">
        <div className="text-center mt-20 text-lg">
          Loading market data...
        </div>
      </AppLayout>
    );
  }

  // ─── Error state ──────────────────────────────────────────────────────────
  if (error) {
    return (
      <AppLayout title="Market">
        <div className="flex flex-col items-center mt-20 gap-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-lightAccent text-white dark:bg-darkAccent dark:text-black hover:scale-105 transition"
          >
            Retry
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Market">
      <div className="grid md:grid-cols-3 gap-6">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="p-6 rounded-2xl shadow-md
            bg-white dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder
            cursor-pointer hover:shadow-xl transition"
            onClick={() => navigate(`/stock/${stock.symbol}`)}
          >
            <h2 className="text-xl font-semibold">{stock.symbol}</h2>

            <p className="text-lg mt-2">₹{stock.currentPrice}</p>

            <p
              className={`mt-1 ${
                stock.change >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {stock.percentChange?.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}