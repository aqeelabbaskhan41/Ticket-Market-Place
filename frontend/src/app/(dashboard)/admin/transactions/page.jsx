'use client';
import { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave, 
  FaChartBar, 
  FaCheckCircle, 
  FaClock,
  FaTimesCircle,
  FaHistory,
  FaSearch,
  FaEye,
  FaCheck,
  FaTimes,
  FaBuilding,
  FaUser,
  FaWallet
} from 'react-icons/fa';

export default function AdminWithdrawals() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/withdrawals/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals || []);
      } else {
        console.error('Failed to fetch withdrawals');
        setWithdrawals([]);
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      setWithdrawals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId) => {
    if (!confirm('Are you sure you want to approve this withdrawal request?')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/withdrawals/${withdrawalId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          adminNotes: 'Withdrawal approved by admin'
        })
      });

      if (response.ok) {
        alert('Withdrawal approved successfully!');
        fetchWithdrawals(); // Refresh the list
        setShowDetailsModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve withdrawal');
      }
    } catch (error) {
      console.error('Error approving withdrawal:', error);
      alert('Error approving withdrawal request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (withdrawalId) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/withdrawals/${withdrawalId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejectionReason: reason
        })
      });

      if (response.ok) {
        alert('Withdrawal rejected successfully!');
        fetchWithdrawals(); // Refresh the list
        setShowDetailsModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject withdrawal');
      }
    } catch (error) {
      console.error('Error rejecting withdrawal:', error);
      alert('Error rejecting withdrawal request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (withdrawalId) => {
    if (!confirm('Mark this withdrawal as completed? This indicates the payment has been sent to the seller.')) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/withdrawals/${withdrawalId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Withdrawal marked as completed!');
        fetchWithdrawals(); // Refresh the list
        setShowDetailsModal(false);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to complete withdrawal');
      }
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      alert('Error completing withdrawal');
    } finally {
      setActionLoading(false);
    }
  };

  const viewWithdrawalDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowDetailsModal(true);
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="mr-1 h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => {
    const statusMatch = selectedStatus === 'all' || withdrawal.status === selectedStatus;
    const searchMatch = 
      withdrawal.seller?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.seller?.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      withdrawal.bankDetails?.bankName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return statusMatch && (searchTerm === '' || searchMatch);
  });

  // Calculate stats
  const stats = {
    total: withdrawals.length,
    pending: withdrawals.filter(w => w.status === 'pending').length,
    approved: withdrawals.filter(w => w.status === 'approved').length,
    completed: withdrawals.filter(w => w.status === 'completed').length,
    totalAmount: withdrawals.reduce((sum, w) => sum + w.amount, 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading withdrawals...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawal Management</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Manage seller withdrawal requests and approvals</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaMoneyBillWave className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Requests</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaCheckCircle className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Approved</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaChartBar className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{stats.totalAmount.toLocaleString()} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">Search</label>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300" />
              <input
                type="text"
                placeholder="Search by seller or bank..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-white mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/10">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Seller
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Bank Details
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 divide-y divide-white/10">
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="hover:bg-white/10 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {withdrawal.seller?.profile?.name || withdrawal.seller?.email || 'Unknown Seller'}
                    </div>
                    <div className="text-xs text-blue-200">
                      {withdrawal.seller?.email}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white">
                    <div>{withdrawal.bankDetails?.bankName}</div>
                    <div className="text-blue-200 text-xs">
                      ****{withdrawal.bankDetails?.accountNumber?.slice(-4)}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-white">
                      {withdrawal.amount?.toLocaleString()} pts
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(withdrawal.status)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                    {new Date(withdrawal.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => viewWithdrawalDetails(withdrawal)}
                        className="text-blue-300 hover:text-blue-200 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center border border-blue-400/30"
                      >
                        <FaEye className="mr-1" />
                        View
                      </button>
                      {withdrawal.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(withdrawal._id)}
                            disabled={actionLoading}
                            className="text-green-300 hover:text-green-200 bg-green-500/20 hover:bg-green-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center border border-green-400/30 disabled:opacity-50"
                          >
                            <FaCheck className="mr-1" />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(withdrawal._id)}
                            disabled={actionLoading}
                            className="text-red-300 hover:text-red-200 bg-red-500/20 hover:bg-red-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center border border-red-400/30 disabled:opacity-50"
                          >
                            <FaTimes className="mr-1" />
                            Reject
                          </button>
                        </>
                      )}
                      {withdrawal.status === 'approved' && (
                        <button 
                          onClick={() => handleComplete(withdrawal._id)}
                          disabled={actionLoading}
                          className="text-purple-300 hover:text-purple-200 bg-purple-500/20 hover:bg-purple-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center border border-purple-400/30 disabled:opacity-50"
                        >
                          <FaCheckCircle className="mr-1" />
                          Complete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWithdrawals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-blue-400 mb-4">
              <FaMoneyBillWave className="mx-auto h-16 w-16" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No withdrawal requests found</h3>
            <p className="text-blue-200">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>

      {/* Withdrawal Details Modal */}
      {showDetailsModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 w-full max-w-2xl">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-bold text-white">Withdrawal Details</h3>
              <p className="text-blue-200 text-sm mt-1">Request ID: {selectedWithdrawal._id}</p>
            </div>

            <div className="p-6 space-y-4">
              {/* Seller Info */}
              <div>
                <h4 className="text-white font-medium mb-2">Seller Information</h4>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <p className="text-white">
                    <strong>Name:</strong> {selectedWithdrawal.seller?.profile?.name || 'Not provided'}
                  </p>
                  <p className="text-blue-200">
                    <strong>Email:</strong> {selectedWithdrawal.seller?.email}
                  </p>
                </div>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-white font-medium mb-2">Bank Details</h4>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <p className="text-white">
                    <strong>Bank:</strong> {selectedWithdrawal.bankDetails?.bankName}
                  </p>
                  <p className="text-white">
                    <strong>Account Number:</strong> {selectedWithdrawal.bankDetails?.accountNumber}
                  </p>
                  <p className="text-white">
                    <strong>Account Holder:</strong> {selectedWithdrawal.bankDetails?.accountHolderName}
                  </p>
                  {selectedWithdrawal.bankDetails?.ifscCode && (
                    <p className="text-blue-200">
                      <strong>IFSC Code:</strong> {selectedWithdrawal.bankDetails.ifscCode}
                    </p>
                  )}
                  {selectedWithdrawal.bankDetails?.branch && (
                    <p className="text-blue-200">
                      <strong>Branch:</strong> {selectedWithdrawal.bankDetails.branch}
                    </p>
                  )}
                </div>
              </div>

              {/* Withdrawal Info */}
              <div>
                <h4 className="text-white font-medium mb-2">Withdrawal Information</h4>
                <div className="bg-white/10 rounded-lg p-3 border border-white/20">
                  <p className="text-white">
                    <strong>Amount:</strong> {selectedWithdrawal.amount?.toLocaleString()} points
                  </p>
                  <p className="text-white">
                    <strong>Status:</strong> {getStatusBadge(selectedWithdrawal.status)}
                  </p>
                  <p className="text-blue-200">
                    <strong>Request Date:</strong> {new Date(selectedWithdrawal.createdAt).toLocaleString()}
                  </p>
                  {selectedWithdrawal.rejectionReason && (
                    <p className="text-red-300">
                      <strong>Rejection Reason:</strong> {selectedWithdrawal.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/20 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-white/20 text-white rounded-lg hover:bg-white/10 transition-colors"
              >
                Close
              </button>
              {selectedWithdrawal.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleApprove(selectedWithdrawal._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 font-semibold rounded-lg transition-all duration-200 border border-green-400/30 disabled:opacity-50"
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleReject(selectedWithdrawal._id)}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold rounded-lg transition-all duration-200 border border-red-400/30 disabled:opacity-50"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                </>
              )}
              {selectedWithdrawal.status === 'approved' && (
                <button
                  onClick={() => handleComplete(selectedWithdrawal._id)}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-semibold rounded-lg transition-all duration-200 border border-purple-400/30 disabled:opacity-50"
                >
                  {actionLoading ? 'Completing...' : 'Mark as Completed'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}