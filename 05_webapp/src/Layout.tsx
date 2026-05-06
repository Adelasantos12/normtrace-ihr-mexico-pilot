import { } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Search, BookOpen, Users,
  Map, FileText, Globe, Shield, Info, AlertCircle, FileBarChart
} from 'lucide-react';
import { cn } from './lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/mapping', label: 'IHR Mapping', icon: Search },
  { path: '/provisions', label: 'Legal Provisions', icon: BookOpen },
  { path: '/actors', label: 'Actors Explorer', icon: Users },
  { path: '/gap-map', label: 'Implementation Gap Map', icon: Map },
  { path: '/snapshot', label: 'Country Snapshot', icon: FileText },
  { path: '/international', label: 'International Instruments', icon: Globe },
  { path: '/methodology', label: 'Methodology', icon: Shield },
  { path: '/report', label: 'Report & Citation', icon: FileBarChart },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar - hidden in print */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 print:hidden">
        <div className="p-8 border-b border-slate-100 bg-white">
          <h2 className="text-xl font-black text-blue-900 tracking-tight">NormTrace-IHR</h2>
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
           <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] font-bold text-amber-800 uppercase tracking-tight leading-tight">
                 Preliminary Expert Review
              </p>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-12 min-h-screen print:m-0 print:p-0 print:bg-white print:ml-0">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
