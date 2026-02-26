import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import API from "../services/Api";

export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", label: "Indian Rupee (₹)", locale: "en-IN" },
  USD: { code: "USD", symbol: "$", label: "US Dollar ($)",     locale: "en-US" },
  EUR: { code: "EUR", symbol: "€", label: "Euro (€)",          locale: "de-DE" },
};

// Fallback rates in case API is unreachable
const FALLBACK_RATES = { USD: 1, INR: 84, EUR: 0.92 };

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const { user, authLoading } = useAuth();
  const [currency, setCurrencyState] = useState("INR");
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [currencyLoading, setCurrencyLoading] = useState(true);

  // ── On login: fetch saved preference + live exchange rates ───────────────
  useEffect(() => {
    if (authLoading) return;
    if (!user) { setCurrencyLoading(false); return; }

    const init = async () => {
      try {
        // Fetch user's saved preference and live rates in parallel
        const [settingsRes, ratesRes] = await Promise.all([
          API.get(`/users/${user.uid}/settings`),
          API.get("/market/rates"),
        ]);

        setCurrencyState(settingsRes.data.preferredCurrency || "INR");
        setRates(ratesRes.data.rates || FALLBACK_RATES);
      } catch (err) {
        console.error("Currency init failed:", err);
        // Keep fallback rates and default currency
      } finally {
        setCurrencyLoading(false);
      }
    };

    init();
  }, [user, authLoading]);

  // ── Save preference to DB and update local state ──────────────────────────
  const setCurrency = async (newCurrency) => {
    if (!CURRENCIES[newCurrency]) return;
    try {
      await API.put(`/users/${user.uid}/settings`, {
        preferredCurrency: newCurrency,
      });
      setCurrencyState(newCurrency);
    } catch (err) {
      console.error("Failed to save currency preference:", err);
    }
  };

  /**
   * Converts a USD amount to the current display currency.
   * @param {number} usdAmount
   * @returns {number}
   */
  const convert = useCallback(
    (usdAmount) => {
      const rate = rates[currency] ?? 1;
      return parseFloat((usdAmount * rate).toFixed(2));
    },
    [currency, rates]
  );

  /**
   * Formats a USD amount into the display currency string.
   * e.g. convert + format in one call.
   * @param {number} usdAmount
   * @returns {string}
   */
  const format = useCallback(
    (usdAmount) => {
      const converted = convert(usdAmount);
      const meta = CURRENCIES[currency] ?? CURRENCIES.INR;
      return new Intl.NumberFormat(meta.locale, {
        style: "currency",
        currency: meta.code,
        maximumFractionDigits: 2,
      }).format(converted);
    },
    [convert, currency]
  );

  const currencyMeta = CURRENCIES[currency] ?? CURRENCIES.INR;

  return (
    <CurrencyContext.Provider
      value={{ currency, currencyMeta, rates, setCurrency, convert, format, currencyLoading }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}