import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, FileText, ShoppingBag, Settings, Plus } from 'lucide-react';

interface MobileNavProps {
  onTakeTest?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onTakeTest }) => {
  const navigate = useNavigate();
  
  const handleTakeTest = () => {
    if (onTakeTest) {
      onTakeTest();
    } else {
      navigate('/health-test');
    }
  };
  const location = useLocation();
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: Home, path: '/dashboard' },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports' },
    { id: 'shop', label: 'Shop', icon: ShoppingBag, path: '/shop' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
  ];

  return (
    <>
      {/* Floating CTA */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleTakeTest}
        className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-lg z-40 flex items-center justify-center"
      >
        <Plus size={24} className="text-white" />
      </motion.button>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-30">
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = location.pathname.startsWith(tab.path);
            
            return (
              <Link key={tab.id} to={tab.path}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className="flex flex-col items-center space-y-1 py-2 px-3"
                >
                  <div className={`
                    p-2 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}
                  `}>
                    <Icon size={20} />
                  </div>
                  <span className={`
                    text-xs font-medium transition-all duration-200
                    ${isActive ? 'text-blue-600' : 'text-gray-400'}
                  `}>
                    {tab.label}
                  </span>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
};