'use client';
import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaClock, 
  FaFutbol, 
  FaExchangeAlt, 
  FaChartBar,
  FaCog,
  FaCheckCircle,
  FaPlus,
  FaTicketAlt,
  FaShieldAlt,
  FaServer,
  FaDatabase,
  FaCubes,
  FaCoins,
  FaMoneyBillWave,
  FaHandHoldingUsd,
  FaBalanceScale,
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to access admin dashboard');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch admin data');
      }

      const result = await response.json();
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        throw new Error(result.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      console.error('Admin dashboard error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      ticket_sold: FaTicketAlt,
      commission_earned: FaCoins,
      user_registered: FaUsers,
      dispute_reported: FaExclamationTriangle,
      points_released: FaMoneyBillWave
    };
    const IconComponent = icons[type] || FaExchangeAlt;
    return <IconComponent className="h-4 w-4 text-blue-400" />;
  };

  const getActivityColor = (type) => {
    const colors = {
      ticket_sold: 'bg-green-500/20 border-green-400/30',
      commission_earned: 'bg-yellow-500/20 border-yellow-400/30',
      user_registered: 'bg-blue-500/20 border-blue-400/30',
      dispute_reported: 'bg-red-500/20 border-red-400/30',
      points_released: 'bg-purple-500/20 border-purple-400/30'
    };
    return colors[type] || 'bg-blue-500/20 border-blue-400/30';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading admin dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
          <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-3" />
          <p className="text-red-300 mb-2 font-semibold">Error Loading Dashboard</p>
          <p className="text-red-200 text-sm mb-4">{error}</p>
          <button 
            onClick={fetchAdminData}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Manage your ticket marketplace platform and track earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Commission Earned */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaCoins className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Commission Earned</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {dashboardData.commissionEarned?.toLocaleString() || 0} pts
              </p>
              <p className="text-yellow-300 text-xs mt-1">
                ${((dashboardData.commissionEarned || 0) * 0.01).toFixed(2)} USD
              </p>
            </div>
          </div>
        </div>

        {/* Pending Commissions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-orange-400/30">
              <FaClock className="text-lg sm:text-xl text-orange-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending Commissions</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {dashboardData.pendingCommissions?.toLocaleString() || 0} pts
              </p>
              <p className="text-orange-300 text-xs mt-1">In escrow</p>
            </div>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaUsers className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {dashboardData.totalUsers?.toLocaleString() || 0}
              </p>
              <p className="text-blue-300 text-xs mt-1">Platform users</p>
            </div>
          </div>
        </div>

        {/* Active Listings */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaFutbol className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Active Listings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {dashboardData.activeListings?.toLocaleString() || 0}
              </p>
              <p className="text-green-300 text-xs mt-1">Available tickets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Commission Summary */}
      <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-400/30 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Commission Summary</h3>
            <p className="text-3xl font-bold text-white">
              {dashboardData.commissionEarned?.toLocaleString() || 0} points
            </p>
            <p className="text-yellow-200 text-sm mt-1">
              Total commission earned from {dashboardData.totalTransactions || 0} transactions
            </p>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <p className="text-green-400 text-sm font-semibold">
                {dashboardData.platformCommissionRate || 10}% Commission Rate
              </p>
            </div>
            <div className="bg-white/10 rounded-lg p-3 border border-white/20">
              <p className="text-blue-400 text-sm font-semibold">
                Success Rate: {dashboardData.successRate || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Commission Report */}
          <button className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-yellow-400/50 hover:bg-yellow-500/20 transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-500/30 transition-colors duration-200 border border-yellow-400/30">
                <FaChartBar className="text-sm sm:text-base text-yellow-400 group-hover:text-yellow-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">Commission Report</span>
            </div>
            <FaArrowRight className="text-yellow-400 group-hover:text-yellow-300 text-sm" />
          </button>

          {/* Manage Disputes */}
          <button className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-red-400/50 hover:bg-red-500/20 transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-500/30 transition-colors duration-200 border border-red-400/30">
                <FaBalanceScale className="text-sm sm:text-base text-red-400 group-hover:text-red-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">
                Manage Disputes ({dashboardData.pendingDisputes || 0})
              </span>
            </div>
            <FaArrowRight className="text-red-400 group-hover:text-red-300 text-sm" />
          </button>

          {/* User Management */}
          <button className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-blue-400/50 hover:bg-blue-500/20 transition-all duration-200 group">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors duration-200 border border-blue-400/30">
                <FaUsers className="text-sm sm:text-base text-blue-400 group-hover:text-blue-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">User Management</span>
            </div>
            <FaArrowRight className="text-blue-400 group-hover:text-blue-300 text-sm" />
          </button>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {dashboardData.recentActivity?.length > 0 ? (
              dashboardData.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10 hover:border-blue-400/30 transition-colors duration-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{activity.message}</p>
                    {activity.points && (
                      <p className="text-yellow-400 text-xs font-semibold">+{activity.points} pts</p>
                    )}
                    <p className="text-blue-300 text-xs">{formatTime(activity.time)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-blue-200">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <FaCoins className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Points in Circulation</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {dashboardData.totalPointsInCirculation?.toLocaleString() || 0} pts
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <FaExchangeAlt className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Total Transactions</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {dashboardData.totalTransactions || 0}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <FaServer className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Platform Health</span>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-400/30">
                Optimal
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center space-x-3">
                <FaShieldAlt className="h-4 w-4 text-green-400" />
                <span className="text-sm text-white">Dispute Rate</span>
              </div>
              <span className="text-white font-semibold text-sm">
                {dashboardData.totalTransactions > 0 
                  ? ((dashboardData.pendingDisputes / dashboardData.totalTransactions) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}