import { useEffect, useState, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../context/ThemeContext";
import AppLayout from "../components/layout/AppLayout";
import API from "../services/Api";
import { useAuth } from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import AddInvestmentModal from "../components/AddInvestmentModal";
import AnimatedList from "../components/AnimatedList";
import {
  FaSearch,
  FaBookmark, FaRegBookmark, FaPlus,
} from "react-icons/fa";
import MoneyLoader from "../components/MoneyLoader";

const SORT_OPTIONS = [
  { label: "Default",        value: "default"   },
  { label: "Price: High",    value: "price_desc"},
  { label: "Price: Low",     value: "price_asc" },
  { label: "Gain %: High",   value: "pct_desc"  },
  { label: "Loss %: High",   value: "pct_asc"   },
];

export default function Market() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [tab, setTab]           = useState("market");   // "market" | "watchlist"
  const [stocks, setStocks]     = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [watchSymbols, setWatchSymbols] = useState(new Set());
  const [loading, setLoading]   = useState(true);
  const [wlLoading, setWlLoading] = useState(false);
  const [error, setError]       = useState("");

  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("default");

  const [hoveredSymbol, setHoveredSymbol] = useState(null);
  const [quickAdd, setQuickAdd] = useState(null);   // stock to quick-add

  // ── Fetch top stocks ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchMarket = async () => {
      try {
        setLoading(true);
        const res = await API.get("/market/top");
        setStocks(res.data.data || []);
      } catch {
        setError("Failed to load market data.");
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, []);

  // ── Fetch watchlist ───────────────────────────────────────────────────────
  const fetchWatchlist = useCallback(async () => {
    if (!user) return;
    try {
      setWlLoading(true);
      const res = await API.get(`/watchlist/${user.uid}`);
      setWatchlist(res.data.stocks || []);
      setWatchSymbols(new Set(res.data.symbols || []));
    } catch {
      /* silent */
    } finally {
      setWlLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchWatchlist(); }, [fetchWatchlist]);

  // ── Toggle watchlist ──────────────────────────────────────────────────────
  const toggleWatchlist = async (symbol, e) => {
    e.stopPropagation();
    const inList = watchSymbols.has(symbol);
    try {
      if (inList) {
        await API.delete("/watchlist/remove", { data: { firebaseUID: user.uid, symbol } });
        setWatchSymbols((prev) => { const s = new Set(prev); s.delete(symbol); return s; });
        setWatchlist((prev) => prev.filter((s) => s.symbol !== symbol));
      } else {
        await API.post("/watchlist/add", { firebaseUID: user.uid, symbol });
        setWatchSymbols((prev) => new Set([...prev, symbol]));
        fetchWatchlist();
      }
    } catch { /* silent */ }
  };

  // ── Sort + filter ─────────────────────────────────────────────────────────
  const processedStocks = [...(tab === "market" ? stocks : watchlist)]
    .filter((s) => s.symbol.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price_desc") return b.currentPrice - a.currentPrice;
      if (sort === "price_asc")  return a.currentPrice - b.currentPrice;
      if (sort === "pct_desc")   return b.percentChange - a.percentChange;
      if (sort === "pct_asc")    return a.percentChange - b.percentChange;
      return 0;
    });

  return (
    <AppLayout title="Market">

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6">
        {["market", "watchlist"].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-sm font-medium transition
              ${tab === t
                ? "bg-lightAccent dark:bg-darkAccent text-white dark:text-black"
                : "bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-darkBg"}`}
          >
            {t === "market" ? "📈 Top Stocks" : `🔖 Watchlist${watchSymbols.size > 0 ? ` (${watchSymbols.size})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── Search + Sort ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search symbol..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm
            bg-white dark:bg-darkCard text-lightText dark:text-darkText
            border-gray-200 dark:border-darkBorder
            focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl border text-sm
          bg-white dark:bg-darkCard text-lightText dark:text-darkText
          border-gray-200 dark:border-darkBorder
          focus:outline-none focus:ring-2 focus:ring-lightAccent dark:focus:ring-darkAccent"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      {loading || wlLoading ? (
        <div className="flex items-center justify-center py-20">
          <MoneyLoader text="Fetching market data..." />
        </div>
      ) : error ? (
        <div className="text-center py-20 text-red-500">
          {error}
          <button onClick={() => window.location.reload()}
            className="block mx-auto mt-4 px-4 py-2 rounded-xl border text-sm">
            Retry
          </button>
        </div>
      ) : processedStocks.length === 0 ? (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          {tab === "watchlist"
            ? "Your watchlist is empty. Bookmark stocks from the market tab."
            : "No stocks found matching your search."}
        </div>
      ) : (
        <>
          {/* ── Mobile: AnimatedList ──────────────────────────────────── */}
          <div className="sm:hidden">
            <AnimatedList
              items={processedStocks.map((stock) => {
                const isPos = stock.percentChange >= 0;
                return (
                  <div key={stock.symbol} className="flex items-center justify-between w-full"
                    onClick={() => navigate(`/stock/${stock.symbol}`)}>
                    <div>
                      <p className="font-bold text-sm text-lightText dark:text-darkText">{stock.symbol}</p>
                      <p className={`text-xs font-medium ${isPos ? "text-green-500" : "text-red-500"}`}>
                        {isPos ? "▲" : "▼"} {Math.abs(stock.percentChange ?? 0).toFixed(2)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-lightText dark:text-darkText">
                        {format(stock.currentPrice ?? 0)}
                      </p>
                      <p className={`text-xs ${isPos ? "text-green-500" : "text-red-500"}`}>
                        {isPos ? "+" : ""}{format(stock.change ?? 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
              onItemSelect={(_, i) => navigate(`/stock/${processedStocks[i]?.symbol}`)}
              showGradients
              enableArrowNavigation
              displayScrollbar={false}
            />
          </div>

          {/* ── Desktop/tablet: Grid ──────────────────────────────────── */}
          <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-4">
            {processedStocks.map((stock) => (
              <StockCard
              key={stock.symbol}
              stock={stock}
              isHovered={hoveredSymbol === stock.symbol}
              inWatchlist={watchSymbols.has(stock.symbol)}
              format={format}
              onHover={() => setHoveredSymbol(stock.symbol)}
              onLeave={() => setHoveredSymbol(null)}
              onToggleWatchlist={toggleWatchlist}
              onQuickAdd={() => setQuickAdd(stock)}
              onNavigate={() => navigate(`/stock/${stock.symbol}`)}
              darkMode={darkMode}
            />
            ))}
          </div>
        </>
      )}

      {/* ── Quick Add Modal ───────────────────────────────────────────────── */}
      {quickAdd && (
        <AddInvestmentModal
          prefillSymbol={quickAdd.symbol}
          prefillPrice={quickAdd.currentPrice}
          onClose={() => setQuickAdd(null)}
          onSuccess={() => setQuickAdd(null)}
        />
      )}
    </AppLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stock Card component
// ─────────────────────────────────────────────────────────────────────────────
function StockCard({ stock, isHovered, inWatchlist, format, onHover, onLeave, onToggleWatchlist, onQuickAdd, onNavigate, darkMode = false }) {
  const isPositive = stock.percentChange >= 0;

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={onNavigate}
      className={`relative rounded-2xl border p-5 cursor-pointer
      transition-all duration-300 overflow-hidden
      ${isHovered
        ? "shadow-2xl -translate-y-1.5 border-lightAccent/50 dark:border-darkAccent/50"
        : "shadow-sm border-gray-200 dark:border-darkBorder hover:border-lightAccent/20 dark:hover:border-darkAccent/20"
      }`}
      style={{
        background: isHovered
          ? darkMode
            ? isPositive
              ? "linear-gradient(135deg, #0F1A14 0%, #0d2a1a 100%)"
              : "linear-gradient(135deg, #1a0f0f 0%, #2a0d0d 100%)"
            : isPositive
              ? "linear-gradient(135deg, #fff9ee 0%, #fff3d6 100%)"
              : "linear-gradient(135deg, #fff5f5 0%, #ffe8e8 100%)"
          : darkMode
            ? "#0F1A14"
            : "#ffffff"
      }}
    >


      {/* Header row */}
      <div className="relative flex justify-between items-start mb-3">
        <div>
          <h3 className={`text-base font-bold transition-colors duration-200
            ${isHovered
              ? "text-lightAccent dark:text-darkAccent"
              : "text-lightText dark:text-darkText"
            }`}>
            {stock.symbol}
          </h3>
          <p className={`text-xs font-medium mt-0.5 ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "▲" : "▼"} {Math.abs(stock.percentChange ?? 0).toFixed(2)}%
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleWatchlist(stock.symbol, e); }}
          className={`p-1.5 rounded-lg transition z-10
            ${inWatchlist
              ? "text-lightAccent dark:text-darkAccent"
              : "text-gray-300 dark:text-gray-600 hover:text-lightAccent dark:hover:text-darkAccent"}`}
          title={inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
        >
          {inWatchlist ? <FaBookmark size={14} /> : <FaRegBookmark size={14} />}
        </button>
      </div>

      {/* Price */}
      <div className="relative">
        <p className="text-xl font-bold text-lightText dark:text-darkText mb-1">
          {format(stock.currentPrice ?? 0)}
        </p>
        <p className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
          {isPositive ? "+" : ""}{format(stock.change ?? 0)} today
        </p>
      </div>

      {/* Expanded details on hover */}
      <div className={`relative overflow-hidden transition-all duration-300
        ${isHovered ? "max-h-52 mt-4 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="pt-3 border-t border-lightAccent/20 dark:border-darkAccent/20
          grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          {stock.open && (
            <>
              <div>
                <p className="text-lightMuted dark:text-gray-500">Open</p>
                <p className="font-semibold text-lightText dark:text-darkText">{format(stock.open)}</p>
              </div>
              <div>
                <p className="text-lightMuted dark:text-gray-500">Prev Close</p>
                <p className="font-semibold text-lightText dark:text-darkText">{format(stock.prevClose)}</p>
              </div>
              <div>
                <p className="text-lightMuted dark:text-gray-500">Day High</p>
                <p className="font-semibold text-green-500">{format(stock.high)}</p>
              </div>
              <div>
                <p className="text-lightMuted dark:text-gray-500">Day Low</p>
                <p className="font-semibold text-red-500">{format(stock.low)}</p>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onQuickAdd}
            className="flex-1 flex items-center justify-center gap-1.5
            py-2 rounded-xl text-xs font-medium
            bg-lightAccent dark:bg-darkAccent
            text-white dark:text-black
            hover:opacity-90 transition"
          >
            <FaPlus size={10} /> Add to Portfolio
          </button>
          <button
            onClick={onNavigate}
            className="flex-1 flex items-center justify-center gap-1.5
            py-2 rounded-xl text-xs font-medium
            border border-lightAccent dark:border-darkAccent
            text-lightAccent dark:text-darkAccent
            hover:bg-lightAccent/10 dark:hover:bg-darkAccent/10
            transition"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}