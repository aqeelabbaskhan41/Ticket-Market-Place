'use client';

import { useState, useEffect } from 'react';
import { 
  FaChartBar, 
  FaMoneyBillWave, 
  FaUsers, 
  FaShoppingCart, 
  FaTicketAlt,
  FaDownload,
  FaCalendar,
  FaFileExcel,
  FaFilePdf,
  FaFileCsv,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

export default function ReportsAnalytics() {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [selectedReport, setSelectedReport] = useState('overview');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Mock report data
  const mockReportData = {
    overview: {
      totalRevenue: 12500,
      totalTransactions: 342,
      activeUsers: 1567,
      newRegistrations: 89,
      commissionEarned: 1250,
      avgTicketPrice: 85,
      conversionRate: 3.2
    },
    sales: [
      { date: '2024-01-10', sales: 12, revenue: 1020 },
      { date: '2024-01-11', sales: 18, revenue: 1530 },
      { date: '2024-01-12', sales: 15, revenue: 1275 },
      { date: '2024-01-13', sales: 22, revenue: 1870 },
      { date: '2024-01-14', sales: 25, revenue: 2125 },
      { date: '2024-01-15', sales: 30, revenue: 2550 },
      { date: '2024-01-16', sales: 28, revenue: 2380 }
    ],
    topMatches: [
      { match: 'Arsenal vs Chelsea', ticketsSold: 45, revenue: 3825 },
      { match: 'Manchester United vs Liverpool', ticketsSold: 38, revenue: 3230 },
      { match: 'Manchester City vs Tottenham', ticketsSold: 32, revenue: 2720 },
      { match: 'Newcastle vs Aston Villa', ticketsSold: 25, revenue: 2125 },
      { match: 'Chelsea vs Arsenal', ticketsSold: 22, revenue: 1870 }
    ],
    userActivity: [
      { role: 'Buyers', count: 1245, active: 892 },
      { role: 'Sellers', count: 322, active: 156 },
      { role: 'Pending Sellers', count: 45, active: 0 }
    ]
  };

  useEffect(() => {
    setTimeout(() => {
      setReportData(mockReportData);
      setLoading(false);
    }, 1500);
  }, [dateRange]);

  const formatCurrency = (amount) => {
    return `£${amount.toLocaleString()}`;
  };

  const formatPoints = (points) => {
    return `${points.toLocaleString()} pts`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-black">Reports & Analytics</h1>
          <p className="text-gray-700 mt-2">Comprehensive platform analytics and performance metrics</p>
        </div>
        <div className="flex space-x-4">
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black bg-white appearance-none pr-8"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <FaCalendar className="absolute right-2 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center">
            <FaDownload className="mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Report Type Selector */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100 mb-6">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: FaChartBar },
            { id: 'sales', label: 'Sales', icon: FaShoppingCart },
            { id: 'users', label: 'Users', icon: FaUsers },
            { id: 'matches', label: 'Matches', icon: FaTicketAlt },
            { id: 'financial', label: 'Financial', icon: FaMoneyBillWave }
          ].map((report) => {
            const IconComponent = report.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center whitespace-nowrap ${
                  selectedReport === report.id
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="mr-2" />
                {report.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Report */}
      {selectedReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Revenue</p>
                  <p className="text-2xl font-bold text-black">
                    {formatPoints(reportData.overview.totalRevenue)}
                  </p>
                  <div className="flex items-center mt-1">
                    <FaArrowUp className="text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">12.5%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Total Transactions</p>
                  <p className="text-2xl font-bold text-black">
                    {reportData.overview.totalTransactions}
                  </p>
                  <div className="flex items-center mt-1">
                    <FaArrowUp className="text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">8.3%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <FaShoppingCart className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Active Users</p>
                  <p className="text-2xl font-bold text-black">
                    {reportData.overview.activeUsers}
                  </p>
                  <div className="flex items-center mt-1">
                    <FaArrowUp className="text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">5.7%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <FaUsers className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-orange-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Commission Earned</p>
                  <p className="text-2xl font-bold text-black">
                    {formatPoints(reportData.overview.commissionEarned)}
                  </p>
                  <div className="flex items-center mt-1">
                    <FaArrowUp className="text-green-500 mr-1" />
                    <span className="text-green-600 text-sm font-medium">15.2%</span>
                    <span className="text-gray-500 text-sm ml-2">vs last period</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
                  <FaChartBar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Average Ticket Price</p>
                <p className="text-2xl font-bold text-black">
                  £{reportData.overview.avgTicketPrice}
                </p>
                <div className="flex items-center justify-center mt-1">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-600 text-sm">+2.1%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-blue-100">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Conversion Rate</p>
                <p className="text-2xl font-bold text-black">
                  {reportData.overview.conversionRate}%
                </p>
                <div className="flex items-center justify-center mt-1">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-600 text-sm">+0.8%</span>
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-purple-100">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">New Registrations</p>
                <p className="text-2xl font-bold text-black">
                  {reportData.overview.newRegistrations}
                </p>
                <div className="flex items-center justify-center mt-1">
                  <FaArrowUp className="text-green-500 mr-1" />
                  <span className="text-green-600 text-sm">+18.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts and Additional Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales Chart */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-black mb-4">Sales Trend</h3>
              <div className="space-y-3">
                {reportData.sales.map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">
                      {new Date(day.date).toLocaleDateString('en-GB', { weekday: 'short' })}
                    </span>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${(day.sales / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-sm font-medium text-black">{day.sales} sales</span>
                  </div>
                ))}
              </div>
            </div>

            {/* User Activity */}
            <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-lg font-semibold text-black mb-4">User Activity</h3>
              <div className="space-y-4">
                {reportData.userActivity.map((userGroup, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-black">{userGroup.role}</span>
                      <span className="text-gray-700">{userGroup.active}/{userGroup.count} active</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(userGroup.active / userGroup.count) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Matches */}
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-black mb-4">Top Performing Matches</h3>
            <div className="space-y-3">
              {reportData.topMatches.map((match, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-xs">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-black">{match.match}</div>
                      <div className="text-sm text-gray-700">{match.ticketsSold} tickets sold</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-black">{formatPoints(match.revenue)}</div>
                    <div className="text-sm text-green-600">Successful</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sales Report */}
      {selectedReport === 'sales' && (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
          <h3 className="text-lg font-semibold text-black mb-4">Detailed Sales Report</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Sales</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Avg. Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Growth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.sales.map((day, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {new Date(day.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {day.sales}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatPoints(day.revenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
                      {formatPoints(Math.round(day.revenue / day.sales))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                      +{Math.round(Math.random() * 20)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Report */}
      {selectedReport === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-black mb-4">User Demographics</h3>
            <div className="space-y-4">
              {reportData.userActivity.map((userGroup, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <FaUsers className="h-5 w-5 text-gray-500 mr-3" />
                    <div>
                      <div className="font-medium text-black">{userGroup.role}</div>
                      <div className="text-sm text-gray-700">Total: {userGroup.count}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{userGroup.active}</div>
                    <div className="text-sm text-gray-700">Active</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
            <h3 className="text-lg font-semibold text-black mb-4">User Growth</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">New Users This Week</span>
                <span className="font-semibold text-black">+{reportData.overview.newRegistrations}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Active Users</span>
                <span className="font-semibold text-black">{reportData.overview.activeUsers}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Conversion Rate</span>
                <span className="font-semibold text-green-600">{reportData.overview.conversionRate}%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Section */}
      <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100 mt-6">
        <h3 className="text-lg font-semibold text-black mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
            <FaFileCsv className="text-2xl mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-black">Sales Report</div>
              <div className="text-sm text-gray-700">CSV Format</div>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
            <FaFilePdf className="text-2xl mr-3 text-red-600" />
            <div className="text-left">
              <div className="font-medium text-black">User Analytics</div>
              <div className="text-sm text-gray-700">PDF Format</div>
            </div>
          </button>
          <button className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200">
            <FaFileExcel className="text-2xl mr-3 text-green-600" />
            <div className="text-left">
              <div className="font-medium text-black">Financial Summary</div>
              <div className="text-sm text-gray-700">Excel Format</div>
            </div>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-green-100">
          <div className="text-center">
            <FaChartBar className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black">{reportData.overview.totalTransactions}</div>
            <div className="text-sm text-gray-700">Total Transactions</div>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-blue-100">
          <div className="text-center">
            <FaUsers className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black">{reportData.overview.activeUsers}</div>
            <div className="text-sm text-gray-700">Active Users</div>
          </div>
        </div>
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-purple-100">
          <div className="text-center">
            <FaMoneyBillWave className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-black">{formatPoints(reportData.overview.commissionEarned)}</div>
            <div className="text-sm text-gray-700">Commission Earned</div>
          </div>
        </div>
      </div>
    </div>
  );
}