import { NavLink, Outlet } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  Search,
  BookOpen,
  Users,
  Map,
  Globe,
  FileText,
  Shield,
  Download,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mapping", icon: Search, label: "IHR Mapping" },
  { to: "/provisions", icon: BookOpen, label: "Legal Provisions" },
  { to: "/actors", icon: Users, label: "Actors Explorer" },
  { to: "/gap-map", icon: Map, label: "Implementation Gap Map" },
  { to: "/instruments", icon: Globe, label: "International Instruments" },
  { to: "/snapshot", icon: FileText, label: "Country Snapshot" },
  { to: "/entry-points", icon: FileText, label: "Entry Points" },
  { to: "/methodology", icon: Shield, label: "Methodology" },
  { to: "/downloads", icon: Download, label: "Downloads" },
];

export function Layout() {
  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-xl font-bold text-blue-900 tracking-tight">NormTrace-IHR</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">Mexico Pilot v0.1</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 bg-amber-50">
          <div className="flex gap-2 items-start text-amber-800">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <div className="text-[10px] leading-tight">
              <strong>PRELIMINARY DATA</strong>
              <br />Requires expert review.
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>

        {/* Footer Disclaimers */}
        <footer className="bg-white border-t border-slate-200 p-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 gap-4 text-[10px] text-slate-500 uppercase tracking-wide">
            <div>
              • Preliminary legal-institutional mapping<br />
              • Does not assess legal compliance<br />
              • Not legal advice
            </div>
            <div className="text-right">
              • All preliminary_ai_assisted rows require review<br />
              • PABS information is provisional<br />
              • RISS 2025 currency verification pending
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
