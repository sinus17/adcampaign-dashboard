import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaChartLine, FaUsers, FaPlug } from 'react-icons/fa6';

interface SidebarProps {
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const menuItems = [
    { path: '/reports', icon: FaChartLine, label: 'Reports' },
    { path: '/customers', icon: FaUsers, label: 'Customer Management' },
    { path: '/connections', icon: FaPlug, label: 'Connections' },
  ];

  return (
    <aside
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-4 border-b border-gray-200">
        <img
          src="/logo.svg"
          alt="Logo"
          className={`mx-auto h-8 ${isOpen ? 'w-auto' : 'w-8'}`}
        />
      </div>
      <nav className="p-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-700 hover:bg-gray-50'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;