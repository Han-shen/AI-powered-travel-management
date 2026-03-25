import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSettings } from "../context/SettingsContext";

function isValidEmail(email) {
  // Simple email validation for UI; backend/auth should still be authoritative.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:bg-slate-50"
      aria-pressed={checked}
    >
      <span className="text-slate-800">{label}</span>
      <span
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
          checked ? "bg-slate-900" : "bg-slate-200"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </span>
    </button>
  );
}

export default function SettingsPage() {
  const { user } = useAuth();
  const { currency, setCurrency } = useSettings();

  const settingsKey = useMemo(() => {
    const uid = user?.id || "anon";
    return `smart_travel_settings_${uid}`;
  }, [user?.id]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    trip: true,
    checkin: true,
    schedule: true,
  });
  const [offlineMode, setOfflineMode] = useState(true);

  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Pre-fill from auth first
    if (user?.name) setName(user.name);
    if (user?.email) setEmail(user.email);

    // Then overlay saved settings
    try {
      const raw = localStorage.getItem(settingsKey);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.name === "string") setName(parsed.name);
      if (typeof parsed?.email === "string") setEmail(parsed.email);
      if (parsed?.notifications) {
        setNotifications({
          trip: !!parsed.notifications.trip,
          checkin: !!parsed.notifications.checkin,
          schedule: !!parsed.notifications.schedule,
        });
      }
      if (typeof parsed?.offlineMode === "boolean") setOfflineMode(parsed.offlineMode);
    } catch {
      // Ignore parse failures; fall back to auth defaults.
    }
  }, [settingsKey, user?.email, user?.name]);

  const save = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("Profile name cannot be empty.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    const payload = {
      name: trimmedName,
      email: trimmedEmail,
      notifications,
      offlineMode,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(settingsKey, JSON.stringify(payload));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">Edit your details. Stored locally for the demo MVP.</p>

        <div className="mt-5 grid gap-3">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Profile Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-600">Email</label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
              placeholder="you@example.com"
              type="email"
              inputMode="email"
            />
          </div>
        </div>

        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        {saved && <p className="mt-4 text-sm text-emerald-700">Saved.</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-sm"
        >
          Save Settings
        </button>
      </form>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Preferences</h2>
        <p className="mt-1 text-sm text-slate-500">Currency, notifications, and offline caching toggle.</p>

        <div className="mt-5 grid gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-600">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 outline-none focus:ring"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div className="grid gap-3">
            <Toggle
              checked={notifications.trip}
              onChange={(v) => setNotifications((p) => ({ ...p, trip: v }))}
              label="Trip reminders"
            />
            <Toggle
              checked={notifications.checkin}
              onChange={(v) => setNotifications((p) => ({ ...p, checkin: v }))}
              label="Check-in alerts"
            />
            <Toggle
              checked={notifications.schedule}
              onChange={(v) => setNotifications((p) => ({ ...p, schedule: v }))}
              label="Schedule alerts"
            />
          </div>

          <div className="mt-1">
            <Toggle
              checked={offlineMode}
              onChange={setOfflineMode}
              label="Offline Mode (enable caching)"
            />
            <p className="mt-2 text-xs text-slate-500">
              This MVP stores the toggle only. Offline caching can be added next using IndexedDB + sync.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
