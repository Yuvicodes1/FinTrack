import {
  PieChart, Pie, Cell, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

const CATEGORY_COLORS = {
  "Food & Dining":  "#2DD4BF",
  "Transport":      "#60A5FA",
  "Entertainment":  "#F472B6",
  "Shopping":       "#FBBF24",
  "Utilities":      "#A78BFA",
  "Travel":         "#34D399",
  "Other":          "#94A3B8",
};

const CATEGORY_ICONS = {
  "Food & Dining": "🍽️",
  "Transport":     "🚗",
  "Entertainment": "🎬",
  "Shopping":      "🛍️",
  "Utilities":     "💡",
  "Travel":        "✈️",
  "Other":         "📌",
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const { name, value } = payload[0];
    return (
      <div className="bg-white dark:bg-darkCard border border-gray-200
        dark:border-darkBorder rounded-xl px-4 py-3 shadow-lg text-sm">
        <p className="font-semibold text-lightText dark:text-darkText">
          {CATEGORY_ICONS[name]} {name}
        </p>
        <p className="text-lightAccent dark:text-darkAccent font-bold mt-1">
          ₹{value.toLocaleString("en-IN")}
        </p>
      </div>
    );
  }
  return null;
};

export default function ExpenseChart({ categoryTotals }) {
  const data = Object.entries(categoryTotals)
    .filter(([, value]) => value > 0)
    .map(([name, value]) => ({ name, value }));

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64
        text-gray-400 dark:text-gray-500 text-sm">
        No expenses this month yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={CATEGORY_COLORS[entry.name] ?? "#94A3B8"}
              stroke="none"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-lightText dark:text-darkText">
              {CATEGORY_ICONS[value]} {value}
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}