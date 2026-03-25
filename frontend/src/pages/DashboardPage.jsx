import { useEffect, useState } from "react";
import api from "../services/api";
import { useSettings } from "../context/SettingsContext";
import { useTrips } from "../hooks/useTrips";
export default function DashboardPage() {
  const { trips } = useTrips();
  const [totalExpense, setTotalExpense] = useState(0);
  const { formatMoney } = useSettings();
  useEffect(() => {
    const fetchExpenses = async () => {
      const allExpenses = await Promise.all(
        trips.map(async (trip) => {
          const { data } = await api.get(`/expenses/${trip.id}`);
          return data;
        })
      );
      const total = allExpenses.flat().reduce((sum, e) => sum + e.amount, 0);
      setTotalExpense(total);
    };
    if (trips.length) fetchExpenses();
  }, [trips]);
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Upcoming Trips" value={trips.length} />
      <Card title="Total Expenses" value={formatMoney(totalExpense)} />
      <Card title="Recent Activity" value={`${Math.min(trips.length * 2, 12)} updates`} />
    </div>
  );
}
function Card({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}