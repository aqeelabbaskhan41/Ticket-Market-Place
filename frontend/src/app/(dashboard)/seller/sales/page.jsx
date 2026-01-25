'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  FaCoins, 
  FaClock, 
  FaTicketAlt, 
  FaChartBar,
  FaSearch,
  FaCalendar,
  FaEye,
  FaHandshake,
  FaFilter,
  FaPaperPlane
} from 'react-icons/fa';
import DeliveryModal from './DeliveryModal';

export default function SalesHistory() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedTicketForDelivery, setSelectedTicketForDelivery] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Ensure we hit the correct endpoint. If your backend is at localhost:5000/api
      // make sure NEXT_PUBLIC_API_BASE_URL is set correctly.
      const response = await fetch(`${API_BASE_URL}/tickets/seller/sales`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSales(data.sales || []);
      }
    } catch (error) {
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDeliveryModal = (sale) => {
    // Determine the delivery method from the sold ticket
    // If it's missing, you might want to fetch the original listing details, 
    // but typically it should be on the sold ticket record.
    setSelectedTicketForDelivery(sale);
    setIsDeliveryModalOpen(true);
  };

  // Auto-open modal from query params
  // Auto-open modal from query params
  useEffect(() => {
    if (sales.length > 0) {
      const action = searchParams.get('action');
      const saleId = searchParams.get('saleId');

      if (action === 'deliver' && saleId) {
        const saleToDeliver = sales.find(s => s._id === saleId);
        if (saleToDeliver && saleToDeliver.status === 'pending_delivery') {
          openDeliveryModal(saleToDeliver);
          // clean up URL
          // router.replace('/seller/sales', { scroll: false }); 
        }
      }
    }
  }, [sales, searchParams]);

  const handleDeliverTicket = async (ticketId, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/delivery/deliver/${ticketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData // Content-Type is set automatically for FormData
      });

      if (response.ok) {
        alert('Ticket delivered successfully!');
        fetchSales(); // Refresh the list
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to deliver ticket');
      }
    } catch (error) {
      console.error('Delivery error:', error);
      alert('Error delivering ticket');
    }
  };

  const filteredSales = sales.filter(sale => 
    (selectedStatus === 'all' || sale.status === selectedStatus) &&
    (sale.match.matchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sale.buyer?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     sale.purchaseId?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      delivered: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: 'Delivered' },
      pending_delivery: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending Delivery' },
      disputed: { color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Disputed' },
      cancelled: { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', label: 'Cancelled' },
      completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Completed' }
    };
    
    // Default to pending_delivery if status unknown
    const config = statusConfig[status] || statusConfig.pending_delivery;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getTotalEarnings = () => {
    return sales
      .filter(s => s.status === 'delivered' || s.status === 'completed')
      .reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);
  };

  const getPendingEarnings = () => {
    return sales
      .filter(s => s.status === 'pending_delivery')
      .reduce((acc, sale) => acc + (sale.price * sale.quantity), 0);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_BASE_URL.replace('/api', '');
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading sales history...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Sales History</h1>
        <p className="text-blue-200 mt-1 sm:mt-2">Track your ticket sales and earnings</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Earnings */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaCoins className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {getTotalEarnings()} pts
              </p>
            </div>
          </div>
        </div>

        {/* Pending Release */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending Release</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {getPendingEarnings()} pts
              </p>
            </div>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaTicketAlt className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Sales</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {sales.length}
              </p>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaChartBar className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Success Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {sales.length > 0 ? Math.round((sales.filter(s => s.status === 'delivered').length / sales.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <input
              type="text"
              placeholder="Search sales, buyers, or sale ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="delivered" className="text-gray-900">Delivered</option>
              <option value="pending_delivery" className="text-gray-900">Pending Delivery</option>
              <option value="disputed" className="text-gray-900">Disputed</option>
              <option value="cancelled" className="text-gray-900">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Sale Details
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Buyer
                </th>
                <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Points
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
            <tbody className="divide-y divide-white/20">
              {filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {sale.competitionImage && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-white/10">
                          <img 
                            src={getImageUrl(sale.competitionImage)} 
                            alt="Competition" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-white">{sale.purchaseId}</div>
                        <div className="text-sm text-blue-200">{sale.match || 'Unknown Match'}</div>
                        <div className="text-xs text-blue-300">{sale.quantity} tickets • {sale.deliveryMethod}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white">
                    {sale.buyer?.username || 'Unknown Buyer'}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                    <div className="text-white">Total: {sale.price * sale.quantity} pts</div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(sale.status)}
                    {/* Additional status info can go here */}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white">
                    {new Date(sale.purchaseDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                       {sale.status === 'pending_delivery' && (
                        <button 
                          onClick={() => openDeliveryModal(sale)}
                          className="text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 px-3 py-1 rounded-lg text-xs font-medium transition-all shadow-md flex items-center gap-1"
                        >
                          <FaPaperPlane className="text-xs" />
                          Deliver
                        </button>
                      )}
                      <button className="text-blue-300 hover:text-blue-200 bg-blue-500/20 hover:bg-blue-500/30 px-3 py-1 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1 border border-blue-400/30">
                        <FaEye className="text-xs" />
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
              <FaCoins className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No sales found</h3>
            <p className="text-blue-200">You haven't made any sales yet. Start by creating listings.</p>
          </div>
        )}
      </div>

      <DeliveryModal 
        isOpen={isDeliveryModalOpen}
        onClose={() => setIsDeliveryModalOpen(false)}
        ticket={selectedTicketForDelivery}
        onDeliver={handleDeliverTicket}
      />
    </div>
  );
}