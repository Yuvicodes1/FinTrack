import { useContext, useState, useRef, useEffect } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { FaMoon, FaSun, FaChevronDown } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { useCurrency, CURRENCIES } from "../../context/CurrencyContext";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title }) {
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const { currency, currencyMeta, setCurrency } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ── Derive initials from displayName or email ─────────────────────────────
  const getInitials = () => {
    if (!user) return "?";
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    // Fallback to first letter of email
    return user.email?.[0]?.toUpperCase() ?? "?";
  };

  // ── Close currency dropdown on outside click ──────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("userId");
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleCurrencySelect = async (code) => {
    await setCurrency(code);
    setDropdownOpen(false);
  };

  return (
    <header
      className="flex justify-between items-center
      px-8 py-4
      bg-white/70 dark:bg-darkBg/70
      backdrop-blur-md
      border-b border-gray-200 dark:border-darkBorder
      sticky top-0 z-40"
    >
      {/* Page Title */}
      <h1 className="text-2xl font-semibold">{title}</h1>

      {/* Right Controls */}
      <div className="flex items-center gap-4">

        {/* ── Currency Selector ─────────────────────────────────────────── */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border
            border-gray-300 dark:border-darkBorder
            bg-white dark:bg-darkCard
            hover:bg-gray-100 dark:hover:bg-darkBg
            text-sm font-medium transition"
          >
            <span>{currencyMeta.symbol}</span>
            <span>{currency}</span>
            <FaChevronDown
              size={10}
              className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg
              bg-white dark:bg-darkCard
              border border-gray-200 dark:border-darkBorder
              overflow-hidden z-50"
            >
              {Object.values(CURRENCIES).map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCurrencySelect(c.code)}
                  className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3
                  transition hover:bg-gray-100 dark:hover:bg-darkBg
                  ${currency === c.code
                    ? "text-lightAccent dark:text-darkAccent font-semibold"
                    : "text-lightText dark:text-darkText"
                  }`}
                >
                  <span className="text-base w-5">{c.symbol}</span>
                  <span>{c.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg border
          border-gray-300 dark:border-darkBorder
          hover:bg-gray-100 dark:hover:bg-darkCard transition"
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* ── User Avatar with real initials ────────────────────────────── */}
        <div
          className="w-9 h-9 rounded-full
          bg-lightAccent dark:bg-darkAccent
          flex items-center justify-center
          text-white dark:text-black text-sm font-bold
          select-none"
          title={user?.displayName || user?.email || ""}
        >
          {getInitials()}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg
          bg-red-500 text-white
          hover:bg-red-600 transition"
        >
          Logout
        </button>

      </div>
    </header>
  );
}