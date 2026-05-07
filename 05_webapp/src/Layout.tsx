import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Search, BookOpen, Users,
  Map, FileText, Globe, Shield, Info, AlertCircle, FileBarChart, X
} from 'lucide-react';
import { cn } from './lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/mapping', label: 'IHR Mapping', icon: Search },
  { path: '/provisions', label: 'Legal Provisions', icon: BookOpen },
  { path: '/actors', label: 'Actors Explorer', icon: Users },
  { path: '/gap-map', label: 'Implementation Gap Map', icon: Map },
  { path: '/snapshot', label: 'Country Snapshot', icon: FileText },
  { path: '/capacity', label: 'Capacity Brief', icon: Info },
  { path: '/international', label: 'International Instruments', icon: Globe },
  { path: '/methodology', label: 'Methodology', icon: Shield },
  { path: '/report', label: 'Report & Citation', icon: FileBarChart },
];

export default function Layout() {
  const [showCaveat, setShowCaveat] = useState(false);
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - hidden in print */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 print:hidden">
        <div className="p-8 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black text-[#0f172a] tracking-tight">NormTrace-IHR</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Mexico Pilot v0.1</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavLink
            to="/"
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
              isActive ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Home size={18} /> Home
          </NavLink>

          <div className="pt-4 pb-2 px-4">
             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Layers</span>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200",
                isActive ? "bg-blue-50 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={18} /> {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <button
             onClick={() => setShowCaveat(true)}
             className="w-full p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 hover:bg-amber-100 transition-colors text-left"
           >
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-800 uppercase tracking-tight leading-tight">
                 Preliminary Expert Review <br/>
                 <span className="text-amber-600 font-normal mt-1 block">View Legal Caveats</span>
              </p>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12 min-h-screen print:m-0 print:p-0 print:bg-white print:ml-0">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>

      {/* Caveat Modal */}
      {showCaveat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
              <div className="flex items-center gap-3 text-amber-900 font-bold text-sm uppercase tracking-wider">
                <div className="w-8 h-8 bg-amber-200/50 rounded-full flex items-center justify-center">
                  <AlertCircle size={18} className="text-amber-700" />
                </div>
                Legal-Institutional Caveats
              </div>
              <button
                onClick={() => setShowCaveat(false)}
                className="text-amber-800 hover:bg-amber-200 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6 text-sm text-slate-700 leading-relaxed">
              <div className="space-y-4">
                <p className="font-bold text-slate-900">NormTrace-IHR Mexico Pilot v0.1</p>
                <p>
                  This application provides a structural mapping of domestic legal anchoring for international health obligations.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Not a compliance assessment: Measures anchoring, not performance.",
                  "Not legal advice: Provided for research and policy analysis.",
                  "Validation pending: Mapping requires expert legal review.",
                  "Preliminary AI-assisted: Rows marked as such require human expert review.",
                  "RISS 2025: Currency and source verification remains a review item.",
                  "PABS: Information is provisional pending final instrument annexes."
                ].map((text, i) => (
                  <li key={i} className="flex gap-3">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowCaveat(false)}
                className="px-8 py-3 bg-[#0f172a] text-white rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
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
