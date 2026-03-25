import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16">
      <div className="mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-10 shadow-sm md:p-16">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-slate-500">
          AI-powered travel management
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 max-w-3xl text-4xl font-semibold leading-tight text-slate-900 md:text-6xl"
        >
          Plan smarter trips with one minimal, elegant workspace.
        </motion.h1>
        <p className="mt-6 max-w-2xl text-slate-600">
          Organize itineraries, expenses, documents, and smart suggestions in one seamless travel assistant.
        </p>
        <div className="mt-10 flex gap-4">
          <Link to="/auth" className="rounded-2xl bg-slate-900 px-6 py-3 text-sm text-white shadow-sm">
            Start Planning
          </Link>
          <a href="#features" className="rounded-2xl border border-slate-200 px-6 py-3 text-sm text-slate-700">
            Explore Features
          </a>
        </div>
      </div>
    </div>
  );
}
