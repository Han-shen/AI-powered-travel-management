import { useMemo, useState } from "react";
import api from "../services/api";
import { useTrips } from "../hooks/useTrips";
import { useSettings } from "../context/SettingsContext";

export default function ExpensesPage() {
  const { trips } = useTrips();
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ amount: "", category: "food", date: "", note: "" });
  const [tripId, setTripId] = useState("");
  const { formatMoney } = useSettings();

  const load = async (id) => {
    setTripId(id);
    if (!id) return setExpenses([]);
    const { data } = await api.get(`/expenses/${id}`);
    setExpenses(data);
  };

  const add = async (e) => {
    e.preventDefault();
    await api.post("/expenses", { ...form, amount: Number(form.amount), trip_id: tripId });
    setForm({ amount: "", category: "food", date: "", note: "" });
    load(tripId);
  };

  const total = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses]);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Expense Tracker</h2>
        <select className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" value={tripId} onChange={(e) => load(e.target.value)}>
          <option value="">Select trip</option>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
        <form onSubmit={add} className="mt-4 grid gap-3">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Note" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />

          <button disabled={!tripId} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white disabled:opacity-40">Add Expense</button>
        </form>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm text-slate-500">Budget vs Actual</p>
        <p className="mt-2 text-3xl font-semibold">{formatMoney(total)}</p>
        <div className="mt-4 space-y-2">
          {expenses.map((e) => (
            <div key={e.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
              <p className="font-medium">{formatMoney(e.amount)} - {e.category}</p>
              <p className="text-slate-500">{e.date}</p>
              {e.note && (
                <p className="text-slate-400 text-xs">{e.note}</p>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
