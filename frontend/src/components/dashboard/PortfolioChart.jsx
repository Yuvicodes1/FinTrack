import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import API from "../../services/Api";

export default function PortfolioChart({ stocks }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stocks || stocks.length === 0) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError("");

        // ─── Fetch all stock histories in parallel ────────────────────────
        const responses = await Promise.all(
          stocks.map((stock) =>
            API.get(`/market/history?symbol=${stock.symbol}`)
          )
        );

        // ─── Merge all histories into a single date-keyed map ─────────────
        const portfolioMap = {};

        responses.forEach((res, i) => {
          const stock = stocks[i];
          const history = res.data?.data ?? [];

          history.forEach((day) => {
            if (!portfolioMap[day.date]) {
              portfolioMap[day.date] = { date: day.date, value: 0 };
            }
            portfolioMap[day.date].value += day.close * stock.quantity;
          });
        });

        const mergedData = Object.values(portfolioMap).sort(
          (a, b) => new Date(a.date) - new Date(b.date)
        );

        setChartData(mergedData);
      } catch (err) {
        console.error("History fetch error:", err);
        setError("Failed to load chart data.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [stocks]);

  return (
    <div
      className="p-6 rounded-2xl shadow-md
      bg-white dark:bg-darkCard
      border border-gray-200 dark:border-darkBorder
      mt-10"
    >
      <h2 className="text-lg font-semibold mb-6">Portfolio Performance</h2>

      {loading ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          Loading chart...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[300px] text-red-500">
          {error}
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[300px] text-gray-400">
          No chart data available.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Portfolio Value"
              stroke="#2DD4BF"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}