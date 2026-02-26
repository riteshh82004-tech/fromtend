import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, ShoppingBag, Settings, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export const Header: React.FC = () => {
  const { user, currentRole, switchRole } = useAuthStore();
  const location = useLocation();

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/dashboard' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'shop', label: 'Shop & Knowledge', icon: ShoppingBag, path: '/shop' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
            <img src='/Square-icon.jpg'/>
          </div>
          <h1 className="text-xl font-bold text-gray-800">BioMatrix</h1>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            
            return (
              <Link key={tab.id} to={tab.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative px-4 py-2 rounded-xl font-medium transition-all duration-200
                    ${isActive 
                      ? 'text-blue-600 bg-blue-50' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-center space-x-2">
                    <Icon size={18} />
                    <span>{tab.label}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Role Switcher */}
        <div className="flex items-center space-x-4">
          {user?.role === 'both' && (
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => switchRole('patient')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${currentRole === 'patient' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}
                `}
              >
                Personal
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => switchRole('clinic')}
                className={`
                  px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${currentRole === 'clinic' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'}
                `}
              >
                Clinic
              </motion.button>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{currentRole}</div>
            </div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};