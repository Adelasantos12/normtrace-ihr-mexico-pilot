import { useState } from 'react';
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
  FileSignature,
  AlertCircle,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/mapping", icon: Search, label: "IHR Mapping" },
  { to: "/provisions", icon: BookOpen, label: "Legal Provisions" },
  { to: "/actors", icon: Users, label: "Actors Explorer" },
  { to: "/gap-map", icon: Map, label: "Implementation Gap Map" },
  { to: "/snapshot", icon: FileText, label: "Country Snapshot" },
  { to: "/instruments", icon: Globe, label: "International Instruments" },
  { to: "/methodology", icon: Shield, label: "Methodology" },
  { to: "/report", icon: FileSignature, label: "Report & Citation" },
];

export function Layout() {
  const [showCaveat, setShowCaveat] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans print:block print:bg-white">
      {/* Sidebar - Hidden on print */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 print:hidden">
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

        {/* Persistent Badge */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => setShowCaveat(true)}
            className="w-full flex items-center gap-2 px-3 py-2 bg-amber-50 text-amber-800 rounded-md text-[10px] font-bold uppercase tracking-wider hover:bg-amber-100 transition-colors"
          >
            <AlertCircle size={14} />
            Preliminary Expert Review
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:h-auto">
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Caveat Modal */}
      {showCaveat && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm uppercase tracking-wider">
                <AlertCircle size={18} />
                Preliminary Legal-Institutional Mapping
              </div>
              <button onClick={() => setShowCaveat(false)} className="text-amber-800 hover:bg-amber-200 p-1 rounded">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
              <p>
                This analysis is part of the <strong>NormTrace-IHR Mexico Pilot v0.1</strong>. It is a preliminary legal-institutional mapping based on Mexico's specific domestic legal architecture.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Not a compliance assessment:</strong> This tool maps institutional anchoring, not legal compliance or implementation performance.</li>
                <li><strong>Not legal advice:</strong> These findings are for policy and research purposes only.</li>
                <li><strong>Validation pending:</strong> Many findings carry an "Expert review pending" status and require validation by Mexican legal experts.</li>
              </ul>
              <div className="pt-2 text-xs text-slate-500 italic">
                RISS 2025 currency verification remains a substantive review item. PABS-related information is provisional and depends on the final annex.
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowCaveat(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
