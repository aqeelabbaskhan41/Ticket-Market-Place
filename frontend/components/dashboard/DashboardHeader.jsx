'use client';

import { useState, useEffect, useRef } from 'react';
import {
  FaBars,
  FaBell,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaTicketAlt,
  FaExchangeAlt,
  FaShoppingCart,
  FaStore,
  FaCheckDouble,
  FaCircle,
  FaInfoCircle
} from 'react-icons/fa';
import { useRole } from '../../src/contexts/RoleContext';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import BecomeSellerModal from '../BecomeSellerModal';

export default function DashboardHeader({ onToggleSidebar }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [greeting, setGreeting] = useState('Welcome');
  const [showSellerModal, setShowSellerModal] = useState(false);
  
  const notificationRef = useRef(null);
  
  const { 
    currentRole, 
    user, 
    handleRoleSwitch,
    canSwitchRoles,
    isActualSeller,
    isActualBuyer,
    logout,
    refreshUser
  } = useRole();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';

  const handleBecomeSeller = () => {
    setShowSellerModal(true);
  };

  const handleRoleSwitchWithFeedback = async (newRole) => {
    const result = await handleRoleSwitch(newRole);
    if (result && !result.success) {
      toast.warning(result.message, { autoClose: 5000 });
    }
  };

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting('Good morning');
      else if (hour < 18) setGreeting('Good afternoon');
      else setGreeting('Good evening');
    };

    updateGreeting();
    fetchNotifications(true);
    // Poll for notifications every 30 seconds (made it faster)
    const interval = setInterval(() => fetchNotifications(false), 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notificationRef]);

  const fetchNotifications = async (isInitial = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Check for new notifications to show toast
        if (data.notifications && data.notifications.length > 0) {
          const latestNotif = data.notifications[0];
          
          // If this is a new notification that we haven't seen before
          if (!isInitial && lastNotificationId && latestNotif._id !== lastNotificationId && !latestNotif.read) {
            toast.info(latestNotif.title, {
              onClick: () => markAsRead(latestNotif._id, latestNotif.link),
              icon: <FaBell className="text-blue-400" />
            });
           }
           
           if (isInitial || !lastNotificationId || latestNotif._id !== lastNotificationId) {
             setLastNotificationId(latestNotif._id);
           }
         }
        
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (id, link) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Redirect if link exists
      if (link) {
        setIsNotificationOpen(false);
        router.push(link);
      }
    } catch (error) {
      console.error('Error marking read:', error);
    }
  };

  const markAllRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all read:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const getRoleDisplayName = () => {
    if (isActualSeller && currentRole === 'buyer') {
      return 'Buyer Mode';
    }
    return currentRole.charAt(0).toUpperCase() + currentRole.slice(1);
  };

  const handleProfileClick = () => {
    if (currentRole === 'seller') {
      router.push('/seller/profile');
    } else {
      router.push('/buyer/profile');
    }
    setIsProfileDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 flex flex-wrap items-center justify-between h-auto border-b border-white/20 bg-white/10 backdrop-blur-xl px-4 py-3 sm:px-6 lg:px-8">
      {showSellerModal && (
        <BecomeSellerModal
          onClose={() => setShowSellerModal(false)}
          onSuccess={() => {
            setShowSellerModal(false);
            toast.success('Seller request submitted! Awaiting admin approval.');
            refreshUser();
          }}
        />
      )}
      {/* 🔹 Left: Menu & Logo */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          className="p-2 text-white hover:text-blue-200 lg:hidden"
          onClick={onToggleSidebar}
        >
          <FaBars className="h-6 w-6" />
        </button>

        <div className="flex items-center">
          <div className="w-9 h-9 bg-blue-600/80 rounded-xl flex items-center justify-center shadow-lg mr-2">
            <FaTicketAlt className="text-white text-sm" />
          </div>
          <span className="text-lg font-semibold text-white hidden sm:block">
            TicketHub
          </span>
        </div>
      </div>

      {/* 🔹 Middle: Greeting & Role Info */}
      <div className="hidden md:flex flex-col items-start">
        <h1 className="text-base sm:text-lg font-semibold text-white">
          {greeting}
          {user ? `, ${user.profile?.fullName || 'User'}!` : '!'}
        </h1>
        <div className="flex items-center gap-2">
          <p className="text-sm text-blue-200">
            {isActualSeller && currentRole === 'buyer' ? 'Shopping as Buyer' : `Welcome to your ${getRoleDisplayName().toLowerCase()} dashboard`}
          </p>
          {isActualSeller && currentRole === 'buyer' && (
            <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded-full">
              Shopping Mode
            </span>
          )}
        </div>
      </div>

      {/* 🔹 Right: Icons */}
      <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
        {/* Role Switch Button - Only show for sellers */}
        {canSwitchRoles && (
          <div className="relative group">
            <button
              onClick={() => handleRoleSwitchWithFeedback(currentRole === 'seller' ? 'buyer' : 'seller')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-300 border ${
                currentRole === 'seller' 
                  ? "bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30" 
                  : "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30"
              }`}
            >
              <FaExchangeAlt className={`h-3.5 w-3.5 ${currentRole === 'seller' ? "animate-pulse" : ""}`} />
              <span className="hidden lg:inline text-xs font-bold uppercase tracking-wider">
                {currentRole === 'seller' ? 'Switch to Buyer' : 'Switch to Seller'}
              </span>
            </button>
            <div className="absolute top-full right-0 mt-2 px-3 py-1.5 text-[10px] text-white bg-gray-900/90 backdrop-blur-md rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none border border-white/10 shadow-2xl">
              {currentRole === 'seller' ? 'Browse and buy tickets' : 'Manage your listings and sales'}
            </div>
          </div>
        )}

        {/* Become a Seller Button - Only for Buyers */}
        {isActualBuyer && user?.status === 'approved' && (
          <button
            onClick={handleBecomeSeller}
            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 shadow-lg shadow-blue-500/20 group"
          >
            <FaStore className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
              Become a Seller
            </span>
          </button>
        )}

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(!isNotificationOpen)}
            className="relative p-2 text-white hover:text-blue-200"
          >
            <FaBell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 text-[8px] font-bold text-white items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isNotificationOpen && (
             <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[#1a1f2e] text-white rounded-xl shadow-2xl border border-blue-500/30 z-50 overflow-hidden">
                <div className="flex justify-between items-center px-4 py-3 border-b border-white/10 bg-white/5">
                   <h3 className="font-semibold text-sm">Notifications</h3>
                   <button 
                     onClick={markAllRead}
                     className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                   >
                     <FaCheckDouble /> Mark all read
                   </button>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                   {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-400 text-sm">
                         <FaBell className="mx-auto h-8 w-8 mb-2 opacity-50" />
                         <p>No notifications yet</p>
                      </div>
                   ) : (
                      <div className="divide-y divide-white/5">
                         {notifications.map((notif) => (
                            <div 
                              key={notif._id}
                              onClick={() => markAsRead(notif._id, notif.link)}
                              className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-blue-500/10' : ''}`}
                            >
                               <div className="flex gap-3">
                                  <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                    notif.type === 'sale' ? 'bg-green-500/20 text-green-400' :
                                    notif.type === 'delivery' ? 'bg-purple-500/20 text-purple-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                     {notif.type === 'sale' && <FaStore size={12} />}
                                     {notif.type === 'delivery' && <FaTicketAlt size={12} />}
                                     {(notif.type !== 'sale' && notif.type !== 'delivery') && <FaInfoCircle size={12} />}
                                  </div>
                                  <div className="flex-1">
                                     <div className="flex justify-between items-start">
                                        <h4 className={`text-sm font-medium ${!notif.read ? 'text-white' : 'text-gray-300'}`}>
                                           {notif.title}
                                        </h4>
                                        {!notif.read && <FaCircle className="text-blue-500 w-2 h-2 mt-1.5" />}
                                     </div>
                                     <p className="text-xs text-gray-400 mt-1 line-clamp-2">{notif.message}</p>
                                     <p className="text-[10px] text-gray-500 mt-2">
                                       {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </p>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
                <div className="px-4 py-2 border-t border-white/10 bg-white/5 text-center">
                   <button 
                     onClick={() => router.push(`/${currentRole}/notifications`)}
                     className="text-xs text-blue-400 hover:text-white transition-colors"
                   >
                     View All Notifications
                   </button>
                </div>
             </div>
          )}
        </div>

        {/* Profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition"
            >
              <div className="hidden sm:flex sm:flex-col sm:items-end text-right">
                <p className="text-sm font-semibold text-white capitalize">
                  {getRoleDisplayName()}
                </p>
                <p className="text-xs text-blue-200 truncate w-28">
                  {user.email}
                </p>
              </div>
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                <FaUserCircle className="text-white text-sm" />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 bg-black text-white rounded-lg shadow-xl border border-gray-700 py-1 z-50">
                {/* Role switching options for sellers */}
                {canSwitchRoles && (
                  <>
                    <div className="px-3 py-2 text-xs font-semibold text-blue-300 border-b border-gray-700">
                      SWITCH ROLE
                    </div>
                    {currentRole === 'seller' ? (
                      <button 
                        onClick={() => handleRoleSwitchWithFeedback('buyer')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center transition"
                      >
                        <FaShoppingCart className="mr-2 h-4 w-4 text-green-400" />
                        <div>
                          <div>Switch to Buyer</div>
                          <div className="text-xs text-gray-400">Purchase tickets</div>
                        </div>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleRoleSwitchWithFeedback('seller')}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center transition"
                      >
                        <FaStore className="mr-2 h-4 w-4 text-yellow-400" />
                        <div>
                          <div>Switch to Seller</div>
                          <div className="text-xs text-gray-400">Manage listings</div>
                        </div>
                      </button>
                    )}
                    <div className="border-t border-gray-700 my-1"></div>
                  </>
                )}

                {/* Regular menu items */}
                <button 
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-800 flex items-center transition"
                >
                  <FaUserCircle className="mr-2 h-4 w-4" />
                  My Profile
                </button>
                <div className="border-t border-gray-700 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-600/30 flex items-center transition"
                >
                  <FaSignOutAlt className="mr-2 h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay to close dropdown */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileDropdownOpen(false)}
        />
      )}
    </header>
  );
}