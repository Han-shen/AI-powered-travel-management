import { useState } from "react";
import api from "../services/api";
import { useTrips } from "../hooks/useTrips";
import axios from "axios";

export default function DocumentsPage() {
  const { trips } = useTrips();
  const [tripId, setTripId] = useState("");
  const [tag, setTag] = useState("ticket");
  const [file, setFile] = useState(null);
  const [docs, setDocs] = useState([]);

  const loadDocs = async (id) => {
    setTripId(id);
    if (!id) return setDocs([]);
    const { data } = await api.get(`/documents/${id}`);
    setDocs(data);
  };

  const upload = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append("trip_id", tripId);
    form.append("tag", tag);
    form.append("file", file);
    await api.post("/documents", form);
    loadDocs(tripId);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Document Storage</h2>
        <select className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" value={tripId} onChange={(e) => loadDocs(e.target.value)}>
          <option value="">Select trip</option>
          {trips.map((t) => <option key={t.id} value={t.id}>{t.destination}</option>)}
        </select>
        <form onSubmit={upload} className="mt-4 grid gap-3">
          <input className="rounded-2xl border border-slate-200 px-4 py-3" placeholder="Tag (ticket, hotel, id)" value={tag} onChange={(e) => setTag(e.target.value)} />
          <input className="rounded-2xl border border-slate-200 px-4 py-3" type="file" onChange={(e) => setFile(e.target.files?.[0])} />
          <button disabled={!tripId || !file} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white disabled:opacity-40">Upload</button>
        </form>
      </section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Uploaded Documents</h3>
        <div className="mt-4 space-y-2">
          {docs.map((doc) => (
            <a
              key={doc.id}
              href={`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/documents/download/${doc.id}`}
              className="block rounded-2xl border border-slate-200 p-3 text-sm hover:bg-slate-50"
            >
              {doc.original_name} ({doc.tag})
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
