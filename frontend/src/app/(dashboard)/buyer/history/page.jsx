'use client';

import { useState, useEffect } from 'react';
import { 
  FaShoppingCart, 
  FaCoins, 
  FaCheckCircle, 
  FaStar,
  FaCalendar,
  FaInfo,
  FaStar as FaRate,
  FaRedo
} from 'react-icons/fa';

export default function PurchaseHistory() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock data for purchase history
  const mockPurchases = [
    {
      _id: '1',
      purchaseId: 'PUR-001',
      match: 'Arsenal vs Chelsea',
      tickets: 2,
      totalPoints: 300,
      status: 'completed',
      purchaseDate: '2024-01-15T14:30:00Z',
      seller: 'John\'s Ticket Empire',
      rating: 5,
      review: 'Great seller, fast delivery!'
    },
    {
      _id: '2',
      purchaseId: 'PUR-002',
      match: 'Manchester United vs Liverpool',
      tickets: 1,
      totalPoints: 250,
      status: 'refunded',
      purchaseDate: '2024-01-16T10:15:00Z',
      seller: 'Ticket Masters',
      refundReason: 'Match postponed',
      refundAmount: 250
    },
    {
      _id: '3',
      purchaseId: 'PUR-003',
      match: 'Manchester City vs Tottenham',
      tickets: 4,
      totalPoints: 1200,
      status: 'completed',
      purchaseDate: '2024-01-13T19:30:00Z',
      seller: 'VIP Ticket Shop',
      rating: 4,
      review: 'Good seats, smooth process'
    },
    {
      _id: '4',
      purchaseId: 'PUR-004',
      match: 'Newcastle vs Aston Villa',
      tickets: 2,
      totalPoints: 240,
      status: 'cancelled',
      purchaseDate: '2024-01-14T16:20:00Z',
      seller: 'North East Tickets',
      cancelReason: 'Seller cancelled'
    },
    {
      _id: '5',
      purchaseId: 'PUR-005',
      match: 'Chelsea vs Arsenal',
      tickets: 3,
      totalPoints: 540,
      status: 'completed',
      purchaseDate: '2024-01-12T11:45:00Z',
      seller: 'London Ticket Hub',
      rating: null,
      review: null
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPurchases(mockPurchases);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPurchases = purchases.filter(purchase => 
    selectedStatus === 'all' || purchase.status === selectedStatus
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      refunded: { color: 'bg-blue-100 text-blue-800', label: 'Refunded' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' },
      disputed: { color: 'bg-orange-100 text-orange-800', label: 'Disputed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTotalSpent = () => {
    return purchases
      .filter(p => p.status === 'completed')
      .reduce((acc, purchase) => acc + purchase.totalPoints, 0);
  };

  const getSuccessfulPurchases = () => {
    return purchases.filter(p => p.status === 'completed').length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // <div className="w-full overflow-x-hidden text-black">
    //   <div className="mb-8">
    //     <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
    //     <p className="text-gray-600 mt-2">Track your ticket purchases and order status</p>
    //   </div>

    //   {/* Stats Overview */}
    //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
    //     <div className="bg-white rounded-2xl shadow-lg p-4 border border-green-100">
    //       <div className="flex items-center">
    //         <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mr-3">
    //           <FaShoppingCart className="text-xl text-green-600" />
    //         </div>
    //         <div>
    //           <p className="text-sm font-medium text-gray-600">Total Purchases</p>
    //           <p className="text-xl font-bold text-gray-900">{purchases.length}</p>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-4 border border-blue-100">
    //       <div className="flex items-center">
    //         <div className="w-10 h-10 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mr-3">
    //           <FaCoins className="text-xl text-blue-600" />
    //         </div>
    //         <div>
    //           <p className="text-sm font-medium text-gray-600">Total Spent</p>
    //           <p className="text-xl font-bold text-gray-900">
    //             {getTotalSpent()} pts
    //           </p>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-4 border border-purple-100">
    //       <div className="flex items-center">
    //         <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mr-3">
    //           <FaCheckCircle className="text-xl text-purple-600" />
    //         </div>
    //         <div>
    //           <p className="text-sm font-medium text-gray-600">Successful</p>
    //           <p className="text-xl font-bold text-gray-900">
    //             {getSuccessfulPurchases()}
    //           </p>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-100">
    //       <div className="flex items-center">
    //         <div className="w-10 h-10 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mr-3">
    //           <FaStar className="text-xl text-orange-600" />
    //         </div>
    //         <div>
    //           <p className="text-sm font-medium text-gray-600">Avg. Rating</p>
    //           <p className="text-xl font-bold text-gray-900">
    //             {Math.round((purchases
    //               .filter(p => p.rating)
    //               .reduce((acc, p) => acc + p.rating, 0) / 
    //               purchases.filter(p => p.rating).length) * 10) / 10 || 0}
    //           </p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Filters */}
    //   <div className="bg-white rounded-2xl shadow-lg p-4 border border-green-100 mb-6">
    //     <div className="flex flex-col sm:flex-row gap-3">
    //       <div className="flex-1">
    //         <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
    //         <select
    //           value={selectedStatus}
    //           onChange={(e) => setSelectedStatus(e.target.value)}
    //           className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black text-sm"
    //         >
    //           <option value="all">All Status</option>
    //           <option value="completed">Completed</option>
    //           <option value="pending">Pending</option>
    //           <option value="refunded">Refunded</option>
    //           <option value="cancelled">Cancelled</option>
    //         </select>
    //       </div>
          
    //       <div className="flex-1">
    //         <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
    //         <div className="relative">
    //           <input
    //             type="date"
    //             className="w-full px-3 py-2 pl-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black text-sm"
    //           />
    //           <FaCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Purchases Cards - Mobile Friendly */}
    //   <div className="space-y-4">
    //     {filteredPurchases.map((purchase) => (
    //       <div key={purchase._id} className="bg-white rounded-2xl shadow-lg border border-green-100 p-4">
    //         <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
    //           {/* Left Section */}
    //           <div className="flex-1">
    //             <div className="flex items-start justify-between mb-2">
    //               <div>
    //                 <h3 className="font-semibold text-gray-900 text-sm">{purchase.purchaseId}</h3>
    //                 <p className="text-gray-600 text-sm">{purchase.match}</p>
    //               </div>
    //               {getStatusBadge(purchase.status)}
    //             </div>
                
    //             <div className="grid grid-cols-2 gap-2 text-xs">
    //               <div>
    //                 <span className="text-gray-500">Seller:</span>
    //                 <p className="font-medium">{purchase.seller}</p>
    //               </div>
    //               <div>
    //                 <span className="text-gray-500">Points:</span>
    //                 <p className="font-medium">{purchase.totalPoints} pts</p>
    //               </div>
    //               <div>
    //                 <span className="text-gray-500">Tickets:</span>
    //                 <p className="font-medium">{purchase.tickets}</p>
    //               </div>
    //               <div>
    //                 <span className="text-gray-500">Date:</span>
    //                 <p className="font-medium">{new Date(purchase.purchaseDate).toLocaleDateString()}</p>
    //               </div>
    //             </div>

    //             {purchase.refundReason && (
    //               <div className="mt-2 text-xs text-blue-600">
    //                 Refund: {purchase.refundReason} ({purchase.refundAmount} pts)
    //               </div>
    //             )}
    //           </div>

    //           {/* Right Section */}
    //           <div className="flex flex-col items-end gap-2">
    //             {/* Rating */}
    //             <div className="flex items-center">
    //               {purchase.rating ? (
    //                 <>
    //                   <FaStar className="text-yellow-500 mr-1 text-sm" />
    //                   <span className="text-sm font-medium">{purchase.rating}/5</span>
    //                 </>
    //               ) : (
    //                 <span className="text-gray-400 text-sm">Not rated</span>
    //               )}
    //             </div>

    //             {/* Actions */}
    //             <div className="flex flex-wrap gap-1">
    //               <button className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
    //                 <FaInfo className="text-xs" />
    //                 Details
    //               </button>
    //               {purchase.status === 'completed' && !purchase.rating && (
    //                 <button className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
    //                   <FaRate className="text-xs" />
    //                   Rate
    //                 </button>
    //               )}
    //               {purchase.status === 'completed' && (
    //                 <button className="text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 px-2 py-1 rounded text-xs font-medium transition-colors duration-200 flex items-center gap-1">
    //                   <FaRedo className="text-xs" />
    //                   Reorder
    //                 </button>
    //               )}
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     ))}
    //   </div>

    //   {/* Empty State */}
    //   {filteredPurchases.length === 0 && !loading && (
    //     <div className="text-center py-12">
    //       <div className="text-gray-400 text-6xl mb-4">
    //         <FaShoppingCart className="mx-auto text-6xl" />
    //       </div>
    //       <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases found</h3>
    //       <p className="text-gray-500">You haven't made any purchases yet.</p>
    //     </div>
    //   )}
    // </div>
    <div>
      will be Available soon
    </div>
  );
}