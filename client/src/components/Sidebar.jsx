import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  RiDashboardLine, RiFolderLine, RiTaskLine,
  RiLogoutBoxLine, RiUserLine, RiShieldLine,
} from 'react-icons/ri';
import { HiSparkles } from 'react-icons/hi2';

const navItems = [
  { to: '/dashboard', icon: RiDashboardLine, label: 'Dashboard' },
  { to: '/projects',  icon: RiFolderLine,    label: 'Projects' },
  { to: '/tasks',     icon: RiTaskLine,       label: 'Tasks' },
];

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-200">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center">
          <HiSparkles className="text-white text-sm" />
        </div>
        <span className="font-bold text-gray-900 tracking-tight">TaskFlow</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => isActive ? 'sidebar-link-active' : 'sidebar-link'}
          >
            <Icon className="text-lg flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <div className="flex items-center gap-1">
              {isAdmin ? (
                <RiShieldLine className="text-primary-600 text-xs" />
              ) : (
                <RiUserLine className="text-gray-400 text-xs" />
              )}
              <span className="text-xs text-gray-500">{user?.role}</span>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:text-red-600 hover:bg-red-50">
          <RiLogoutBoxLine className="text-lg" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
