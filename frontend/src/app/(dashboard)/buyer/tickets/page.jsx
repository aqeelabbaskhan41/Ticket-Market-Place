'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FaTicketAlt, 
  FaCheckCircle, 
  FaClock,
  FaSearch,
  FaEye,
  FaDownload,
  FaInfo,
  FaCoins,
  FaExclamationTriangle,
  FaShieldAlt,
  FaMoneyBillWave,
  FaUserShield,
  FaTimesCircle,
  FaQuestionCircle
} from 'react-icons/fa';
import DeliveryDetailsModal from './DeliveryDetailsModal';

export default function MyTickets() {
  const router = useRouter();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Issue Reporting
  const [reportingIssue, setReportingIssue] = useState(null);
  const [issueData, setIssueData] = useState({
    category: '',
    description: '',
    urgency: 'medium'
  });

  // Delivery Details Modal
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedTicketForDelivery, setSelectedTicketForDelivery] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchPurchasedTickets();
  }, []);

  const fetchPurchasedTickets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tickets/buyer/purchased`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const reportIssue = async (ticketId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login again');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tickets/buyer/report-issue/${ticketId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(issueData)
      });

      const responseData = await response.json();

      if (response.ok) {
        alert(responseData.message || 'Issue reported successfully!');
        setReportingIssue(null);
        setIssueData({ category: '', description: '', urgency: 'medium' });
        fetchPurchasedTickets();
      } else {
        alert(responseData.message || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      alert('Error reporting issue');
    }
  };

  const startIssueReport = (ticket) => {
    setReportingIssue(ticket._id);
    setIssueData({ category: '', description: '', urgency: 'medium' });
  };

  const cancelIssueReport = () => {
    setReportingIssue(null);
    setIssueData({ category: '', description: '', urgency: 'medium' });
  };

  const openDeliveryDetails = (ticket) => {
    // Navigate to the detailed ticket page
    router.push(`/buyer/tickets/${ticket._id}`);
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = selectedStatus === 'all' || ticket.status === selectedStatus;
    const searchMatch = searchTerm === '' || 
      ticket.match?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.purchaseId?.toLowerCase().includes(searchTerm.toLowerCase());
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending_delivery: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending Delivery' },
      delivered: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: 'Delivered' },
      used: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Used' },
      cancelled: { color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Cancelled' },
      refunded: { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', label: 'Refunded' }
    };
    
    const config = statusConfig[status] || statusConfig.pending_delivery;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPointStatusBadge = (ticket) => {
    const config = {
      in_escrow: { 
        color: 'bg-purple-500/20 text-purple-300 border-purple-400/30', 
        label: ticket.daysUntilRelease > 0 
          ? `In Escrow • Releases in ${ticket.daysUntilRelease} days`
          : 'In Escrow • Releasing soon',
        icon: FaShieldAlt,
        tooltip: 'Your points are held securely and will be released to the seller 7 days after the match'
      },
      under_review: { 
        color: 'bg-orange-500/20 text-orange-300 border-orange-400/30', 
        label: 'Under Admin Review',
        icon: FaUserShield,
        tooltip: 'Issue reported - admin is reviewing your case'
      },
      refunded: { 
        color: 'bg-green-500/20 text-green-300 border-green-400/30', 
        label: 'Points Refunded',
        icon: FaMoneyBillWave,
        tooltip: 'Points have been refunded to your account'
      },
      completed: { 
        color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', 
        label: 'Points Released',
        icon: FaCheckCircle,
        tooltip: 'Points have been released to the seller'
      },
      partial_settlement: { 
        color: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30', 
        label: 'Partial Settlement',
        icon: FaCoins,
        tooltip: 'Partial settlement processed by admin'
      }
    };
    
    const statusConfig = config[ticket.pointStatus] || config.completed;
    const IconComponent = statusConfig.icon;
    
    return (
      <span 
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color} mt-1`}
        title={statusConfig.tooltip}
      >
        <IconComponent className="mr-1 text-xs" />
        {statusConfig.label}
      </span>
    );
  };

  const formatMatchDate = (dateString) => {
    if (!dateString) return 'Date not available';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  const getCommissionDisplay = (ticket) => {
    const commissionRate = ticket.commissionRate || 0;
    const commissionAmount = ticket.commission || 0;
    
    return {
      rate: commissionRate,
      amount: commissionAmount,
      displayText: `${commissionRate}%`
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading your tickets...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
            <FaTicketAlt className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Tickets</h1>
            <p className="text-blue-200 mt-1">Manage your purchased tickets and track point status</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Total Tickets</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {tickets.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center border border-blue-400/30">
              <FaTicketAlt className="text-blue-400 text-lg" />
            </div>
          </div>
        </div>
        {/* ... other stats similar to original ... */}
       <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm">Delivered</p>
              <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                {tickets.filter(t => t.status === 'delivered').length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center border border-green-400/30">
              <FaCheckCircle className="text-green-400 text-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <input
              type="text"
              placeholder="Search by match or purchase ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
          </div>
          
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="pending_delivery" className="text-gray-900">Pending Delivery</option>
              <option value="delivered" className="text-gray-900">Delivered</option>
              <option value="used" className="text-gray-900">Used</option>
              <option value="cancelled" className="text-gray-900">Cancelled</option>
              <option value="refunded" className="text-gray-900">Refunded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Grid */}
      {filteredTickets.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredTickets.map((ticket) => {
            const commissionInfo = getCommissionDisplay(ticket);
            
            return (
              <div key={ticket._id} className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 hover:border-blue-400/50 transition-all duration-300 p-4 sm:p-6">
                {/* Header */}
                 <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      {ticket.competitionImage && (
                        <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                          <img 
                            src={getImageUrl(ticket.competitionImage)} 
                            alt="Competition" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-white">{ticket.match}</h3>
                    </div>
                    <p className="text-blue-200 text-sm">{ticket.venue}</p>
                    {getPointStatusBadge(ticket)}
                  </div>
                  <div className="text-right">
                    {getStatusBadge(ticket.status)}
                    <div className="text-xs text-blue-300 mt-1">
                      {formatDate(ticket.purchaseDate)}
                    </div>
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-blue-300 text-sm">Purchase ID</span>
                    <span className="text-white text-sm font-medium">{ticket.purchaseId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300 text-sm">Seating</span>
                    <span className="text-white text-sm">{ticket.category} • {ticket.block}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-300 text-sm">Quantity</span>
                    <span className="text-white text-sm">{ticket.quantity} tickets</span>
                  </div>
                  <div className="flex justify-between text-xs">
                     <span className="text-blue-400">Method</span>
                     <span className="text-blue-300">{ticket.deliveryMethod}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-blue-200 font-semibold">Total Paid</span>
                    <span className="text-yellow-400 font-bold">{ticket.totalPaid} points</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4">
                  {ticket.status === 'delivered' && (
                    <button 
                      onClick={() => openDeliveryDetails(ticket)}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 text-green-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      {ticket.deliveryDetails?.type === 'E-Ticket (PDF)' ? <FaDownload /> : <FaEye />}
                      {ticket.deliveryDetails?.type === 'E-Ticket (PDF)' ? 'Download' : 'View Ticket'}
                    </button>
                  )}
                  {ticket.status === 'pending_delivery' && (
                    <button className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-400/30 text-yellow-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1">
                      <FaClock />
                      Awaiting Delivery
                    </button>
                  )}
                  {ticket.canReportIssue && (
                    <button 
                      onClick={() => startIssueReport(ticket)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-red-300 py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-1"
                    >
                      <FaExclamationTriangle />
                      Report Issue
                    </button>
                  )}
                </div>

                {/* Report Issue Modal */}
                {reportingIssue === ticket._id && (
                  <div className="mt-4 p-4 bg-red-500/10 border border-red-400/30 rounded-lg">
                    <h4 className="text-red-300 font-semibold mb-3 flex items-center gap-2">
                      <FaExclamationTriangle />
                      Report Ticket Issue
                    </h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-red-200 text-sm mb-1">Issue Type</label>
                        <select
                          value={issueData.category}
                          onChange={(e) => setIssueData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-red-500"
                        >
                          <option value="" className="text-gray-900">Select issue type</option>
                          <option value="invalid_qr" className="text-gray-900">Invalid QR Code</option>
                          <option value="duplicate_ticket" className="text-gray-900">Duplicate Ticket</option>
                          <option value="wrong_seats" className="text-gray-900">Wrong Seats/Block</option>
                          <option value="ticket_not_working" className="text-gray-900">Ticket Not Working</option>
                          <option value="seller_fraud" className="text-gray-900">Suspected Fraud</option>
                          <option value="other" className="text-gray-900">Other Issue</option>
                        </select>
                      </div>

                      <div>
                         <label className="block text-red-200 text-sm mb-1">Description</label>
                         <textarea
                            value={issueData.description}
                            onChange={(e) => setIssueData(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white text-sm"
                            rows="2"
                         />
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => reportIssue(ticket._id)}
                          disabled={!issueData.category || !issueData.description.trim()}
                          className="bg-red-500 hover:bg-red-600 disabled:bg-gray-500 text-white px-4 py-2 rounded text-sm transition-colors flex items-center gap-2"
                        >
                          Submit
                        </button>
                        <button
                          onClick={cancelIssueReport}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-400/30">
            <FaTicketAlt className="text-4xl text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">No tickets found</h3>
          <p className="text-blue-200 max-w-md mx-auto mb-6">
            You haven't purchased any tickets yet.
          </p>
        </div>
      )}

      <DeliveryDetailsModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        ticket={selectedTicketForDelivery}
      />
    </div>
  );
}