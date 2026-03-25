import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    const email = form.email.trim();
    const password = form.password;
    if (!email) {
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && !form.name.trim()) {
      setError("Enter your name.");
      return;
    }
    try {
      if (mode === "signup") await signup({ ...form, email, password });
      else await login({ ...form, email, password });
      navigate("/dashboard");
    } catch (err) {
      const d = err?.response?.data?.detail;
      const msg = Array.isArray(d)
        ? d.map((x) => x.msg || x).join(" ")
        : typeof d === "string"
          ? d
          : "Authentication failed";
      setError(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="mt-1 text-sm text-slate-500">Your personal travel assistant.</p>
        {mode === "signup" && (
          <input
            className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        )}
        <input
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          className="mt-3 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:ring"
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        {error && <p className="mt-3 text-sm text-rose-500">{error}</p>}
        <button className="mt-5 w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white">
          {mode === "login" ? "Login" : "Sign up"}
        </button>
        <button
          type="button"
          className="mt-3 w-full text-sm text-slate-600"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </form>
    </div>
  );
}
