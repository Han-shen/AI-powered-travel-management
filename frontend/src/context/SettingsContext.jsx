import { createContext, useContext, useEffect, useMemo, useState } from "react";

const SettingsContext = createContext(null);

const VALID_CURRENCIES = ["INR", "USD", "EUR"];

export function SettingsProvider({ children }) {
  const [currency, setCurrency] = useState("INR");

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("settings") || "null");
      if (saved?.currency && VALID_CURRENCIES.includes(saved.currency)) {
        setCurrency(saved.currency);
      }
    } catch {
      // ignore localStorage parse errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("settings", JSON.stringify({ currency }));
    } catch {
      // ignore localStorage write errors
    }
  }, [currency]);

  const formatMoney = useMemo(() => {
    return (amount, cur = currency) => {
      const num = typeof amount === "number" ? amount : Number(amount);
      if (!Number.isFinite(num)) return "—";
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency: cur,
        }).format(num);
      } catch {
        return `${num} ${cur}`;
      }
    };
  }, [currency]);

  return (
    <SettingsContext.Provider value={{ currency, setCurrency, formatMoney }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}

