'use client';

import { useState, useEffect } from 'react';
import { 
  FaCoins, 
  FaChartLine, 
  FaClock, 
  FaCalendarAlt,
  FaPlusCircle,
  FaHistory,
  FaCheck,
  FaTicketAlt,
  FaExchangeAlt,
  FaGift
} from 'react-icons/fa';

export default function PointsBalance() {
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for points balance
  const mockPointsData = {
    availablePoints: 1250,
    totalSpent: 3400,
    pendingTransactions: 0,
    pointsExpiry: '2024-12-31T23:59:59Z'
  };

  // Mock transactions
  const mockTransactions = [
    {
      _id: '1',
      type: 'purchase',
      description: 'Arsenal vs Chelsea - 2 tickets',
      amount: -300,
      date: '2024-01-15T14:30:00Z',
      status: 'completed'
    },
    {
      _id: '2',
      type: 'topup',
      description: 'Points top-up via bank transfer',
      amount: 1000,
      date: '2024-01-14T09:45:00Z',
      status: 'completed'
    },
    {
      _id: '3',
      type: 'purchase',
      description: 'Manchester United vs Liverpool - 1 ticket',
      amount: -250,
      date: '2024-01-16T10:15:00Z',
      status: 'pending'
    },
    {
      _id: '4',
      type: 'refund',
      description: 'Refund - Newcastle vs Aston Villa',
      amount: 240,
      date: '2024-01-17T11:20:00Z',
      status: 'completed'
    },
    {
      _id: '5',
      type: 'purchase',
      description: 'Manchester City vs Tottenham - 4 tickets',
      amount: -1200,
      date: '2024-01-13T19:30:00Z',
      status: 'completed'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPointsData(mockPointsData);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const getTransactionColor = (amount) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getTransactionIcon = (type) => {
    const icons = {
      purchase: <FaTicketAlt className="text-lg" />,
      topup: <FaPlusCircle className="text-lg" />,
      refund: <FaExchangeAlt className="text-lg" />,
      bonus: <FaGift className="text-lg" />
    };
    return icons[type] || <FaCoins className="text-lg" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // <div className="w-full overflow-x-hidden">
    //   <div className="mb-6">
    //     <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Points Balance</h1>
    //     <p className="text-gray-600 mt-1 lg:mt-2">Manage your points and track spending</p>
    //   </div>

    //   {/* Points Overview */}
    //   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
    //     <div className="bg-white rounded-xl shadow-lg p-4 border border-green-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-xs lg:text-sm font-medium text-gray-600">Available Points</p>
    //           <p className="text-xl lg:text-2xl font-bold text-gray-900">
    //             {pointsData.availablePoints}
    //           </p>
    //           <p className="text-xs text-green-600 mt-1">Ready to use</p>
    //         </div>
    //         <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-lg flex items-center justify-center">
    //           <FaCoins className="text-lg text-green-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-xl shadow-lg p-4 border border-blue-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-xs lg:text-sm font-medium text-gray-600">Total Spent</p>
    //           <p className="text-xl lg:text-2xl font-bold text-gray-900">
    //             {pointsData.totalSpent}
    //           </p>
    //           <p className="text-xs text-blue-600 mt-1">All time</p>
    //         </div>
    //         <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
    //           <FaChartLine className="text-lg text-blue-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-xl shadow-lg p-4 border border-purple-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-xs lg:text-sm font-medium text-gray-600">Pending</p>
    //           <p className="text-xl lg:text-2xl font-bold text-gray-900">
    //             {pointsData.pendingTransactions}
    //           </p>
    //           <p className="text-xs text-purple-600 mt-1">Transactions</p>
    //         </div>
    //         <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg flex items-center justify-center">
    //           <FaClock className="text-lg text-purple-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-xl shadow-lg p-4 border border-orange-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-xs lg:text-sm font-medium text-gray-600">Points Expiry</p>
    //           <p className="text-xl lg:text-2xl font-bold text-gray-900">
    //             {new Date(pointsData.pointsExpiry).getFullYear()}
    //           </p>
    //           <p className="text-xs text-orange-600 mt-1">
    //             {new Date(pointsData.pointsExpiry).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
    //           </p>
    //         </div>
    //         <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg flex items-center justify-center">
    //           <FaCalendarAlt className="text-lg text-orange-600" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Quick Actions */}
    //   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
    //     <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-4 text-white">
    //       <h3 className="text-base lg:text-lg font-semibold mb-2">Buy More Points</h3>
    //       <p className="text-green-100 text-sm mb-3">
    //         Top up your points balance to purchase tickets. Contact admin for point purchases.
    //       </p>
    //       <a
    //         href="/buyer/topup"
    //         className="bg-white text-green-600 hover:bg-green-50 px-4 py-2 rounded-lg font-semibold inline-block transition-colors duration-200 text-sm"
    //       >
    //         Buy Points
    //       </a>
    //     </div>

    //     <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-4 text-white">
    //       <h3 className="text-base lg:text-lg font-semibold mb-2">Points History</h3>
    //       <p className="text-blue-100 text-sm mb-3">
    //         View detailed transaction history and spending breakdown.
    //       </p>
    //       <button className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-semibold transition-colors duration-200 text-sm">
    //         View Report
    //       </button>
    //     </div>
    //   </div>

    //   {/* Recent Transactions */}
    //   <div className="bg-white rounded-xl shadow-lg border border-green-100">
    //     <div className="px-4 lg:px-6 py-3 border-b border-gray-200">
    //       <h2 className="text-base lg:text-lg font-semibold text-gray-900">Recent Transactions</h2>
    //     </div>
    //     <div className="divide-y divide-gray-200">
    //       {transactions.map((transaction) => (
    //         <div key={transaction._id} className="px-4 lg:px-6 py-3 hover:bg-gray-50 transition-colors duration-150">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center min-w-0 flex-1">
    //               <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
    //                 {getTransactionIcon(transaction.type)}
    //               </div>
    //               <div className="min-w-0 flex-1">
    //                 <div className="font-medium text-gray-900 text-sm truncate">{transaction.description}</div>
    //                 <div className="text-xs text-gray-500">
    //                   {new Date(transaction.date).toLocaleDateString()} • 
    //                   <span className={`ml-1 ${
    //                     transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
    //                   }`}>
    //                     {transaction.status}
    //                   </span>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className={`text-base font-semibold ${getTransactionColor(transaction.amount)} ml-2 flex-shrink-0`}>
    //               {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>

    //     {transactions.length === 0 && (
    //       <div className="text-center py-8">
    //         <div className="text-gray-400 text-4xl mb-3">
    //           <FaCoins className="mx-auto text-4xl" />
    //         </div>
    //         <h3 className="text-base font-medium text-gray-900 mb-2">No transactions yet</h3>
    //         <p className="text-gray-500 text-sm">Your transaction history will appear here.</p>
    //       </div>
    //     )}
    //   </div>

    //   {/* Points Information */}
    //   <div className="bg-blue-50 rounded-xl p-4 border border-blue-200 mt-4">
    //     <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3">How Points Work</h3>
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs lg:text-sm text-gray-700">
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
    //         <span>1 Point = £0.10 GBP equivalent value</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
    //         <span>Points never expire (valid until end of year)</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
    //         <span>Contact admin to purchase points via bank transfer</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
    //         <span>Refunds are processed back to your points balance</span>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div>
      will be Available soon
    </div>
  );
}