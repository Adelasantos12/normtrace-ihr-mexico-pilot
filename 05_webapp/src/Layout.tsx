import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Home, LayoutDashboard, Search, BookOpen,
  Map, FileText, Globe, Shield, Info, AlertCircle, FileBarChart, X, Menu,
  Zap, Layers, Activity, Scale, ChevronDown, Share2
} from 'lucide-react';
import { cn } from './lib/utils';
import { PreliminaryBanner } from './components/PreliminaryBanner';

// Phase 3-UX: five core sections up front (Home + these four), everything
// else demoted to a collapsed "Advanced" group rather than a flat list of
// 15 top-level links.
const coreItems = [
  { path: '/actors', label: 'Traceability Network', icon: Share2 },
  { path: '/spar-bridge', label: 'SPAR ↔ Legal', icon: Scale },
  { path: '/mapping', label: 'Mapping Explorer', icon: Search },
  { path: '/methodology', label: 'Methodology & Limitations', icon: Shield },
];

const advancedItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/snapshot', label: 'Country Snapshot', icon: FileText },
  { path: '/pipeline', label: 'Normative Pipeline', icon: Zap },
  { path: '/normative-hierarchy', label: 'Normative Hierarchy', icon: Layers },
  { path: '/norm-diagnostic', label: 'Norm Diagnostic', icon: Activity },
  { path: '/political-brain', label: 'Political Brain', icon: Scale },
  { path: '/provisions', label: 'Legal Provisions', icon: BookOpen },
  { path: '/gap-map', label: 'Implementation Gap Map', icon: Map },
  { path: '/capacity', label: 'Capacity Brief', icon: Info },
  { path: '/international', label: 'International Instruments', icon: Globe },
  { path: '/report', label: 'Report & Citation', icon: FileBarChart },
];

function NavItem({ path, label, icon: Icon }: { path: string; label: string; icon: any }) {
  return (
    <NavLink
      to={path}
      className={({ isActive }) => cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
        isActive ? "bg-slate-800 text-sky-400" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      )}
    >
      <Icon size={18} /> {label}
    </NavLink>
  );
}

export default function Layout() {
  const [showCaveat, setShowCaveat] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(() =>
    advancedItems.some((item) => item.path === location.pathname)
  );

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 font-sans relative">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-30">
         <div className="flex flex-col">
            <h2 className="font-bold text-sky-400 tracking-tight text-sm leading-tight">NormTrace-IHR</h2>
            <p className="text-[7px] text-slate-500 font-mono">DOI: 10.5281/zenodo.20085170</p>
         </div>
         <button
           onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
           className="p-2 text-slate-300 hover:bg-slate-800 rounded-lg transition-colors"
         >
           {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
         </button>
      </header>

      {/* Sidebar Overlay for Mobile — starts below the header so the close button stays visible */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-x-0 top-16 bottom-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 border-r border-slate-800 flex flex-col fixed inset-y-0 z-50 print:hidden transition-transform duration-300 ease-in-out lg:translate-x-0 lg:w-64",
        isMobileMenuOpen ? "translate-x-0 w-72" : "-translate-x-full w-64"
      )}>
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-sky-400 tracking-tight">NormTrace-IHR</h2>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.2em] mt-1">Mexico Pilot v0.1</p>
          <p className="text-[8px] text-slate-600 font-mono mt-2">DOI: 10.5281/zenodo.20085170</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          <NavItem path="/" label="Home" icon={Home} />

          <div className="pt-4 pb-2 px-4">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Core</span>
          </div>
          {coreItems.map((item) => <NavItem key={item.path} {...item} />)}

          <button
            onClick={() => setIsAdvancedOpen((v) => !v)}
            className="w-full flex items-center justify-between pt-4 pb-2 px-4 text-left"
          >
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
              Advanced ({advancedItems.length})
            </span>
            <ChevronDown size={12} className={cn("text-slate-500 transition-transform", isAdvancedOpen && "rotate-180")} />
          </button>
          {isAdvancedOpen && advancedItems.map((item) => <NavItem key={item.path} {...item} />)}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <PreliminaryBanner variant="sidebar" onClick={() => setShowCaveat(true)} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 lg:ml-64 p-6 md:p-12 mt-16 lg:mt-0 min-h-screen print:m-0 print:p-0 print:bg-white print:ml-0">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Outlet />
        </div>
      </main>

      {/* Caveat Modal */}
      {showCaveat && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
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
                className="px-8 py-3 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-blue-800 transition-all active:scale-95"
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
