'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaMoneyBillWave, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaHistory,
  FaPlus,
  FaArrowRight,
  FaWallet,
  FaUser,
  FaCreditCard,
  FaBuilding
} from 'react-icons/fa';

export default function SellerWithdraw() {
  const router = useRouter();
  const [withdrawals, setWithdrawals] = useState([]);
  const [availablePoints, setAvailablePoints] = useState(0);
  const [pendingPoints, setPendingPoints] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    bankDetails: {
      bankName: '',
      accountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      branch: ''
    }
  });
  const [submitting, setSubmitting] = useState(false);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchWithdrawalData();
  }, []);

  const fetchWithdrawalData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log('Fetching withdrawal data...');

      // Fetch seller's points from sales data
      const salesRes = await fetch(`${API_BASE_URL}/tickets/seller/sales`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (salesRes.ok) {
        const salesData = await salesRes.json();
        console.log('Sales API response:', salesData);
        
        // Use the correct stats from the API
        setAvailablePoints(salesData.stats?.availablePoints || 0);
        setPendingPoints(salesData.stats?.pendingPoints || 0);
        setTotalPoints(salesData.stats?.totalPoints || 0);
        
        console.log('Points set:', {
          available: salesData.stats?.availablePoints,
          pending: salesData.stats?.pendingPoints,
          total: salesData.stats?.totalPoints
        });
      } else {
        console.error('Failed to fetch sales data');
        // Set default values if API fails
        setAvailablePoints(0);
        setPendingPoints(0);
        setTotalPoints(0);
      }

      // Fetch withdrawal history
      try {
        const withdrawalsRes = await fetch(`${API_BASE_URL}/withdrawals/my-withdrawals`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (withdrawalsRes.ok) {
          const withdrawalsData = await withdrawalsRes.json();
          setWithdrawals(withdrawalsData.withdrawals || []);
          console.log('Withdrawals fetched:', withdrawalsData.withdrawals?.length || 0);
        } else {
          console.log('Withdrawals API returned error');
          setWithdrawals([]);
        }
      } catch (withdrawalError) {
        console.log('Withdrawals API not available yet, continuing without withdrawal history');
        setWithdrawals([]);
      }

    } catch (error) {
      console.error('Error fetching withdrawal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || formData.amount <= 0) {
      alert('Please enter a valid withdrawal amount');
      return;
    }

    if (formData.amount > availablePoints) {
      alert(`Insufficient points. You have ${availablePoints} points available.`);
      return;
    }

    if (!formData.bankDetails.bankName || !formData.bankDetails.accountNumber || !formData.bankDetails.accountHolderName) {
      alert('Please fill in all required bank details');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/withdrawals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: parseInt(formData.amount),
          bankDetails: formData.bankDetails
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Withdrawal request submitted successfully!');
        setShowWithdrawForm(false);
        setFormData({
          amount: '',
          bankDetails: {
            bankName: '',
            accountNumber: '',
            accountHolderName: '',
            ifscCode: '',
            branch: ''
          }
        });
        fetchWithdrawalData(); // Refresh data
      } else {
        alert(result.message || 'Failed to submit withdrawal request');
      }
    } catch (error) {
      console.error('Error submitting withdrawal:', error);
      alert('Error submitting withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', 
        label: 'Pending',
        icon: FaClock
      },
      approved: { 
        color: 'bg-green-500/20 text-green-300 border-green-400/30', 
        label: 'Approved',
        icon: FaCheckCircle
      },
      rejected: { 
        color: 'bg-red-500/20 text-red-300 border-red-400/30', 
        label: 'Rejected',
        icon: FaTimesCircle
      },
      completed: { 
        color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', 
        label: 'Completed',
        icon: FaCheckCircle
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="mr-1 text-xs" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading withdrawal data...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Points</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Convert your points to cash through bank transfer</p>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Available Points */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaWallet className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Available Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{availablePoints.toLocaleString()} pts</p>
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
              <p className="text-xl sm:text-2xl font-bold text-white">{pendingPoints.toLocaleString()} pts</p>
            </div>
          </div>
        </div>

        {/* Total Points */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaMoneyBillWave className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{totalPoints.toLocaleString()} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Points Summary */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-400/30 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Points Summary</h3>
            <p className="text-3xl font-bold text-white">{totalPoints.toLocaleString()} points</p>
            <p className="text-blue-200 text-sm mt-1">Lifetime earnings from ticket sales</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3 border border-white/20">
            <p className="text-green-400 text-sm font-semibold">{availablePoints.toLocaleString()} points available for withdrawal</p>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Request Withdrawal</h3>
            <p className="text-blue-200 text-sm">
              Convert your available points to cash. Withdrawal requests are processed within 2-3 business days.
            </p>
            <p className="text-yellow-300 text-xs mt-2">
              💡 <strong>Note:</strong> Only points from completed sales are available for withdrawal.
            </p>
          </div>
          <button
            onClick={() => setShowWithdrawForm(true)}
            disabled={availablePoints === 0}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 border border-blue-400/30"
          >
            <FaPlus className="text-sm" />
            New Withdrawal Request
          </button>
        </div>
      </div>

      {/* Withdrawal Form Modal */}
      {showWithdrawForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-md">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">Withdrawal Request</h3>
              <p className="text-blue-200 text-sm mt-1">Available: {availablePoints.toLocaleString()} points</p>
            </div>

            <form onSubmit={handleWithdrawSubmit} className="p-6">
              {/* Amount */}
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2">
                  Amount to Withdraw (Points)
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="Enter amount"
                  min="1"
                  max={availablePoints}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                  required
                />
                <p className="text-blue-200 text-xs mt-1">
                  Max: {availablePoints.toLocaleString()} points
                </p>
              </div>

              {/* Bank Details */}
              <div className="space-y-4">
                <h4 className="text-white font-medium border-b border-white/20 pb-2">Bank Details</h4>
                
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Bank Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, bankName: e.target.value }
                    })}
                    placeholder="Enter bank name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Account Number *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountNumber: e.target.value }
                    })}
                    placeholder="Enter account number"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Account Holder Name *
                  </label>
                  <input
                    type="text"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) => setFormData({
                      ...formData,
                      bankDetails: { ...formData.bankDetails, accountHolderName: e.target.value }
                    })}
                    placeholder="Enter account holder name"
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.ifscCode}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, ifscCode: e.target.value }
                      })}
                      placeholder="IFSC Code"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Branch
                    </label>
                    <input
                      type="text"
                      value={formData.bankDetails.branch}
                      onChange={(e) => setFormData({
                        ...formData,
                        bankDetails: { ...formData.bankDetails, branch: e.target.value }
                      })}
                      placeholder="Branch name"
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowWithdrawForm(false)}
                  className="flex-1 px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 text-white font-semibold rounded-lg transition-all duration-200"
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdrawal History */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-white">Withdrawal History</h2>
          <div className="flex items-center gap-2 text-blue-300">
            <FaHistory className="text-sm" />
            <span className="text-sm">Recent Requests</span>
          </div>
        </div>

        {withdrawals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <FaMoneyBillWave className="text-2xl text-blue-400" />
            </div>
            <p className="text-blue-200 text-sm sm:text-base">No withdrawal requests yet</p>
            <p className="text-blue-300 text-xs sm:text-sm mt-1">
              Start by creating your first withdrawal request
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal._id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    withdrawal.status === 'completed' ? 'bg-green-500/20 border-green-400/30' :
                    withdrawal.status === 'approved' ? 'bg-blue-500/20 border-blue-400/30' :
                    withdrawal.status === 'rejected' ? 'bg-red-500/20 border-red-400/30' :
                    'bg-yellow-500/20 border-yellow-400/30'
                  }`}>
                    <FaBuilding className={
                      withdrawal.status === 'completed' ? 'text-green-400 text-xs' :
                      withdrawal.status === 'approved' ? 'text-blue-400 text-xs' :
                      withdrawal.status === 'rejected' ? 'text-red-400 text-xs' :
                      'text-yellow-400 text-xs'
                    } />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      {withdrawal.amount?.toLocaleString()} points
                    </p>
                    <p className="text-blue-200 text-xs">
                      {withdrawal.bankDetails?.bankName} • {withdrawal.bankDetails?.accountNumber?.slice(-4)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(withdrawal.status)}
                    <p className="text-white font-semibold text-sm">
                      {withdrawal.amount?.toLocaleString()} pts
                    </p>
                  </div>
                  <p className="text-blue-300 text-xs">
                    {formatDate(withdrawal.createdAt)}
                  </p>
                  {withdrawal.rejectionReason && (
                    <p className="text-red-300 text-xs mt-1">
                      Reason: {withdrawal.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}