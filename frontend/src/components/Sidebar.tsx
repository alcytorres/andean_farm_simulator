import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Dashboard", icon: "📊" },
  { to: "/builder", label: "Scenario Builder", icon: "🔧" },
  { to: "/compare", label: "Compare", icon: "⚖️" },
  { to: "/climate", label: "Climate", icon: "🌦️" },
];

export default function Sidebar() {
  return (
    <aside className="w-56 bg-slate-900 text-white min-h-screen flex flex-col shrink-0">
      <div className="px-5 py-6 border-b border-slate-700">
        <h1 className="text-lg font-bold leading-tight">Hacienda Yerovi</h1>
        <p className="text-xs text-slate-400 mt-1">Farm Simulator</p>
      </div>
      <nav className="flex-1 py-4">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-5 py-3 text-sm transition-colors ${
                isActive
                  ? "bg-slate-800 text-white font-medium border-r-2 border-emerald-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`
            }
          >
            <span className="text-base">{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 border-t border-slate-700 text-xs text-slate-500">
        Cotopaxi, Ecuador · 2,909m
      </div>
    </aside>
  );
}
