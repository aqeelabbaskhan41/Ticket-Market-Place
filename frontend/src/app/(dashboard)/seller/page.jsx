'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaTicketAlt, 
  FaCoins, 
  FaStar, 
  FaChartLine,
  FaPlus,
  FaList,
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaShoppingCart,
  FaUser,
  FaCalendarAlt,
  FaArrowRight
} from 'react-icons/fa';

export default function SellerDashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({});
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Fetch listings and sales data
      const [listingsRes, salesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tickets/seller/listings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/tickets/seller/sales`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let listings = [];
      let sales = [];
      let stats = {};

      if (listingsRes.ok) {
        listings = await listingsRes.json();
      }

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        sales = salesData.sales || [];
        stats = salesData.stats || {};
        
        console.log('Sales API Response:', salesData.stats); // Debug log
      }

      // Calculate dashboard metrics
      const activeListings = listings.filter(l => l.status === 'active').length;
      const totalSales = sales.length;
      
      // USE CORRECT FIELD NAMES FROM API
      const totalPoints = stats.totalPoints || 0;
      const pendingPoints = stats.pendingPoints || 0;
      const availablePoints = stats.availablePoints || 0;

      // Get recent sales (last 5)
      const recentSalesData = sales.slice(0, 5);

      setDashboardData({
        activeListings,
        totalSales,
        totalPoints,        // Use new field name
        pendingPoints,      // Use new field name  
        availablePoints,    // Use new field name
        monthlyEarnings: Math.round(totalPoints * 0.3) // 30% of total for this month
      });

      setRecentSales(recentSalesData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_delivery: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending Delivery' },
      delivered: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: 'Delivered' },
      completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Completed' },
      cancelled: { color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Cancelled' }
    };
    const config = statusConfig[status] || statusConfig.pending_delivery;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Seller Dashboard</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Manage your ticket listings and track your earnings</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Active Listings */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaTicketAlt className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Active Listings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.activeListings || 0}</p>
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaShoppingCart className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Sales</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.totalSales || 0}</p>
            </div>
          </div>
        </div>

        {/* Pending Points */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.pendingPoints?.toLocaleString() || 0} pts</p>
            </div>
          </div>
        </div>

        {/* Available Points */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaCheckCircle className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Available Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{dashboardData.availablePoints?.toLocaleString() || 0} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Earnings Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-400/30 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Total Earnings</h3>
            <p className="text-3xl font-bold text-white">{dashboardData.totalPoints?.toLocaleString() || 0} points</p>
            <p className="text-blue-200 text-sm mt-1">Lifetime earnings from ticket sales</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 border border-white/20">
            <p className="text-green-400 text-sm font-semibold">+{dashboardData.monthlyEarnings?.toLocaleString() || 0} points this month</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* List Tickets */}
          <button 
            onClick={() => router.push('/seller/listings/create')}
            className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-blue-400/50 hover:bg-blue-500/20 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-500/30 transition-colors duration-200 border border-blue-400/30">
                <FaPlus className="text-sm sm:text-base text-blue-400 group-hover:text-blue-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">List Tickets</span>
            </div>
            <FaArrowRight className="text-blue-400 group-hover:text-blue-300 text-sm" />
          </button>

          {/* My Listings */}
          <button 
            onClick={() => router.push('/seller/listings')}
            className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-green-400/50 hover:bg-green-500/20 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-500/30 transition-colors duration-200 border border-green-400/30">
                <FaList className="text-sm sm:text-base text-green-400 group-hover:text-green-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">My Listings</span>
            </div>
            <FaArrowRight className="text-green-400 group-hover:text-green-300 text-sm" />
          </button>

          {/* Sales History */}
          <button 
            onClick={() => router.push('/seller/sales')}
            className="flex items-center justify-between p-3 sm:p-4 border border-white/20 rounded-xl hover:border-yellow-400/50 hover:bg-yellow-500/20 transition-all duration-200 group"
          >
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center mr-3 group-hover:bg-yellow-500/30 transition-colors duration-200 border border-yellow-400/30">
                <FaChartLine className="text-sm sm:text-base text-yellow-400 group-hover:text-yellow-300" />
              </div>
              <span className="font-semibold text-white text-sm sm:text-base">Sales History</span>
            </div>
            <FaArrowRight className="text-yellow-400 group-hover:text-yellow-300 text-sm" />
          </button>
        </div>
      </div>

      {/* Recent Sales */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Recent Sales</h2>
          <button 
            onClick={() => router.push('/seller/sales')}
            className="text-blue-300 hover:text-blue-200 text-sm flex items-center gap-1 transition-colors"
          >
            View All <FaArrowRight className="text-xs" />
          </button>
        </div>

        {recentSales.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <FaShoppingCart className="text-2xl text-blue-400" />
            </div>
            <p className="text-blue-200 text-sm sm:text-base">No recent sales</p>
            <p className="text-blue-300 text-xs sm:text-sm mt-1">Your sales will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentSales.map((sale) => (
              <div key={sale._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
                    <FaUser className="text-green-400 text-xs" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {sale.match || 'Match'}
                    </p>
                    <p className="text-blue-200 text-xs">
                      {sale.buyer || 'Buyer'} • {sale.quantity} ticket{sale.quantity > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold text-sm">{sale.total || sale.price} pts</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(sale.status)}
                    <p className="text-blue-300 text-xs">
                      {sale.purchaseDate ? new Date(sale.purchaseDate).toLocaleDateString() : 'Recent'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}