import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import API from "../services/Api";
import PortfolioChart from "../components/dashboard/PortfolioChart";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";

export default function Dashboard() {
  const { user, authLoading } = useAuth();
  const { format, currencyLoading } = useCurrency();

  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setLoading(false); return; }

    const fetchPortfolio = async () => {
      try {
        const res = await API.get(`/portfolio/${user.uid}`);
        setPortfolio(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load portfolio.");
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [user, authLoading]);

  if (authLoading || loading || currencyLoading) {
    return (
      <AppLayout title="Dashboard">
        <div className="text-center mt-20 text-lg">Loading portfolio...</div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title="Dashboard">
        <div className="text-center mt-20 text-red-500">{error}</div>
      </AppLayout>
    );
  }

  if (!portfolio) {
    return (
      <AppLayout title="Dashboard">
        <div className="text-center mt-20">No portfolio found.</div>
      </AppLayout>
    );
  }

  const summary = portfolio.summary;

  return (
    <AppLayout title="Dashboard">

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <SummaryCard title="Total Invested"  value={format(summary.totalInvested)} />
        <SummaryCard title="Current Value"   value={format(summary.totalCurrentValue)} />
        <SummaryCard
          title="Profit / Loss"
          value={format(summary.totalProfitLoss)}
          highlight
          positive={summary.totalProfitLoss >= 0}
        />
      </div>

      {/* Stock Table */}
      <div className="rounded-2xl overflow-hidden
        bg-white dark:bg-darkCard
        border border-gray-200 dark:border-darkBorder
        shadow-md"
      >
        <table className="w-full text-left">
          <thead className="bg-gray-100 dark:bg-darkBg text-sm">
            <tr>
              <th className="p-4">Symbol</th>
              <th className="p-4">Qty</th>
              <th className="p-4">Buy Price</th>
              <th className="p-4">Current Price</th>
              <th className="p-4">P/L</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.stocks.map((stock) => (
              <tr key={stock.symbol} className="border-t border-gray-200 dark:border-darkBorder">
                <td className="p-4 font-semibold">{stock.symbol}</td>
                <td className="p-4">{stock.quantity}</td>
                <td className="p-4">
                  <span>{format(stock.buyPrice)}</span>
                  {!stock.isCustom && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      ${stock.buyPrice.toFixed(2)} USD
                    </span>
                  )}
                </td>
                <td className="p-4">
                  <span>{format(stock.currentPrice)}</span>
                  {!stock.isCustom && (
                    <span className="block text-xs text-gray-400 dark:text-gray-500">
                      ${stock.currentPrice.toFixed(2)} USD
                    </span>
                  )}
                </td>
                <td className={`p-4 font-semibold ${stock.profitLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
                  <span>{format(stock.profitLoss)}</span>
                  {!stock.isCustom && (
                    <span className="block text-xs font-normal text-gray-400 dark:text-gray-500">
                      ${stock.profitLoss.toFixed(2)} USD
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PortfolioChart stocks={portfolio.stocks} />

    </AppLayout>
  );
}

function SummaryCard({ title, value, highlight, positive }) {
  return (
    <div className="p-6 rounded-2xl shadow-md
      bg-white dark:bg-darkCard
      border border-gray-200 dark:border-darkBorder"
    >
      <h3 className="text-sm text-lightMuted dark:text-gray-400">{title}</h3>
      <p className={`text-2xl font-bold mt-2 ${
        highlight ? (positive ? "text-green-500" : "text-red-500") : ""
      }`}>
        {value}
      </p>
    </div>
  );
}