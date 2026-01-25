"use client";

import { useState, useEffect } from 'react';
import {
  FaExclamationTriangle,
  FaSearch,
  FaFilter,
  FaClock,
  FaBalanceScale,
  FaCheckCircle,
  FaMoneyBillWave,
  FaCoins,
  FaUser,
  FaTicketAlt,
  FaCalendarAlt
} from "react-icons/fa";

export default function DisputesManagement() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [resolvingDispute, setResolvingDispute] = useState(null);
  const [resolutionData, setResolutionData] = useState({
    decision: '',
    notes: '',
    penaltyAmount: 0,
    buyerRefund: 0,
    sellerPayout: 0
  });
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/tickets/admin/disputes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Ensure all disputes have safe default values
          const safeDisputes = (data.disputes || []).map(dispute => ({
            transactionId: dispute.transactionId || 'N/A',
            match: dispute.match || 'Match not found',
            venue: dispute.venue || 'Venue not available',
            category: dispute.category || 'N/A',
            blockArea: dispute.blockArea || 'N/A',
            buyerName: dispute.buyerName || 'Unknown Buyer',
            sellerName: dispute.sellerName || 'Unknown Seller',
            totalPrice: dispute.totalPrice || 0,
            commission: dispute.commission || 0,
            totalCost: dispute.totalCost || 0,
            quantity: dispute.quantity || 1,
            status: dispute.status || 'under_review',
            issueDescription: dispute.issueDescription || 'No description provided',
            purchaseDate: dispute.purchaseDate,
            adminDecision: dispute.adminDecision || null
          }));
          setDisputes(safeDisputes);
        }
      }
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveDispute = async (transactionId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/tickets/admin/resolve-dispute/${transactionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resolutionData)
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message);
        setResolvingDispute(null);
        setResolutionData({
          decision: '',
          notes: '',
          penaltyAmount: 0,
          buyerRefund: 0,
          sellerPayout: 0
        });
        fetchDisputes(); // Refresh data
      } else {
        alert('Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      alert('Error resolving dispute');
    }
  };

  const startResolution = (dispute) => {
    setResolvingDispute(dispute.transactionId);
    setResolutionData({
      decision: '',
      notes: '',
      penaltyAmount: 0,
      buyerRefund: 0,
      sellerPayout: 0
    });
  };

  const calculateAutoValues = (dispute, decision) => {
    if (!dispute) return;

    const totalCost = dispute.totalCost || 0;
    const totalPrice = dispute.totalPrice || 0;

    switch (decision) {
      case 'approve_sale':
        setResolutionData(prev => ({
          ...prev,
          buyerRefund: 0,
          sellerPayout: totalPrice
        }));
        break;
      case 'approve_refund':
        setResolutionData(prev => ({
          ...prev,
          buyerRefund: totalCost,
          sellerPayout: 0
        }));
        break;
      case 'partial':
        // Default 50/50 split
        const buyerRefund = Math.floor(totalCost * 0.5);
        const sellerPayout = Math.floor(totalPrice * 0.5);
        setResolutionData(prev => ({
          ...prev,
          buyerRefund,
          sellerPayout
        }));
        break;
      default:
        setResolutionData(prev => ({
          ...prev,
          buyerRefund: 0,
          sellerPayout: 0
        }));
    }
  };

  const filteredDisputes = disputes.filter(dispute => {
    const statusMatch = selectedStatus === 'all' || dispute.status === selectedStatus;
    const searchMatch = searchTerm === '' || 
      (dispute.match?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (dispute.buyerName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (dispute.sellerName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      under_review: { 
        color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', 
        label: 'Under Review',
        icon: FaClock
      },
      completed: { 
        color: 'bg-green-500/20 text-green-300 border-green-400/30', 
        label: 'Resolved',
        icon: FaCheckCircle
      },
      refunded: { 
        color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', 
        label: 'Refunded',
        icon: FaMoneyBillWave
      },
      partial_settlement: { 
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30', 
        label: 'Partial Settlement',
        icon: FaCoins
      }
    };
    
    const config = statusConfig[status] || statusConfig.under_review;
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="mr-1 text-xs" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB');
    } catch {
      return 'Invalid Date';
    }
  };

  // Safe function to format admin decision
  const formatAdminDecision = (adminDecision) => {
    if (!adminDecision || !adminDecision.decision) return 'No decision';
    return adminDecision.decision.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading disputes...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
            <FaBalanceScale className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Dispute Management</h1>
            <p className="text-blue-200 mt-1">Review and resolve reported ticket issues</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-orange-400/30">
              <FaExclamationTriangle className="text-lg sm:text-xl text-orange-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending Disputes</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {disputes.filter(d => d.status === 'under_review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaCheckCircle className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Resolved</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {disputes.filter(d => d.status !== 'under_review').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaMoneyBillWave className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Refunded</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {disputes.filter(d => d.status === 'refunded').reduce((sum, d) => sum + (d.totalCost || 0), 0)} pts
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaCoins className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Commission Held</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {disputes.filter(d => d.status === 'under_review').reduce((sum, d) => sum + (d.commission || 0), 0)} pts
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-200 mb-2">Filter by Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="under_review" className="text-gray-900">Under Review</option>
              <option value="completed" className="text-gray-900">Completed</option>
              <option value="refunded" className="text-gray-900">Refunded</option>
              <option value="partial_settlement" className="text-gray-900">Partial Settlement</option>
            </select>
          </div>
          
          <div className="flex-1">
            <label className="block text-sm font-medium text-blue-200 mb-2">Search Disputes</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by match, buyer, or seller..."
                className="w-full px-4 py-2.5 pl-10 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition placeholder-blue-200"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Disputes Grid */}
      {filteredDisputes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredDisputes.map((dispute) => (
            <div key={dispute.transactionId} className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:border-orange-400/50 transition-all duration-300 p-4 sm:p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{dispute.match}</h3>
                  <p className="text-blue-200 text-sm">{dispute.venue}</p>
                  {getStatusBadge(dispute.status)}
                </div>
                <div className="text-right">
                  <div className="text-yellow-400 font-bold text-lg">{dispute.totalCost} pts</div>
                  <div className="text-xs text-blue-300 mt-1">
                    {formatDate(dispute.purchaseDate)}
                  </div>
                </div>
              </div>

              {/* Dispute Details */}
              <div className="space-y-3 mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-300 text-sm">Buyer</p>
                    <p className="text-white text-sm font-medium">{dispute.buyerName}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Seller</p>
                    <p className="text-white text-sm font-medium">{dispute.sellerName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-300 text-sm">Category</p>
                    <p className="text-white text-sm">{dispute.category}</p>
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">Block/Area</p>
                    <p className="text-white text-sm">{dispute.blockArea}</p>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-300">Ticket Price:</p>
                      <p className="text-white">{dispute.totalPrice} pts</p>
                    </div>
                    <div>
                      <p className="text-blue-300">Commission:</p>
                      <p className="text-white">{dispute.commission} pts</p>
                    </div>
                    <div className="col-span-2 border-t border-blue-400/20 pt-2">
                      <p className="text-blue-200 font-semibold">Total Paid:</p>
                      <p className="text-yellow-400 font-bold">{dispute.totalCost} pts</p>
                    </div>
                  </div>
                </div>

                {/* Issue Description */}
                {dispute.issueDescription && dispute.issueDescription !== 'No description provided' && (
                  <div className="bg-orange-500/10 border border-orange-400/20 rounded-lg p-3">
                    <p className="text-orange-300 text-sm font-semibold mb-1">Reported Issue:</p>
                    <p className="text-orange-200 text-sm">{dispute.issueDescription}</p>
                  </div>
                )}

                {/* Admin Decision (if resolved) */}
                {dispute.adminDecision && (
                  <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-3">
                    <p className="text-green-300 text-sm font-semibold mb-1">Admin Decision:</p>
                    <p className="text-green-200 text-sm capitalize">
                      {formatAdminDecision(dispute.adminDecision)}
                    </p>
                    {dispute.adminDecision.notes && (
                      <p className="text-green-200 text-sm mt-1">Notes: {dispute.adminDecision.notes}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {dispute.status === 'under_review' && (
                <div className="flex space-x-2 mt-4">
                  <button 
                    onClick={() => startResolution(dispute)}
                    className="flex-1 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-400/30 text-orange-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                  >
                    <FaBalanceScale />
                    Resolve Dispute
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-400/30">
            <FaBalanceScale className="text-4xl text-orange-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No disputes found</h3>
          <p className="text-blue-200 max-w-md mx-auto mb-6">
            {selectedStatus === 'all' && searchTerm === ''
              ? "No disputes have been reported yet."
              : `No disputes found matching your ${selectedStatus !== 'all' ? 'status filter' : ''}${selectedStatus !== 'all' && searchTerm !== '' ? ' and ' : ''}${searchTerm !== '' ? 'search' : ''}.`
            }
          </p>
        </div>
      )}

      {/* Resolution Modal */}
      {resolvingDispute && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Resolve Dispute</h3>
            
            <div className="space-y-4">
              {/* Decision Selection */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Resolution Decision</label>
                <select
                  value={resolutionData.decision}
                  onChange={(e) => {
                    setResolutionData(prev => ({ ...prev, decision: e.target.value }));
                    const dispute = disputes.find(d => d.transactionId === resolvingDispute);
                    calculateAutoValues(dispute, e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="text-gray-900">Select Decision</option>
                  <option value="approve_sale" className="text-gray-900">Approve Sale (Points to Seller)</option>
                  <option value="approve_refund" className="text-gray-900">Approve Refund (Points to Buyer)</option>
                  <option value="partial" className="text-gray-900">Partial Settlement</option>
                </select>
              </div>

              {/* Partial Settlement Fields */}
              {resolutionData.decision === 'partial' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Buyer Refund (points)</label>
                    <input
                      type="number"
                      value={resolutionData.buyerRefund}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, buyerRefund: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Seller Payout (points)</label>
                    <input
                      type="number"
                      value={resolutionData.sellerPayout}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, sellerPayout: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-1">Penalty Amount (points)</label>
                    <input
                      type="number"
                      value={resolutionData.penaltyAmount}
                      onChange={(e) => setResolutionData(prev => ({ ...prev, penaltyAmount: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-blue-200 mb-2">Resolution Notes</label>
                <textarea
                  value={resolutionData.notes}
                  onChange={(e) => setResolutionData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about your decision..."
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                  rows="3"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setResolvingDispute(null)}
                className="flex-1 py-2.5 px-4 bg-gray-600/50 hover:bg-gray-600/70 text-gray-200 rounded-lg font-medium transition-all duration-200 border border-gray-500/30 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => resolveDispute(resolvingDispute)}
                disabled={!resolutionData.decision}
                className="flex-1 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                <FaCheckCircle size={14} />
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}