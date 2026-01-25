'use client';

import { useState, useEffect } from 'react';
import { 
  FaCoins, 
  FaCheck, 
  FaMoneyBillWave, 
  FaPaypal, 
  FaCreditCard,
  FaHistory
} from 'react-icons/fa';

export default function BuyPoints() {
  const [pointsData, setPointsData] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [topupHistory, setTopupHistory] = useState([]);

  // Mock data
  const mockPointsData = {
    availablePoints: 1250,
    exchangeRate: 0.10 // 1 point = £0.10
  };

  const pointPackages = [
    { id: 1, points: 500, price: 50, bonus: 0, popular: false },
    { id: 2, points: 1000, price: 100, bonus: 0, popular: true },
    { id: 3, points: 2000, price: 200, bonus: 100, popular: false },
    { id: 4, points: 5000, price: 500, bonus: 500, popular: false }
  ];

  const mockTopupHistory = [
    {
      _id: '1',
      points: 1000,
      amount: 100,
      paymentMethod: 'bank_transfer',
      status: 'completed',
      requestedAt: '2024-01-14T09:45:00Z',
      processedAt: '2024-01-14T11:20:00Z',
      transactionId: 'TOPUP-001'
    },
    {
      _id: '2',
      points: 500,
      amount: 50,
      paymentMethod: 'bank_transfer',
      status: 'pending',
      requestedAt: '2024-01-18T16:30:00Z',
      transactionId: 'TOPUP-002'
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setPointsData(mockPointsData);
      setTopupHistory(mockTopupHistory);
    }, 500);
  }, []);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setCustomAmount('');
  };

  const handleCustomAmount = (amount) => {
    setCustomAmount(amount);
    setSelectedPackage(null);
  };

  const handleTopupRequest = async (e) => {
    e.preventDefault();
    
    const points = selectedPackage ? selectedPackage.points + selectedPackage.bonus : parseInt(customAmount);
    const amount = selectedPackage ? selectedPackage.price : (parseInt(customAmount) * mockPointsData.exchangeRate);

    if (!points || points < 100) {
      alert('Minimum top-up amount is 100 points');
      return;
    }

    setLoading(true);
    
    // Simulate API call to request top-up
    setTimeout(() => {
      setLoading(false);
      alert(`Top-up request for ${points} points submitted! Our admin will contact you for payment details.`);
      setSelectedPackage(null);
      setCustomAmount('');
    }, 2000);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      failed: { color: 'bg-red-100 text-red-800', label: 'Failed' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!pointsData) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    // <div className="w-full overflow-x-hidden">
    //   <div className="mb-6">
    //     <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Buy Points</h1>
    //     <p className="text-gray-600 mt-1 lg:mt-2">Top up your points balance to purchase tickets</p>
    //   </div>

    //   <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
    //     {/* Points Packages */}
    //     <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-green-100">
    //       <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Select Points Package</h2>

    //       {/* Current Balance */}
    //       <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6 border border-green-200">
    //         <div className="text-center">
    //           <div className="text-sm text-gray-600">Current Balance</div>
    //           <div className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 lg:mb-2">
    //             {pointsData.availablePoints} pts
    //           </div>
    //           <div className="text-xs lg:text-sm text-gray-500">
    //             Exchange rate: 1 point = £{pointsData.exchangeRate}
    //           </div>
    //         </div>
    //       </div>

    //       {/* Points Packages */}
    //       <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 lg:mb-6">
    //         {pointPackages.map((pkg) => (
    //           <div
    //             key={pkg.id}
    //             onClick={() => handlePackageSelect(pkg)}
    //             className={`border-2 rounded-lg p-3 cursor-pointer transition-all duration-200 ${
    //               selectedPackage?.id === pkg.id
    //                 ? 'border-green-500 bg-green-50'
    //                 : 'border-gray-200 hover:border-green-300'
    //             } ${pkg.popular ? 'ring-2 ring-green-300' : ''}`}
    //           >
    //             {pkg.popular && (
    //               <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full inline-block mb-2">
    //                 POPULAR
    //               </div>
    //             )}
    //             <div className="text-center">
    //               <div className="text-lg lg:text-xl font-bold text-gray-900">{pkg.points}</div>
    //               <div className="text-base lg:text-lg font-semibold text-green-600">£{pkg.price}</div>
    //               {pkg.bonus > 0 && (
    //                 <div className="text-xs lg:text-sm text-blue-600 mt-1">
    //                   + {pkg.bonus} bonus!
    //                 </div>
    //               )}
    //               <div className="text-xs text-gray-500 mt-1">
    //                 Total: {pkg.points + pkg.bonus} pts
    //               </div>
    //             </div>
    //           </div>
    //         ))}
    //       </div>

    //       {/* Custom Amount */}
    //       <div className="border-t border-gray-200 pt-4 lg:pt-6">
    //         <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">Custom Amount</h3>
    //         <div className="relative">
    //           <input
    //             type="number"
    //             value={customAmount}
    //             onChange={(e) => handleCustomAmount(e.target.value)}
    //             placeholder="Enter custom points amount"
    //             min="100"
    //             className="w-full px-3 lg:px-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-black pl-10 lg:pl-12 text-sm"
    //           />
    //           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
    //             <FaCoins className="text-gray-500 text-sm" />
    //           </div>
    //         </div>
    //         {customAmount && (
    //           <div className="mt-2 text-sm text-gray-600">
    //             Cost: £{(parseInt(customAmount) * pointsData.exchangeRate).toFixed(2)}
    //           </div>
    //         )}
    //       </div>

    //       {/* Request Button */}
    //       <button
    //         onClick={handleTopupRequest}
    //         disabled={!selectedPackage && !customAmount}
    //         className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 lg:py-3 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-4 lg:mt-6 text-sm lg:text-base"
    //       >
    //         {loading ? 'Processing...' : 'Request Points Purchase'}
    //       </button>

    //       {/* Process Information */}
    //       <div className="bg-blue-50 rounded-lg p-3 lg:p-4 mt-4 lg:mt-6 border border-blue-200">
    //         <h4 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">How it works:</h4>
    //         <ol className="text-xs lg:text-sm text-gray-700 space-y-1 list-decimal list-inside">
    //           <li>Select points package or enter custom amount</li>
    //           <li>Submit your request</li>
    //           <li>Admin will contact you for payment details</li>
    //           <li>Points added after payment confirmation</li>
    //         </ol>
    //       </div>
    //     </div>

    //     {/* Top-up History */}
    //     <div className="bg-white rounded-xl shadow-lg p-4 lg:p-6 border border-green-100">
    //       <h2 className="text-lg lg:text-xl font-semibold text-gray-900 mb-4 lg:mb-6">Top-up History</h2>

    //       {topupHistory.length === 0 ? (
    //         <div className="text-center py-6 lg:py-8">
    //           <div className="text-gray-400 text-4xl lg:text-6xl mb-3 lg:mb-4">
    //             <FaHistory className="mx-auto text-4xl lg:text-6xl" />
    //           </div>
    //           <h3 className="text-base lg:text-lg font-medium text-gray-900 mb-2">No top-ups yet</h3>
    //           <p className="text-gray-500 text-sm">Your top-up history will appear here.</p>
    //         </div>
    //       ) : (
    //         <div className="space-y-3 lg:space-y-4">
    //           {topupHistory.map((topup) => (
    //             <div key={topup._id} className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:border-green-300 transition-colors duration-200">
    //               <div className="flex items-center justify-between mb-2">
    //                 <div className="font-medium text-gray-900 text-sm">{topup.transactionId}</div>
    //                 {getStatusBadge(topup.status)}
    //               </div>
    //               <div className="flex justify-between items-center">
    //                 <div>
    //                   <div className="text-xs lg:text-sm text-gray-600">
    //                     Bank Transfer
    //                   </div>
    //                   <div className="text-xs text-gray-500">
    //                     {new Date(topup.requestedAt).toLocaleDateString()}
    //                   </div>
    //                 </div>
    //                 <div className="text-right">
    //                   <div className="text-base lg:text-lg font-bold text-green-600">+{topup.points} pts</div>
    //                   <div className="text-xs lg:text-sm text-gray-600">£{topup.amount}</div>
    //                 </div>
    //               </div>
    //               {topup.processedAt && (
    //                 <div className="text-xs text-gray-500 mt-2">
    //                   Processed: {new Date(topup.processedAt).toLocaleDateString()}
    //                 </div>
    //               )}
    //             </div>
    //           ))}
    //         </div>
    //       )}

    //       {/* Payment Information */}
    //       <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-gray-50 rounded-lg border border-gray-200">
    //         <h3 className="font-medium text-gray-900 mb-2 text-sm lg:text-base">Payment Methods</h3>
    //         <ul className="text-xs lg:text-sm text-gray-600 space-y-1">
    //           <li className="flex items-center">
    //             <FaMoneyBillWave className="text-green-500 mr-2 text-sm" />
    //             Bank Transfer (Preferred)
    //           </li>
    //           <li className="flex items-center">
    //             <FaPaypal className="text-blue-500 mr-2 text-sm" />
    //             PayPal
    //           </li>
    //           <li className="flex items-center">
    //             <FaCreditCard className="text-purple-500 mr-2 text-sm" />
    //             Credit/Debit Card
    //           </li>
    //         </ul>
    //         <div className="mt-3 text-xs text-gray-500">
    //           <p>Contact admin for payment details after request.</p>
    //           <p className="mt-1">Processing: 1-2 business days</p>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
    <div>
      will be Available soon
    </div>
  );
}