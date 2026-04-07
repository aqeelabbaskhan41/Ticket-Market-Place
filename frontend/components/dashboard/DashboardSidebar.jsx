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
  FaBalanceScale,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaTimes,

  FaCrown,
  FaTruck, // Add this icon for Deliveries
  FaStore,
  FaShoppingCart,
} from 'react-icons/fa';
import { useState, useEffect } from 'react';

const navigation = {
  admin: [
    { name: 'Dashboard', href: '/admin', icon: FaHome },
    { name: 'User Management', href: '/admin/users', icon: FaUsers },
    { name: 'User Levels', href: '/admin/levels', icon: FaCrown },
    { name: 'Pending Approvals', href: '/admin/approvals', icon: FaClock },
    { name: 'Matches & Events', href: '/admin/matches', icon: FaFutbol },
    { name: 'Transactions', href: '/admin/transactions', icon: FaExchangeAlt },
    { name: 'Manage Disputes', href: '/admin/disputes', icon: FaBalanceScale },
    { name: 'Commission Reports', href: '/admin/reports', icon: FaChartBar },
  ],
  seller: [
    { name: 'Dashboard', href: '/seller', icon: FaHome },
    { name: 'My Listings', href: '/seller/listings', icon: FaTicketAlt },
    { name: 'Deliveries', href: '/seller/deliveries', icon: FaTruck },
    { name: 'Create Listing', href: '/seller/listings/create', icon: FaTicketAlt },
    { name: 'Sales History', href: '/seller/sales', icon: FaExchangeAlt },
    { name: 'Withdraw Points', href: '/seller/withdraw', icon: FaExchangeAlt },
    { name: 'Profile', href: '/seller/profile', icon: FaUserCircle },
  ],
  buyer: [
    { name: 'Dashboard', href: '/buyer', icon: FaHome },
    { name: 'Browse Matches', href: '/buyer/matches', icon: FaFutbol },
    { name: 'My Tickets', href: '/buyer/tickets', icon: FaTicketAlt },
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
  const { 
    user, 
    canSwitchRoles, 
    handleRoleSwitch, 
    requestSellerRole,
    isBuyer,
    isSeller,
    actualRole
  } = useRole();

  // Handle menu item click (close mobile sidebar)
  const handleMenuItemClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  return (
    <div className="flex flex-col gap-y-4 h-full">
      {/* Header with Close Button (Mobile only) */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center">
          <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
            <FaTicketAlt className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">TicketHub</h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-blue-400">{role} Panel</p>
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
      <nav className="flex-1 overflow-y-auto scrollbar-hide pr-2 -mr-2">
        <ul className="space-y-1 px-2">
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
                  className={`flex items-center gap-x-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 translate-x-1'
                      : 'text-blue-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
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

        {/* 🔹 Role Switching Actions */}
        <div className="mt-8 border-t border-white/10 pt-6 px-2 space-y-2">
          <p className="px-4 text-[10px] font-bold uppercase tracking-wider text-blue-400/70 mb-2">Account Mode</p>
          
          {actualRole === 'buyer' && user?.status === 'approved' && (
            <button
              onClick={() => {
                const businessName = prompt('Please enter your Business Name:');
                if (businessName !== null) {
                  handleMenuItemClick();
                  requestSellerRole(businessName);
                }
              }}
              className="flex items-center gap-x-3 w-full px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                <FaStore className="h-4 w-4" />
              </div>
              Become a Seller
            </button>
          )}

          {actualRole === 'seller' && isBuyer && (
            <button
              onClick={() => {
                handleMenuItemClick();
                handleRoleSwitch('seller');
              }}
              className="flex items-center gap-x-3 w-full px-4 py-2.5 text-sm font-semibold text-green-400 hover:bg-green-500/10 hover:text-green-300 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20">
                <FaExchangeAlt className="h-4 w-4" />
              </div>
              Switch to Seller Mode
            </button>
          )}

          {actualRole === 'seller' && isSeller && (
            <button
              onClick={() => {
                handleMenuItemClick();
                handleRoleSwitch('buyer');
              }}
              className="flex items-center gap-x-3 w-full px-4 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 rounded-xl transition-all duration-200 group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20">
                <FaShoppingCart className="h-4 w-4" />
              </div>
              Switch to Buyer Mode
            </button>
          )}

          {user?.status === 'pending' && actualRole === 'seller' && (
            <div className="mx-4 mt-2 p-3 text-[10px] text-yellow-500 font-semibold bg-yellow-500/10 rounded-xl border border-yellow-500/20 leading-tight">
              Seller account pending approval. You'll be notified once approved.
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/20 pt-6 space-y-2 px-2">
        <Link
          href="/"
          onClick={handleMenuItemClick}
          className="flex items-center gap-x-3 px-4 py-2.5 text-sm font-semibold text-blue-200 hover:bg-white/10 hover:text-white rounded-xl transition-all duration-200"
        >
          <FaHome className="h-5 w-5 text-blue-300" />
          Back to Home
        </Link>
        <button
          onClick={() => {
            handleMenuItemClick();
            handleLogout();
          }}
          className="flex items-center gap-x-3 px-4 py-2.5 text-sm font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 w-full rounded-xl transition-all duration-200"
        >
          <FaSignOutAlt className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}