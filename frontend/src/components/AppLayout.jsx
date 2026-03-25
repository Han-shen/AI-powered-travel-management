import { motion } from "framer-motion";
import { LayoutDashboard, Luggage, Wallet, FileText, Settings, LogOut } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/trips", label: "Trips", icon: Luggage },
  { to: "/expenses", label: "Expenses", icon: Wallet },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-[240px_1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="mb-6 px-2 text-xl font-semibold">Smart Travel Planner</p>
          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => {
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-2 rounded-2xl px-3 py-2 text-sm transition ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={16} /> {label}
                </NavLink>
              );
            })}
          </nav>
          <button
            onClick={logout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} /> Logout
          </button>
        </aside>
        <main>
          <motion.header
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">Welcome back</p>
            <h1 className="text-2xl font-semibold text-slate-900">{user?.name || "Traveler"}</h1>
          </motion.header>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
