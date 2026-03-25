import { useMemo, useState } from "react";
import api from "../services/api";
import { useTrips } from "../hooks/useTrips";

const initialForm = { destination: "", start_date: "", end_date: "", travelers: "", notes: "", budget: "" };

export default function TripsPage() {
  const { trips, fetchTrips } = useTrips();
  const [form, setForm] = useState(initialForm);
  const [aiInput, setAiInput] = useState({ destination: "", days: 3, interests: "food, culture" });
  const [aiPlan, setAiPlan] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [itemForm, setItemForm] = useState({ day: 1, time: "", location: "", description: "" });
  const [error, setError] = useState("");

  const selectedTrip = useMemo(() => trips[0], [trips]);
  const canAddTrip =
    form.destination.trim().length > 0 &&
    form.start_date &&
    form.end_date &&
    Number(form.travelers) > 0;

  const canAddItineraryItem =
    !!selectedTrip &&
    Number(itemForm.day) > 0 &&
    itemForm.time.trim().length > 0 &&
    itemForm.location.trim().length > 0 &&
    itemForm.description.trim().length > 0;

  const loadItinerary = async (tripId) => {
    setError("");
    try {
      const { data } = await api.get(`/itinerary/${tripId}`);
      setItinerary(data);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to load itinerary";
      setError(Array.isArray(msg) ? msg.join(" ") : msg);
    }
  };

  const addTrip = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/trips", {
        ...form,
        travelers: Number(form.travelers),
        budget: Number(form.budget),
      });
      setForm(initialForm);
      await fetchTrips();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to add trip";
      setError(Array.isArray(msg) ? msg.join(" ") : msg);
    }
  };

  const removeTrip = async (id) => {
    setError("");
    try {
      await api.delete(`/trips/${id}`);
      await fetchTrips();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to delete trip";
      setError(Array.isArray(msg) ? msg.join(" ") : msg);
    }
  };

  const addItineraryItem = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;
    setError("");
    try {
      await api.post("/itinerary", {
        trip_id: selectedTrip.id,
        day: Number(itemForm.day),
        time: itemForm.time,
        location: itemForm.location,
        description: itemForm.description,
      });
      setItemForm({ day: 1, time: "", location: "", description: "" });
      loadItinerary(selectedTrip.id);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Failed to add itinerary item";
      setError(Array.isArray(msg) ? msg.join(" ") : msg);
    }
  };

  const generate = async () => {
    const { data } = await api.post("/trips/generate-itinerary", {
      destination: aiInput.destination,
      days: Number(aiInput.days),
      interests: aiInput.interests.split(",").map((v) => v.trim()),
    });
    setAiPlan(data.plan);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Create Trip</h2>
        <form onSubmit={addTrip} className="mt-4 grid gap-3">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Destination" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <input type="date" className="rounded-2xl border border-slate-200 px-4 py-3" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
            <input type="date" className="rounded-2xl border border-slate-200 px-4 py-3" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </div>
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Travelers" value={form.travelers} onChange={(e) => setForm({ ...form, travelers: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Budget" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
          <textarea className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button disabled={!canAddTrip} type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white disabled:opacity-40">
            Add Trip
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Your Trips</h2>
        <div className="mt-4 space-y-3">
          {trips.map((trip) => (
            <div key={trip.id} className="flex items-center justify-between rounded-2xl border border-slate-200 p-3">
              <div>
                <p className="font-medium text-slate-900">{trip.destination}</p>
                <p className="text-sm text-slate-500">{trip.start_date} to {trip.end_date}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => loadItinerary(trip.id)} className="text-sm text-slate-600">Plan Day</button>
                <button onClick={() => removeTrip(trip.id)} className="text-sm text-rose-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold">AI Itinerary Generator</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border border-slate-200 px-4 py-3 md:col-span-2" placeholder="Destination" value={aiInput.destination} onChange={(e) => setAiInput({ ...aiInput, destination: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Days" value={aiInput.days} onChange={(e) => setAiInput({ ...aiInput, days: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Interests (comma)" value={aiInput.interests} onChange={(e) => setAiInput({ ...aiInput, interests: e.target.value })} />
        </div>
        <button className="mt-3 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white" onClick={generate}>Generate</button>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {aiPlan.map((day) => (
            <div key={day.day} className="rounded-2xl border border-slate-200 p-3">
              <p className="font-medium">Day {day.day}</p>
              {day.items.map((item) => (
                <p key={`${day.day}-${item.time}`} className="mt-1 text-sm text-slate-600">{item.time} - {item.description}</p>
              ))}
            </div>
          ))}
        </div>
        {!selectedTrip && <p className="mt-4 text-sm text-slate-500">Create a trip to start itinerary and budget modules.</p>}
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <h2 className="text-lg font-semibold">Day-wise Itinerary Planner</h2>
        <form onSubmit={addItineraryItem} className="mt-4 grid gap-3 md:grid-cols-4">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="number" placeholder="Day" value={itemForm.day} onChange={(e) => setItemForm({ ...itemForm, day: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Time" value={itemForm.time} onChange={(e) => setItemForm({ ...itemForm, time: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Location" value={itemForm.location} onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Description" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
          <button disabled={!canAddItineraryItem} type="submit" className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white disabled:opacity-40 md:col-span-4">
            Add Itinerary Item
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {itinerary.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 p-3">
              <p className="text-sm font-medium">Day {item.day} - {item.time}</p>
              <p className="text-sm text-slate-700">{item.location}</p>
              <p className="text-sm text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
