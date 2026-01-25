'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  FaTicketAlt,
  FaHome,
  FaUsers,
  FaClock,
  FaFutbol,
  FaExchangeAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaTimes,

  FaCrown,
  FaTruck, // Add this icon for Deliveries
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'User Management', href: '/admin/users', icon: FaUsers },
    { name: 'User Levels', href: '/admin/levels', icon: FaCrown }, // Add User Levels
    { name: 'Pending Approvals', href: '/admin/approvals', icon: FaClock },
    { name: 'Matches & Events', href: '/admin/matches', icon: FaFutbol },
    { name: 'Transactions', href: '/admin/transactions', icon: FaExchangeAlt },
    { name: 'Reports', href: '/admin/reports', icon: FaChartBar },
    { name: 'System Settings', href: '/admin/settings', icon: FaCog },
  ],
  seller: [
    { name: 'Dashboard', href: '/seller', icon: FaHome },
    { name: 'My Listings', href: '/seller/listings', icon: FaTicketAlt },
    { name: 'Deliveries', href: '/seller/deliveries', icon: FaTruck },
    { name: 'Create Listing', href: '/seller/listings/create', icon: FaTicketAlt },
    { name: 'Sales History', href: '/seller/sales', icon: FaExchangeAlt },
    { name: 'Points Balance', href: '/seller/points', icon: FaChartBar },
    { name: 'Withdraw Points', href: '/seller/withdraw', icon: FaExchangeAlt },
    { name: 'Profile', href: '/seller/profile', icon: FaUserCircle },
  ],
  buyer: [
    { name: 'Dashboard', href: '/buyer', icon: FaHome },
    { name: 'Browse Matches', href: '/buyer/matches', icon: FaFutbol },
    { name: 'My Tickets', href: '/buyer/tickets', icon: FaTicketAlt },
    { name: 'Purchase History', href: '/buyer/history', icon: FaExchangeAlt },
    { name: 'Points Balance', href: '/buyer/points', icon: FaChartBar },
    { name: 'Buy Points', href: '/buyer/topup', icon: FaExchangeAlt },
    { name: 'Profile', href: '/buyer/profile', icon: FaUserCircle },
  ],
};

import { useRole } from '../../src/contexts/RoleContext';

export default function DashboardSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const [role, setRole] = useState('buyer');
  const { logout } = useRole();

  useEffect(() => {
    if (pathname.startsWith('/admin')) setRole('admin');
    else if (pathname.startsWith('/seller')) setRole('seller');
    else setRole('buyer');
  }, [pathname]);

  // Close sidebar when route changes (mobile)
  useEffect(() => {
    if (isOpen) {
      onClose();
    }
  }, [pathname]); // Close when pathname changes

  const handleLogout = () => {
    logout();
  };

  const menuItems = navigation[role] || [];

  return (
    <>
      {/* 🔹 Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-64 bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 h-screen sticky top-0">
        <SidebarContent 
          menuItems={menuItems} 
          role={role} 
          handleLogout={handleLogout} 
          isMobile={false}
        />
      </div>

      {/* 🔹 Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={onClose}
          ></div>
          
          {/* Sidebar Panel */}
          <div className="absolute left-0 top-0 w-72 h-full bg-white/10 backdrop-blur-xl border-r border-white/20 p-6 shadow-2xl">
            <SidebarContent 
              menuItems={menuItems} 
              role={role} 
              handleLogout={handleLogout} 
              isMobile={true}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </>
  );
}

/* 🔹 Reusable content block for both views */
function SidebarContent({ menuItems, role, handleLogout, isMobile, onClose }) {
  const pathname = usePathname();

  // Handle menu item click (close mobile sidebar)
  const handleMenuItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-y-5 h-full">
      {/* Header with Close Button (Mobile only) */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <FaTicketAlt className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">TicketHub</h1>
            <p className="text-xs text-blue-200 capitalize">{role} Panel</p>
          </div>
        </div>
        
        {/* Close Button - Mobile Only */}
        {isMobile && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-white hover:text-blue-200 transition-colors duration-200"
            aria-label="Close menu"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || 
                            (item.href === '/admin/users' && pathname.startsWith('/admin/users/')) ||
                            (item.href === '/admin/levels' && pathname.startsWith('/admin/levels'));
            const Icon = item.icon;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={handleMenuItemClick}
                  className={`flex items-center gap-x-3 rounded-lg p-2 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-white/20 text-white border-l-4 border-blue-400 shadow-lg'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${
                    isActive ? 'text-white' : 'text-blue-300'
                  }`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/20 pt-4 space-y-2">
        <Link
          href="/"
          onClick={handleMenuItemClick}
          className="flex items-center gap-x-3 p-2 text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white rounded-lg transition-colors duration-200"
        >
          <FaHome className="h-5 w-5 text-blue-300" />
          Back to Home
        </Link>
        <button
          onClick={() => {
            handleMenuItemClick();
            handleLogout();
          }}
          className="flex items-center gap-x-3 p-2 text-sm font-semibold text-red-300 hover:bg-red-500/20 hover:text-red-200 w-full rounded-lg transition-colors duration-200"
        >
          <FaSignOutAlt className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}