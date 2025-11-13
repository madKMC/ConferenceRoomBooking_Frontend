import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, DoorOpen, X, Menu } from 'lucide-react';
import { useState } from 'react';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/bookings', icon: Calendar, label: 'Bookings' },
    { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 lg:w-16'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`font-bold text-xl text-primary-600 dark:text-primary-400 ${!isOpen && 'lg:hidden'}`}>
              {isOpen ? 'Conference' : 'C'}
            </h1>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  } ${!isOpen && 'lg:justify-center'}`
                }
                title={!isOpen ? item.label : ''}
              >
                <item.icon size={20} />
                <span className={!isOpen ? 'lg:hidden' : ''}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="hidden lg:flex items-center justify-center p-4 border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
