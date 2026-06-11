import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, Zap, User } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              Task<span className="text-indigo-400">Flow</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>

            {/* User info */}
            <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-700">
              <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-800/50">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white leading-none">{user?.name}</p>
                  <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
