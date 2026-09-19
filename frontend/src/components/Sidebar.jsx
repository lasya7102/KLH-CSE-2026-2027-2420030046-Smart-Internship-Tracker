import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Briefcase,
  Target,
  BarChart3,
  User,
  Settings,
  LogOut,
  Compass,
} from "lucide-react";
import { useApp } from "../context/AppContext";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/internships", label: "My Internships", icon: Briefcase },
  { to: "/recommendations", label: "Recommendations", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/profile", label: "My Profile", icon: User },
];

export default function Sidebar({ onNavigate }) {
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-full flex-col bg-ink text-canvas/90">
      <div className="flex items-center gap-2.5 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white">
          <Compass size={18} strokeWidth={2.2} />
        </div>
        <span className="font-display text-lg font-bold text-white">SmartIntern</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-canvas/60 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={18} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1 border-t border-white/10 px-3 py-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-canvas/60 transition-colors hover:bg-white/5 hover:text-white">
          <Settings size={18} strokeWidth={2} />
          Settings
        </button>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-canvas/60 transition-colors hover:bg-alert/20 hover:text-alert"
        >
          <LogOut size={18} strokeWidth={2} />
          Logout
        </button>
      </div>
    </div>
  );
}
