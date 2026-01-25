'use client';

import { useState, useEffect } from 'react';
import { FaCoins, FaShoppingCart, FaHistory, FaUser, FaTicketAlt, FaSearch, FaFire, FaSyncAlt } from 'react-icons/fa';

export default function BuyerDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    points: 0,
    activeOrders: 0,
    purchaseHistory: 0
  });

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please login.');
      }

      // Fetch current user data
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to fetch user data');

      setUserData(data.user);
      setStats({
        points: data.user.points || 0,
        activeOrders: data.user.activeOrders || 0,
        purchaseHistory: data.user.purchaseHistory || 0
      });

    } catch (err) {
      setError(err.message);
      console.error('Error fetching user data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshPoints = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.user) {
        setUserData(data.user);
        setStats(prev => ({
          ...prev,
          points: data.user.points || 0
        }));
      }
    } catch (err) {
      console.error('Error refreshing points:', err);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6">
        <div className="flex justify-center items-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <span className="ml-3 text-white text-lg">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="text-center py-20">
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-400/30">
              <FaUser className="text-xl text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Error Loading Dashboard</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button 
              onClick={fetchUserData}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
              <FaUser className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Buyer Dashboard</h1>
              <p className="text-blue-200 mt-1">
                Welcome back, {userData?.profile?.name || userData?.name || userData?.email}!
              </p>
            </div>
          </div>
          <button
            onClick={refreshPoints}
            className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-blue-300 px-4 py-2 rounded-lg transition-colors"
          >
            <FaSyncAlt className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Available Points */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaCoins className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Available Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.points.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Active Orders */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaShoppingCart className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Active Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.activeOrders}</p>
            </div>
          </div>
        </div>

        {/* Purchase History */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaHistory className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Purchases</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.purchaseHistory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <button 
            className="flex items-center p-3 sm:p-4 border border-white/20 rounded-xl hover:border-blue-400/50 hover:bg-blue-500/20 transition-all duration-200 group"
            onClick={() => window.location.href = '/events'}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors duration-200 border border-blue-400/30">
              <FaSearch className="text-sm sm:text-base text-blue-400 group-hover:text-blue-300" />
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">Browse Events</span>
          </button>

          <button 
            className="flex items-center p-3 sm:p-4 border border-white/20 rounded-xl hover:border-green-400/50 hover:bg-green-500/20 transition-all duration-200 group"
            onClick={() => window.location.href = '/my-tickets'}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors duration-200 border border-green-400/30">
              <FaTicketAlt className="text-sm sm:text-base text-green-400 group-hover:text-green-300" />
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">My Tickets</span>
          </button>

          <button 
            className="flex items-center p-3 sm:p-4 border border-white/20 rounded-xl hover:border-yellow-400/50 hover:bg-yellow-500/20 transition-all duration-200 group"
            onClick={() => window.location.href = '/buy-points'}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-500/30 transition-colors duration-200 border border-yellow-400/30">
              <FaCoins className="text-sm sm:text-base text-yellow-400 group-hover:text-yellow-300" />
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">Get More Points</span>
          </button>

          <button 
            className="flex items-center p-3 sm:p-4 border border-white/20 rounded-xl hover:border-purple-400/50 hover:bg-purple-500/20 transition-all duration-200 group"
            onClick={() => window.location.href = '/order-history'}
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-500/30 transition-colors duration-200 border border-purple-400/30">
              <FaHistory className="text-sm sm:text-base text-purple-400 group-hover:text-purple-300" />
            </div>
            <span className="font-semibold text-white text-sm sm:text-base">Order History</span>
          </button>
        </div>
      </div>

      {/* Featured Events */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-white">Featured Events</h2>
          <div className="flex items-center text-yellow-400">
            <FaFire className="mr-2" />
            <span className="text-sm font-semibold">Hot Deals</span>
          </div>
        </div>
        
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
            <FaTicketAlt className="text-2xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No Featured Events</h3>
          <p className="text-blue-200 mb-4">Check back later for exciting matches and events</p>
          <button 
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200"
            onClick={() => window.location.href = '/events'}
          >
            <FaSearch />
            Browse All Events
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 sm:mt-8 bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-400/30">
            <FaHistory className="text-2xl text-green-400" />
          </div>
          <p className="text-blue-200 text-sm sm:text-base">No recent activity</p>
          <p className="text-blue-300 text-xs sm:text-sm mt-1">Your purchases and orders will appear here</p>
        </div>
      </div>
    </div>
  );
}