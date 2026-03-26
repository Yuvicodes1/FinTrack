import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { FaChartLine, FaWallet, FaArrowRight, FaMoon, FaSun } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import API from "../services/Api";

export default function HomePage() {
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const navigate = useNavigate();
  const [mongoName, setMongoName] = useState("");

  // Fetch the user's name from MongoDB (source of truth for display name)
  useEffect(() => {
    if (!user) return;
    API.get(`/users/${user.uid}/settings`)
      .then((res) => {
        const name = res.data?.displayName || res.data?.name || "";
        setMongoName(name);
      })
      .catch(() => {});
  }, [user]);

  const getFirstName = () => {
    // Priority: MongoDB name → Firebase displayName → email prefix
    const fullName = mongoName || user?.displayName || user?.email?.split("@")[0] || "";
    return fullName.split(" ")[0];
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col
      text-lightText dark:text-darkText
      transition-colors duration-500"
      style={{ background: darkMode
        ? "radial-gradient(ellipse at 20% 20%, #1C2A23 0%, #071108 60%)"
        : "radial-gradient(ellipse at 20% 20%, #fff9ee 0%, #FEFFFE 60%)"
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="flex justify-between items-center
        px-8 py-5
        bg-white/80 dark:bg-darkCard/80
        backdrop-blur-md
        border-b border-gray-200 dark:border-darkBorder
        sticky top-0 z-40"
      >
        <div className="flex items-center gap-2">
          <FaChartLine className="text-lightAccent dark:text-darkAccent" size={20} />
          <span className="text-lg font-bold">FinTrack</span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg border
            border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkCard transition"
          >
            {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
          </button>

          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm rounded-xl
            border border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkCard
            text-gray-600 dark:text-gray-400 transition"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main ─────────────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">

        {/* Greeting */}
        <div className="text-center mb-12">
          <p className="text-sm font-medium tracking-widest uppercase
            text-lightAccent dark:text-darkAccent mb-3">
            Welcome back
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Hey, {getFirstName()} 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            What would you like to do today?
          </p>
        </div>

        {/* Two Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl w-full">

          {/* Investment Tracker */}
          <div
            onClick={() => navigate("/dashboard")}
            className="group cursor-pointer
            p-8 rounded-3xl
            border shadow-sm hover:shadow-2xl
            transition-all duration-300 hover:-translate-y-2
            border-gray-200 dark:border-darkBorder
            bg-white dark:bg-darkCard
            hover:border-lightAccent/40 dark:hover:border-darkAccent/40"
            style={{ }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode
              ? "linear-gradient(135deg, #0F1A14 0%, #1a2d1f 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #fff5e0 100%)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <div className="w-14 h-14 rounded-2xl mb-6
              flex items-center justify-center
              bg-lightAccent/10 dark:bg-darkAccent/10">
              <FaChartLine size={26}
                className="text-lightAccent dark:text-darkAccent" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Investment Tracker</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Monitor your stock portfolio with live prices, P&L tracking,
              historical charts, and multi-currency support.
            </p>

            <ul className="space-y-2 mb-8 text-sm text-gray-400 dark:text-gray-500">
              {["Live stock prices", "USD / INR / EUR support", "Portfolio charts", "Custom assets"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full
                    bg-lightAccent dark:bg-darkAccent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2
              text-lightAccent dark:text-darkAccent
              font-semibold text-sm
              group-hover:gap-4 transition-all duration-200"
            >
              Go to Dashboard <FaArrowRight size={12} />
            </div>
          </div>

          {/* Expense Manager */}
          <div
            onClick={() => navigate("/expenses")}
            className="group cursor-pointer
            p-8 rounded-3xl
            border shadow-sm hover:shadow-2xl
            transition-all duration-300 hover:-translate-y-2
            border-gray-200 dark:border-darkBorder
            bg-white dark:bg-darkCard
            hover:border-emerald-300/60 dark:hover:border-emerald-500/40"
            onMouseEnter={e => e.currentTarget.style.background = darkMode
              ? "linear-gradient(135deg, #0F1A14 0%, #0d2018 100%)"
              : "linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)"}
            onMouseLeave={e => e.currentTarget.style.background = ""}
          >
            <div className="w-14 h-14 rounded-2xl mb-6
              flex items-center justify-center
              bg-emerald-500/10 dark:bg-emerald-400/10">
              <FaWallet size={26}
                className="text-emerald-500 dark:text-emerald-400" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Expense Manager</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-8">
              Track monthly spending by category, set your salary budget,
              and get AI-powered insights from Claude Haiku.
            </p>

            <ul className="space-y-2 mb-8 text-sm text-gray-400 dark:text-gray-500">
              {["7 spending categories", "Monthly salary tracking", "Spending pie chart", "AI chat assistant"].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full
                    bg-emerald-500 dark:bg-emerald-400 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2
              text-emerald-500 dark:text-emerald-400
              font-semibold text-sm
              group-hover:gap-4 transition-all duration-200"
            >
              Go to Expenses <FaArrowRight size={12} />
            </div>
          </div>

        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="text-center py-5 text-xs
        text-gray-400 dark:text-gray-500
        border-t border-gray-200 dark:border-darkBorder"
      >
        FinTrack · Built with React, Node.js & Claude AI
      </footer>
    </div>
  );
}