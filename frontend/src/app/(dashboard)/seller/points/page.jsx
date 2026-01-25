'use client';

import { useState, useEffect } from 'react';
import { 
  FaCoins, 
  FaClock, 
  FaChartLine, 
  FaMoneyBillWave,
  FaHistory,
  FaCheck,
  FaExchangeAlt,
  FaPercentage,
  FaDollarSign
} from 'react-icons/fa';

export default function PointsBalance() {
  const [pointsData, setPointsData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for points balance
  const mockPointsData = {
    availablePoints: 2450,
    escrowPoints: 750,
    totalEarned: 5600,
    pendingWithdrawal: 500,
    nextPayoutDate: '2024-01-25T00:00:00Z'
  };

  // Mock transactions
  const mockTransactions = [
    {
      _id: '1',
      type: 'sale',
      description: 'Ticket sale - Arsenal vs Chelsea',
      amount: 270,
      date: '2024-01-22T14:30:00Z',
      status: 'completed'
    },
    {
      _id: '2',
      type: 'sale',
      description: 'Ticket sale - Manchester United vs Liverpool',
      amount: 225,
      date: '2024-01-16T10:15:00Z',
      status: 'pending'
    },
    {
      _id: '3',
      type: 'withdrawal',
      description: 'Points withdrawal to bank account',
      amount: -1000,
      date: '2024-01-10T09:30:00Z',
      status: 'completed'
    },
    {
      _id: '4',
      type: 'sale',
      description: 'Ticket sale - Manchester City vs Tottenham',
      amount: 1080,
      date: '2024-01-20T19:30:00Z',
      status: 'completed'
    },
    {
      _id: '5',
      type: 'commission',
      description: 'Platform commission',
      amount: -54,
      date: '2024-01-12T11:45:00Z',
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
      sale: <FaCoins className="text-xl" />,
      withdrawal: <FaMoneyBillWave className="text-xl" />,
      commission: <FaPercentage className="text-xl" />,
      refund: <FaExchangeAlt className="text-xl" />
    };
    return icons[type] || <FaDollarSign className="text-xl" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // <div>
    //   <div className="mb-8">
    //     <h1 className="text-3xl font-bold text-black">Points Balance</h1>
    //     <p className="text-black mt-2">Manage your points and track earnings</p>
    //   </div>

    //   {/* Points Overview */}
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    //     <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-sm font-medium text-black">Available Points</p>
    //           <p className="text-3xl font-bold text-black">
    //             {pointsData.availablePoints}
    //           </p>
    //           <p className="text-sm text-green-600 mt-1">Ready to withdraw</p>
    //         </div>
    //         <div className="w-12 h-12 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center">
    //           <FaCoins className="text-2xl text-green-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-6 border border-blue-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-sm font-medium text-black">In Escrow</p>
    //           <p className="text-3xl font-bold text-black">
    //             {pointsData.escrowPoints}
    //           </p>
    //           <p className="text-sm text-blue-600 mt-1">Pending release</p>
    //         </div>
    //         <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
    //           <FaClock className="text-2xl text-blue-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-sm font-medium text-black">Total Earned</p>
    //           <p className="text-3xl font-bold text-black">
    //             {pointsData.totalEarned}
    //           </p>
    //           <p className="text-sm text-purple-600 mt-1">All time</p>
    //         </div>
    //         <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
    //           <FaChartLine className="text-2xl text-purple-600" />
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
    //       <div className="flex items-center justify-between">
    //         <div>
    //           <p className="text-sm font-medium text-black">Next Payout</p>
    //           <p className="text-3xl font-bold text-black">
    //             {pointsData.pendingWithdrawal}
    //           </p>
    //           <p className="text-sm text-orange-600 mt-1">
    //             {new Date(pointsData.nextPayoutDate).toLocaleDateString()}
    //           </p>
    //         </div>
    //         <div className="w-12 h-12 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center">
    //           <FaMoneyBillWave className="text-2xl text-orange-600" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Quick Actions */}
    //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
    //     <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-black">
    //       <h3 className="text-lg font-semibold mb-2">Withdraw Points</h3>
    //       <p className="text-green-100 mb-4">
    //         Convert your points to cash. Minimum withdrawal: 100 points.
    //       </p>
    //       <a
    //         href="/seller/withdraw"
    //         className="bg-white text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg font-semibold inline-block transition-colors duration-200"
    //       >
    //         Withdraw Now
    //       </a>
    //     </div>

    //     <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-black">
    //       <h3 className="text-lg font-semibold mb-2">Points History</h3>
    //       <p className="text-blue-100 mb-4">
    //         View detailed transaction history and earnings breakdown.
    //       </p>
    //       <button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold transition-colors duration-200">
    //         View Report
    //       </button>
    //     </div>
    //   </div>

    //   {/* Recent Transactions */}
    //   <div className="bg-white rounded-2xl shadow-lg border border-green-100">
    //     <div className="px-6 py-4 border-b border-gray-200">
    //       <h2 className="text-lg font-semibold text-black">Recent Transactions</h2>
    //     </div>
    //     <div className="divide-y divide-gray-200">
    //       {transactions.map((transaction) => (
    //         <div key={transaction._id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150">
    //           <div className="flex items-center justify-between">
    //             <div className="flex items-center">
    //               <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
    //                 {getTransactionIcon(transaction.type)}
    //               </div>
    //               <div>
    //                 <div className="font-medium text-black">{transaction.description}</div>
    //                 <div className="text-sm text-black">
    //                   {new Date(transaction.date).toLocaleDateString()} • 
    //                   <span className={`ml-1 ${
    //                     transaction.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
    //                   }`}>
    //                     {transaction.status}
    //                   </span>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className={`text-lg font-semibold ${getTransactionColor(transaction.amount)}`}>
    //               {transaction.amount > 0 ? '+' : ''}{transaction.amount} pts
    //             </div>
    //           </div>
    //         </div>
    //       ))}
    //     </div>

    //     {transactions.length === 0 && (
    //       <div className="text-center py-12">
    //         <div className="text-gray-400 text-6xl mb-4">
    //           <FaDollarSign className="mx-auto text-6xl" />
    //         </div>
    //         <h3 className="text-lg font-medium text-black mb-2">No transactions yet</h3>
    //         <p className="text-black">Your transaction history will appear here.</p>
    //       </div>
    //     )}
    //   </div>

    //   {/* Points Information */}
    //   <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200 mt-6">
    //     <h3 className="text-lg font-semibold text-black mb-4">How Points Work</h3>
    //     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-black">
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5" />
    //         <span>Points from sales are held in escrow for 7 days after the match</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5" />
    //         <span>10% commission is deducted from each sale</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5" />
    //         <span>Minimum withdrawal amount is 100 points</span>
    //       </div>
    //       <div className="flex items-start">
    //         <FaCheck className="text-green-500 mr-2 mt-0.5" />
    //         <span>Withdrawals are processed within 2-3 business days</span>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div>
      Available soon
    </div>
  );
}