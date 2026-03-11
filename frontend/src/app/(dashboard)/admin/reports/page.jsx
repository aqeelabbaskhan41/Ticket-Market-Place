'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaMoneyBillWave, 
  FaUsers, 
  FaShoppingCart, 
  FaCalendar,
  FaArrowRight
} from 'react-icons/fa';

export default function ReportsAnalytics() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/commission-report?period=${dateRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setReportData({
          summary: result.data.summary || {
            totalCommission: 0,
            totalPendingCommission: 0,
            totalSales: 0,
            transactionCount: 0,
            averageCommission: 0
          },
          byCategory: result.data.byCategory || []
        });
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPoints = (points) => {
    return `${(points || 0).toLocaleString()} pts`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading report data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-blue-200 mt-1">Comprehensive platform analytics and performance metrics</p>
        </div>
        <div className="relative min-w-[160px]">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
          >
            <option value="day" className="bg-gray-900">Today</option>
            <option value="week" className="bg-gray-900">This Week</option>
            <option value="month" className="bg-gray-900">This Month</option>
            <option value="year" className="bg-gray-900">This Year</option>
            <option value="all" className="bg-gray-900">All Time</option>
          </select>
          <FaCalendar className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-400/30">
              <FaMoneyBillWave className="text-xl text-green-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-200">Total Sales Volume</p>
          <p className="text-2xl font-bold text-white mt-1">
            {formatPoints(reportData.summary.totalSales)}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
              <FaShoppingCart className="text-xl text-blue-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-200">Total Transactions</p>
          <p className="text-2xl font-bold text-white mt-1">
            {reportData.summary.transactionCount || 0}
          </p>
        </div>

        {/* Commission Earned */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center border border-yellow-400/30">
              <FaChartBar className="text-xl text-yellow-400" />
            </div>
          </div>
          <p className="text-sm font-medium text-blue-200">Commission Earned</p>
          <div className="flex flex-col">
            <p className="text-2xl font-bold text-white mt-1">
              {formatPoints(reportData.summary.totalCommission)}
            </p>
            {reportData.summary.totalPendingCommission > 0 && (
              <p className="text-xs text-yellow-300/80 mt-1">
                + {formatPoints(reportData.summary.totalPendingCommission)} (Pending)
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <FaChartBar className="text-blue-400" />
          Commission by Ticket Category
        </h3>
        
        {reportData.byCategory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportData.byCategory.map((cat, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-blue-400/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold capitalize">{cat._id || 'Standard'}</p>
                    <p className="text-xs text-blue-200">{cat.transactionCount} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">{formatPoints(cat.totalCommission)}</p>
                  {cat.totalPendingCommission > 0 && (
                    <p className="text-[10px] text-yellow-300/60">+ {formatPoints(cat.totalPendingCommission)} (P)</p>
                  )}
                  <div className="w-24 h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500" 
                      style={{ 
                        width: `${((cat.totalCommission + cat.totalPendingCommission) / (reportData.summary.totalCommission + reportData.summary.totalPendingCommission || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
              <FaChartBar className="text-2xl text-blue-300 opacity-50" />
            </div>
            <p className="text-blue-200">No data available for this period</p>
          </div>
        )}
      </div>

      {/* Quick Summary Footer */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-blue-200 text-sm font-medium mb-1">Average Commission / Sale</h4>
          <p className="text-2xl font-bold text-white">
            {formatPoints(reportData.summary.averageCommission)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-600/20 to-blue-600/20 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
          <h4 className="text-blue-200 text-sm font-medium mb-1">Platform Performance</h4>
          <p className="text-2xl font-bold text-white">
            Active
          </p>
        </div>
      </div>
    </div>
  );
}
