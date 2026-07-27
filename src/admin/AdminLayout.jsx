import { useEffect, useState, useRef } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { clearToken, isLoggedIn } from './useAdmin';
import {
  FiPackage, FiMessageSquare, FiLogOut, FiGrid,
  FiSettings, FiUsers, FiClock, FiBell, FiMenu, FiX, FiLayers, FiInbox,
} from 'react-icons/fi';

const NAV_ITEMS = [
  { to: '/admin/products',      icon: FiPackage,     label: 'Products' },
  { to: '/admin/leads',         icon: FiInbox,       label: 'Leads' },
  { to: '/admin/categories',    icon: FiLayers,      label: 'Categories' },
  { to: '/admin/prompt',        icon: FiMessageSquare, label: 'AI Prompt' },
  { to: '/admin/chats',         icon: FiUsers,       label: 'Chats' },
  // Hidden (not deleted): free-form posters only reach people inside WhatsApp's
  // 24h window, so broadcasting needs an approved template first.
  // { to: '/admin/announcements', icon: FiBell,        label: 'Announcements' },
  { to: '/admin/cron',          icon: FiClock,       label: 'Cron' },
  { to: '/admin/settings',      icon: FiSettings,    label: 'Settings' },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(false);
  const hoverTimer = useRef(null);

  useEffect(() => {
    if (!isLoggedIn()) navigate('/admin/login');
  }, [navigate]);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const logout = () => { clearToken(); navigate('/admin/login'); };

  // Desktop hover handlers with small delay to avoid flicker
  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setDesktopExpanded(true), 80);
  };
  const handleMouseLeave = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setDesktopExpanded(false), 120);
  };

  const navCls = ({ isActive }, expanded) =>
    `flex items-center rounded-lg transition-all duration-150 overflow-hidden whitespace-nowrap
     ${expanded ? 'gap-3 px-4 py-2.5' : 'justify-center px-0 py-2.5 w-full'}
     ${isActive
       ? 'bg-[#1a5c2a] text-white font-semibold'
       : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`;

  const mobileNavCls = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition
     ${isActive ? 'bg-[#1a5c2a] text-white font-semibold' : 'text-gray-700 hover:bg-gray-100'}`;

  // ── Sidebar content (shared between mobile and desktop) ───────────────────
  const SidebarContent = ({ expanded, onClose }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center mb-8 overflow-hidden transition-all duration-200 ${expanded ? 'gap-3 px-3' : 'justify-center px-0'}`}>
        <img src="/logo.png" alt="MLV" className="w-9 h-9 object-contain flex-shrink-0" />
        {expanded && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-900 leading-tight">MLV Enterprises</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-widest">Admin Panel</div>
          </div>
        )}
        {onClose && (
          <button onClick={onClose} className="ml-auto text-gray-400 hover:text-gray-600 p-1">
            <FiX size={18} />
          </button>
        )}
      </div>

      {/* Nav links — scrollable if content overflows */}
      <nav className="flex flex-col gap-1 flex-1 overflow-y-auto min-h-0">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={(state) => navCls(state, expanded)}>
            <Icon size={17} className="flex-shrink-0" />
            {expanded && <span className="text-sm">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* View Site + Logout — always pinned at the bottom */}
      <div className="flex flex-col gap-1 mt-4 pt-4 border-t border-gray-100 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className={`flex items-center rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150
            ${expanded ? 'gap-3 px-4 py-2.5' : 'justify-center px-0 py-2.5 w-full'}`}
        >
          <FiGrid size={17} className="flex-shrink-0" />
          {expanded && <span className="text-sm">View Site</span>}
        </a>
        <button
          onClick={logout}
          className={`flex items-center rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150
            ${expanded ? 'gap-3 px-4 py-2.5' : 'justify-center px-0 py-2.5 w-full'}`}
        >
          <FiLogOut size={17} className="flex-shrink-0" />
          {expanded && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── DESKTOP SIDEBAR (lg+) — hover to expand ── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`hidden lg:flex flex-col shrink-0 bg-white border-r border-gray-200 py-6 transition-all duration-200 ease-in-out overflow-hidden
          ${desktopExpanded ? 'w-60 px-3' : 'w-[60px] px-2'}`}
      >
        <SidebarContent expanded={desktopExpanded} />
      </aside>

      {/* ── MOBILE OVERLAY SIDEBAR ── */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 bg-white h-full flex flex-col py-6 px-3 shadow-xl z-10">
            <SidebarContent expanded={true} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <FiMenu size={20} />
          </button>
          <img src="/logo.png" alt="MLV" className="w-7 h-7 object-contain" />
          <span className="text-sm font-bold text-gray-900">MLV Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
