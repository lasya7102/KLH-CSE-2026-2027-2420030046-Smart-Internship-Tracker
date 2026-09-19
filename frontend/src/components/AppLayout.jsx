import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useApp } from "../context/AppContext";

const PAGE_TITLES = {
  "/dashboard": ["Dashboard", "Your internship overview"],
  "/internships": ["My Internships", "Track and manage every application"],
  "/internships/add": ["Add Internship", "Log a new application"],
  "/recommendations": ["Recommendations", "Personalized picks based on your skills"],
  "/analytics": ["Analytics", "How your search is trending"],
  "/profile": ["My Profile", "Your details and preferences"],
};

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { dataError, dataLoading, initializing } = useApp();
  const isDetails = location.pathname.startsWith("/internships/") && location.pathname !== "/internships/add";
  const [title, subtitle] = isDetails
    ? ["Internship Details", "Full breakdown of this opportunity"]
    : PAGE_TITLES[location.pathname] || ["SmartIntern", ""];

  return (
    <div className="min-h-screen bg-canvas md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 md:block">
        <div className="fixed h-screen w-64">
          <Sidebar />
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64">
            <Sidebar onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <Navbar onMenuClick={() => setMobileOpen(true)} title={title} subtitle={subtitle} />

        {(initializing || dataLoading) && (
          <div className="flex items-center gap-2 border-b border-line bg-brand-soft/50 px-4 py-2 text-xs font-medium text-brand md:px-8">
            <Loader2 size={14} className="animate-spin" />
            {initializing ? "Signing you back in…" : "Syncing your data…"}
          </div>
        )}

        {dataError && !dataLoading && (
          <div className="flex items-center gap-2 border-b border-line bg-alert-soft px-4 py-2 text-xs font-medium text-alert md:px-8">
            <AlertCircle size={14} />
            {dataError}
          </div>
        )}

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
