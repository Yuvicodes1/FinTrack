import { useNavigate } from "react-router-dom";
import { useContext, useState, useEffect, useRef } from "react";
import { ThemeContext } from "../context/ThemeContext";
import CurvedLoop from "../components/CurvedLoop";
import {
  FaMoon, FaSun, FaChartLine, FaWallet,
  FaChartBar, FaGithub, FaLinkedin, FaInstagram, FaTimes,
} from "react-icons/fa";

// ── Intersection observer hook for scroll reveal ──────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useScrollReveal(0.5);
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(to / 60);
    const t = setInterval(() => {
      start = Math.min(start + step, to);
      setCount(start);
      if (start >= to) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [visible, to]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export default function Landing() {
  const navigate = useNavigate();
  const { darkMode, setDarkMode } = useContext(ThemeContext);
  const [showModal, setShowModal] = useState(false);
  const [heroRef, heroVisible] = useScrollReveal(0.1);
  const [featRef, featVisible] = useScrollReveal(0.1);
  const [statsRef, statsVisible] = useScrollReveal(0.15);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [showModal]);

  const features = [
    { icon: <FaChartLine size={28} />, title: "Real-Time Prices", desc: "Live stock tracking powered by Finnhub APIs. Never miss a market move." },
    { icon: <FaWallet size={28} />, title: "Portfolio Analytics", desc: "Automatic P&L calculation, multi-currency support, and detailed insights." },
    { icon: <FaChartBar size={28} />, title: "Historical Charts", desc: "Visualize trends and analyze performance across months and years." },
  ];

  const stats = [
    { value: 50, suffix: "+", label: "Stocks Tracked" },
    { value: 3, suffix: " Currencies", label: "USD · INR · EUR" },
    { value: 100, suffix: "%", label: "Free to Use" },
  ];

  return (
    <div className="min-h-screen scroll-smooth transition-colors duration-500
      bg-lightBg text-lightText dark:bg-darkBg dark:text-darkText relative overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Google Fonts ─────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);     }
        }
        @keyframes fadeIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        .anim-fade-up   { animation: fadeUp 0.7s ease both; }
        .anim-delay-1   { animation-delay: 0.1s; }
        .anim-delay-2   { animation-delay: 0.25s; }
        .anim-delay-3   { animation-delay: 0.4s; }
        .anim-delay-4   { animation-delay: 0.55s; }
        .anim-float     { animation: float 4s ease-in-out infinite; }
        .anim-float-2   { animation: float 5s ease-in-out infinite 0.8s; }

        .reveal { transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal-hidden { opacity: 0; transform: translateY(28px); }
        .reveal-visible { opacity: 1; transform: translateY(0); }
      `}</style>

      {/* ── Decorative orbs ──────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl anim-float"
        style={{ background: "radial-gradient(circle, #DDA448, transparent)" }} />
      <div className="pointer-events-none absolute top-32 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl anim-float-2"
        style={{ background: "radial-gradient(circle, #480355, transparent)" }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/noise.png')" }} />

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 backdrop-blur-md
        bg-white/70 dark:bg-darkBg/70
        border-b border-gray-200 dark:border-darkBorder
        flex justify-between items-center px-8 md:px-12 py-4">

        <h1 className="font-display text-2xl font-black tracking-tight
          text-lightAccent dark:text-darkAccent">
          FinTrack
        </h1>

        <div className="flex items-center gap-3">
          <button onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-lg border border-gray-300 dark:border-darkBorder
            hover:bg-gray-100 dark:hover:bg-darkCard transition hover:scale-110">
            {darkMode ? <FaSun size={15} /> : <FaMoon size={15} />}
          </button>
          <button onClick={() => navigate("/login")}
            className="px-5 py-2 rounded-xl font-semibold text-sm
            bg-lightAccent text-white dark:bg-darkAccent dark:text-black
            hover:scale-105 transition shadow-md">
            Login
          </button>
        </div>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="flex flex-col items-center justify-center
        text-center px-6 py-24 md:py-32 relative z-10">

        <span className={`inline-block text-xs font-semibold tracking-[0.2em] uppercase
          px-4 py-1.5 rounded-full mb-6
          bg-lightAccent/10 dark:bg-darkAccent/10
          text-lightAccent dark:text-darkAccent border border-lightAccent/20 dark:border-darkAccent/20
          reveal ${heroVisible ? "reveal-visible anim-fade-up" : "reveal-hidden"}`}>
          The Smart Investor's Platform
        </span>

        <h2 className={`font-display text-5xl md:text-7xl font-black max-w-4xl leading-[1.05] mb-6
          reveal ${heroVisible ? "reveal-visible anim-fade-up anim-delay-1" : "reveal-hidden"}`}>
          Invest Smarter.{" "}
          <span style={{
            backgroundImage: darkMode
              ? "linear-gradient(135deg, #2DD4BF 0%, #34d399 60%, #a3e635 100%)"
              : "linear-gradient(135deg, #DDA448 0%, #8B1874 60%, #480355 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Live Better.
          </span>
        </h2>

        <p className={`mt-2 text-lg md:text-xl max-w-2xl text-lightMuted dark:text-gray-400 leading-relaxed
          reveal ${heroVisible ? "reveal-visible anim-fade-up anim-delay-2" : "reveal-hidden"}`}>
          Real-time portfolio tracking, AI expense insights, and live market data —
          all in one beautiful platform built for the modern investor.
        </p>

        <p className={`mt-5 text-base font-semibold text-lightAccent dark:text-darkAccent
          reveal ${heroVisible ? "reveal-visible anim-fade-up anim-delay-3" : "reveal-hidden"}`}>
          Earn with Us, Learn with Us.
        </p>

        <div className={`flex flex-col sm:flex-row gap-4 mt-10
          reveal ${heroVisible ? "reveal-visible anim-fade-up anim-delay-4" : "reveal-hidden"}`}>
          <button onClick={() => navigate("/login")}
            className="px-8 py-4 rounded-xl text-base font-semibold
            bg-lightSecondary text-white dark:bg-darkAccent dark:text-black
            hover:scale-105 transition shadow-lg hover:shadow-xl">
            Get Started Free
          </button>
          <button onClick={() => setShowModal(true)}
            className="px-8 py-4 rounded-xl text-base font-semibold
            border-2 border-lightAccent dark:border-darkAccent
            text-lightAccent dark:text-darkAccent
            hover:bg-lightAccent/10 dark:hover:bg-darkAccent/10
            transition">
            Learn More
          </button>
        </div>
      </section>

      {/* ── CURVED LOOP MARQUEE ──────────────────────────────────────────── */}
      <div className="relative z-10 -mt-8 mb-4 overflow-hidden"
        style={{ background: darkMode
          ? "linear-gradient(135deg, #071108 0%, #0F1A14 40%, #1C2A23 100%)"
          : "linear-gradient(135deg, #480355 0%, #8B1874 50%, #DDA448 100%)" }}>
        {/* Subtle border lines to frame the strip */}
        <div className="absolute inset-x-0 top-0 h-px"
          style={{ background: darkMode ? "#2DD4BF40" : "#ffffff30" }} />
        <div className="absolute inset-x-0 bottom-0 h-px"
          style={{ background: darkMode ? "#2DD4BF40" : "#ffffff30" }} />
        <CurvedLoop
          marqueeText="Track Wealth ✦ Beat the Market ✦ Live Your Dream ✦ Own the Chart ✦ Stay Invested ✦"
          speed={1.5}
          curveAmount={180}
          direction="left"
          interactive
          textFill={darkMode ? "#2DD4BF" : "#ffffff"}
          className="text-[4.5rem]"
        />
      </div>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="grid grid-cols-3 gap-6 px-8 md:px-16 py-16 relative z-10
        max-w-3xl mx-auto">
        {stats.map((s, i) => (
          <div key={i} className={`text-center reveal ${statsVisible ? "reveal-visible" : "reveal-hidden"}`}
            style={{ transitionDelay: `${i * 120}ms` }}>
            <p className="font-display text-3xl md:text-4xl font-black text-lightAccent dark:text-darkAccent">
              <Counter to={s.value} suffix={s.suffix} />
            </p>
            <p className="text-xs md:text-sm text-lightMuted dark:text-gray-400 mt-1">{s.label}</p>
          </div>
        ))}
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section ref={featRef} className="grid md:grid-cols-3 gap-8 px-8 md:px-16 pb-24 relative z-10">
        {features.map((feature, i) => (
          <div key={i}
            className={`p-8 rounded-2xl border
            border-gray-200 dark:border-darkBorder
            bg-white dark:bg-darkCard
            shadow-sm hover:shadow-xl
            transition-all duration-300 hover:-translate-y-2 group
            reveal ${featVisible ? "reveal-visible" : "reveal-hidden"}`}
            style={{ transitionDelay: `${i * 150}ms` }}
          >
            <div className="mb-5 w-12 h-12 rounded-xl flex items-center justify-center
              bg-lightAccent/10 dark:bg-darkAccent/10
              text-lightAccent dark:text-darkAccent
              group-hover:scale-110 transition-transform duration-300">
              {feature.icon}
            </div>
            <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-lightMuted dark:text-gray-400 leading-relaxed text-sm">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────────────────── */}
      <section className="py-24 text-center relative z-10 overflow-hidden"
        style={{ background: darkMode
          ? "linear-gradient(135deg, #2DD4BF 0%, #071108 50%, #1C2A23 100%)"
          : "linear-gradient(135deg, #480355 0%, #8B1874 40%, #DDA448 100%)" }}>

        {/* Decorative blob */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/noise.png')" }} />

        <h2 className="font-display text-3xl md:text-5xl font-black mb-6 text-white relative z-10">
          Ready to Take Control?
        </h2>
        <p className="max-w-xl mx-auto mb-10 text-white/80 relative z-10">
          Join investors using FinTrack to track portfolios, monitor expenses,
          and make smarter financial decisions every day.
        </p>
        <button onClick={() => setShowModal(true)}
          className="relative z-10 px-8 py-4 rounded-xl font-semibold
          bg-white text-lightSecondary dark:text-darkBg
          hover:scale-105 transition shadow-xl">
          Know More
        </button>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="px-8 md:px-16 py-16
        bg-lightBg dark:bg-darkBg
        border-t border-gray-200 dark:border-darkBorder relative z-10">
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <h3 className="font-display text-xl font-black mb-3 text-lightAccent dark:text-darkAccent">FinTrack</h3>
            <p className="text-lightMuted dark:text-gray-400 text-sm leading-relaxed">
              A professional real-time portfolio management and expense tracking platform.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-lightMuted dark:text-gray-400 text-sm">
              {/* About links to developer portfolio */}
              <li>
                <a href="https://yathaartha-github-io.vercel.app/"
                  target="_blank" rel="noreferrer"
                  className="hover:text-lightAccent dark:hover:text-darkAccent transition">
                  About
                </a>
              </li>
              <li className="hover:text-lightAccent dark:hover:text-darkAccent cursor-pointer transition">Privacy</li>
              <li className="hover:text-lightAccent dark:hover:text-darkAccent cursor-pointer transition">Terms</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Contact</h4>
            <ul className="space-y-2 text-lightMuted dark:text-gray-400 text-sm">
              <li>yuvicodes@gmail.com</li>
              <li>+91 7060043489</li>
              <li>India</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Connect</h4>
            <div className="flex gap-4 mb-4 text-lg">
              <a href="https://github.com/Yuvicodes1" target="_blank" rel="noreferrer"
                className="hover:text-lightAccent dark:hover:text-darkAccent transition hover:scale-110">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/yathaartha-srivastava-063758258/" target="_blank" rel="noreferrer"
                className="hover:text-lightAccent dark:hover:text-darkAccent transition hover:scale-110">
                <FaLinkedin />
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer"
                className="hover:text-lightAccent dark:hover:text-darkAccent transition hover:scale-110">
                <FaInstagram />
              </a>
            </div>
            <p className="text-lightMuted dark:text-gray-400 text-sm">Developed by Yuvi</p>
          </div>
        </div>
        <div className="mt-12 pt-6 text-center text-xs
          border-t border-gray-200 dark:border-darkBorder
          text-lightMuted dark:text-gray-500">
          © {new Date().getFullYear()} FinTrack. All rights reserved.
        </div>
      </footer>

      {/* ── MODAL ────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            style={{ animation: "fadeIn 0.2s ease" }}
            onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-[90%] max-w-2xl
            bg-white dark:bg-darkCard text-lightText dark:text-darkText
            rounded-2xl shadow-2xl p-10"
            style={{ animation: "fadeUp 0.3s ease" }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600
              dark:hover:text-gray-200 transition hover:scale-110">
              <FaTimes size={22} />
            </button>
            <h2 className="font-display text-2xl font-black mb-6 pr-8
              text-lightAccent dark:text-darkAccent">
              About FinTrack
            </h2>
            <p className="mb-4 text-lightMuted dark:text-gray-400 leading-relaxed">
              FinTrack is an enterprise-grade portfolio management and expense tracking platform
              delivering real-time stock insights, automated analytics, AI-powered financial advice,
              and historical data visualization.
            </p>
            <p className="mb-6 text-lightMuted dark:text-gray-400 leading-relaxed">
              Built with scalability and performance in mind, it empowers investors
              with intelligent decision-making tools, transparent financial tracking,
              and multi-currency portfolio management.
            </p>
            <div className="flex gap-3">
              <button onClick={() => { setShowModal(false); navigate("/login"); }}
                className="px-6 py-3 rounded-xl font-semibold
                bg-lightAccent text-white dark:bg-darkAccent dark:text-black
                hover:scale-105 transition">
                Get Started
              </button>
              <a href="https://yathaartha-github-io.vercel.app/" target="_blank" rel="noreferrer"
                className="px-6 py-3 rounded-xl font-semibold border
                border-lightAccent dark:border-darkAccent
                text-lightAccent dark:text-darkAccent
                hover:bg-lightAccent/10 transition">
                View Portfolio
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}