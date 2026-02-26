import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext";
import {
  FaMoon,
  FaSun,
  FaChartLine,
  FaWallet,
  FaChartBar,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaTimes // Added for the Close (X) icon
} from "react-icons/fa";

export default function Landing() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  
  // Modal State
  const [showModal, setShowModal] = useState(false);

  // Scroll lock when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    // Cleanup function to ensure scrolling is restored if component unmounts
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <div
      className="min-h-screen scroll-smooth transition-colors duration-500
      bg-lightBg text-lightText
      dark:bg-darkBg dark:text-darkText
      relative overflow-hidden"
    >

      {/* Subtle Noise Texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/noise.png')"
        }}
      />

      {/* ================= NAVBAR ================= */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-md
        bg-white/70 dark:bg-darkBg/70
        border-b border-gray-300 dark:border-darkBorder
        flex justify-between items-center px-12 py-5"
      >
        <h1 className="text-3xl font-bold tracking-tight text-lightAccent dark:text-darkAccent">
          MONEYFORGE
        </h1>

        <div className="flex items-center gap-5">

          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-3 rounded-lg border
            border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkCard
            transition transform hover:scale-110"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* Login */}
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 rounded-xl font-medium
            bg-lightAccent text-white
            dark:bg-darkAccent dark:text-black
            hover:scale-105 transition shadow-md"
          >
            Login
          </button>

        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="flex flex-col items-center justify-center
        text-center px-6 py-28 relative z-10"
      >
        <h2 className="text-5xl font-bold max-w-3xl leading-tight">
          Your Ultimate Stock Portfolio Tracker
        </h2>

        <p className="mt-6 text-lg max-w-2xl
          text-lightMuted dark:text-gray-400"
        >
          Track investments, monitor live stock prices,
          analyze performance, and make smarter financial decisions.
        </p>

        <p className="mt-6 text-lg font-semibold
          text-lightAccent dark:text-darkAccent"
        >
          Earn with Us, Learn with Us.
        </p>

        <button
          onClick={() => navigate("/login")}
          className="mt-12 px-8 py-4 rounded-xl text-lg font-semibold
          bg-lightSecondary text-white
          dark:bg-darkAccent dark:text-black
          hover:scale-105 transition shadow-lg"
        >
          Get Started
        </button>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="grid md:grid-cols-3 gap-12 px-16 pb-28 relative z-10">

        {[
          {
            icon: <FaChartLine size={30} />,
            title: "Real-Time Prices",
            desc: "Live stock tracking powered by market data APIs. Never miss a beat."
          },
          {
            icon: <FaWallet size={30} />,
            title: "Portfolio Analytics",
            desc: "Automatic profit/loss calculation and detailed performance insights."
          },
          {
            icon: <FaChartBar size={30} />,
            title: "Historical Charts",
            desc: "Visualize trends and analyze historical performance with ease."
          }
        ].map((feature, index) => (
          <div
            key={index}
            className="p-10 rounded-2xl border
            border-gray-200 dark:border-darkBorder
            bg-white dark:bg-darkCard
            shadow-sm hover:shadow-lg
            transition duration-300 hover:-translate-y-2"
          >
            <div className="mb-6 text-lightAccent dark:text-darkAccent">
              {feature.icon}
            </div>

            <h3 className="text-xl font-semibold mb-4">
              {feature.title}
            </h3>

            <p className="text-lightMuted dark:text-gray-400">
              {feature.desc}
            </p>
          </div>
        ))}

      </section>

      {/* ================= CTA ================= */}
      <section
        className="py-24 text-center relative z-10
        bg-gradient-to-r
        from-lightSecondary to-lightAccent
        dark:from-darkAccent dark:to-darkBg
        text-white dark:text-black"
      >
        <h2 className="text-3xl font-bold mb-6">
          Ready to Take Control of Your Investments?
        </h2>

        <p className="max-w-2xl mx-auto mb-10">
          Join smart investors using Stock Manager
          to track and optimize their portfolios.
        </p>

        {/* Updated CTA Button */}
        <button
          onClick={() => setShowModal(true)}
          className="px-8 py-4 rounded-xl font-semibold
          bg-white text-black
          dark:bg-black dark:text-white
          hover:scale-105 transition shadow-md"
        >
          Know More
        </button>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        className="px-16 py-20
        bg-lightBg dark:bg-darkBg
        border-t border-gray-300 dark:border-darkBorder
        relative z-10"
      >
        <div className="grid md:grid-cols-4 gap-12">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-lightAccent dark:text-darkAccent">
              MoneyForge
            </h3>
            <p className="text-lightMuted dark:text-gray-400 text-sm">
              A professional real-time portfolio management platform
              designed for modern investors.
            </p>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-lightMuted dark:text-gray-400 text-sm">
              <li className="hover:text-lightAccent dark:hover:text-darkAccent cursor-pointer">About</li>
              <li className="hover:text-lightAccent dark:hover:text-darkAccent cursor-pointer">Privacy</li>
              <li className="hover:text-lightAccent dark:hover:text-darkAccent cursor-pointer">Terms</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-lightMuted dark:text-gray-400 text-sm">
              <li>Email: yuvicodes@gmail.com</li>
              <li>Phone: +91 7060043489</li>
              <li>Location: India</li>
            </ul>
          </div>

          {/* Social + Developer */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-4 mb-4 text-xl">
              <a href="https://github.com/Yuvicodes1" target="_blank" rel="noreferrer" className="hover:text-lightAccent dark:hover:text-darkAccent">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/yathaartha-srivastava-063758258/" target="_blank" rel="noreferrer" className="hover:text-lightAccent dark:hover:text-darkAccent">
                <FaLinkedin />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="hover:text-lightAccent dark:hover:text-darkAccent">
                <FaInstagram />
              </a>
            </div>

            <p className="text-lightMuted dark:text-gray-400 text-sm">
              Developed by Yuvi
            </p>
          </div>

        </div>

        <div className="mt-16 pt-6 text-center text-sm
          border-t border-gray-300 dark:border-darkBorder
          text-lightMuted dark:text-gray-500"
        >
          © {new Date().getFullYear()}  MoneyForge. All rights reserved.
        </div>
      </footer>

      {/* ================= MODAL ================= */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Background Overlay - extracted onClick to here and added smooth transition */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-[fadeIn_0.3s_ease-out]" 
            onClick={() => setShowModal(false)}
          />

          {/* Modal Box */}
          <div
            className="relative z-10 w-[90%] max-w-2xl
            bg-white dark:bg-darkCard
            text-lightText dark:text-darkText
            rounded-2xl shadow-2xl p-10
            animate-[fadeIn_0.3s_ease-out]"
          >
            {/* Close (X) Icon */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition transform hover:scale-110"
              aria-label="Close modal"
            >
              <FaTimes size={24} />
            </button>

            <h2 className="text-2xl font-bold mb-6 pr-8 text-lightAccent dark:text-darkAccent">
              About MoneyForge
            </h2>

            <p className="mb-4 text-lightMuted dark:text-gray-400">
              MoneyForge is an enterprise-grade portfolio management platform
              designed to deliver real-time stock insights, automated analytics,
              and historical data visualization.
            </p>

            <p className="mb-6 text-lightMuted dark:text-gray-400">
              Built with scalability and performance in mind, it empowers
              investors with intelligent decision-making tools and
              transparent financial tracking.
            </p>

            <button
              onClick={() => {
                setShowModal(false);
                navigate("/login");
              }}
              className="px-6 py-3 rounded-xl font-medium
              bg-lightAccent text-white
              dark:bg-darkAccent dark:text-black
              hover:scale-105 transition"
            >
              Get Started
            </button>

          </div>
        </div>
      )}

    </div>
  );
}