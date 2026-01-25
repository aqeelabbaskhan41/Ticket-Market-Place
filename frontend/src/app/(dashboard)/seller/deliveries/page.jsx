'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  FaBoxOpen, 
  FaCheckCircle, 
  FaClock, 
  FaSearch, 
  FaFilter,
  FaTruck,
  FaExclamationTriangle,
  FaEdit
} from 'react-icons/fa';
import DeliveryModal from '../sales/DeliveryModal'; // Reusing existing modal

export default function SellerDeliveries() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Delivery Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedTicketForDelivery, setSelectedTicketForDelivery] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

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

  // Auto-open modal from query params
  useEffect(() => {
    if (sales.length > 0) {
      const action = searchParams.get('action');
      const saleId = searchParams.get('saleId');

      if (action === 'deliver' && saleId) {
        const saleToDeliver = sales.find(s => s._id === saleId);
        // Allow re-uploading even if delivered, so check if it exists
        if (saleToDeliver) {
          openDeliveryModal(saleToDeliver);
          // Optional: clean up URL to prevent reopening on refresh
          // router.replace('/seller/deliveries', { scroll: false }); 
        }
      }
    }
  }, [sales, searchParams]);

  const openDeliveryModal = (sale) => {
    setSelectedTicketForDelivery(sale);
    setIsDeliveryModalOpen(true);
  };

  const handleDeliverTicket = async (ticketId, formData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/delivery/deliver/${ticketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        alert('Ticket delivery updated successfully!');
        fetchSales(); // Refresh the list
        setIsDeliveryModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to deliver ticket');
      }
    } catch (error) {
      console.error('Delivery error:', error);
      alert('Error delivering ticket');
    }
  };

  // Filter logic specific to deliveries
  const filteredSales = sales.filter(sale => {
    // We strictly only care about sales that need delivery or are delivered
    // Exclude 'cancelled' unless you want to show history
    if (sale.status === 'cancelled') return false;

    const statusMatch = selectedStatus === 'all' || sale.status === selectedStatus;
    
    // safe accessors
    const matchName = sale.match?.matchName || '';
    const purchaseId = sale.purchaseId || '';
    const term = searchTerm.toLowerCase();

    const searchMatch = 
      matchName.toLowerCase().includes(term) ||
      purchaseId.toLowerCase().includes(term);
      
    return statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const config = {
      pending_delivery: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending Delivery', icon: FaClock },
      delivered: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: 'Delivered', icon: FaCheckCircle },
      completed: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Completed', icon: FaCheckCircle },
    };
    
    const statusConfig = config[status] || config.pending_delivery;
    const Icon = statusConfig.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
        <Icon className="mr-1.5" />
        {statusConfig.label}
      </span>
    );
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
        <span className="ml-3 text-white">Loading deliveries...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
            <FaTruck className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Delivery Management</h1>
            <p className="text-blue-200 mt-1">Manage ticket uploads and transfers to buyers</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
         <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-blue-200 text-sm">Pending Deliveries</h3>
            <p className="text-2xl font-bold text-white mt-1">{sales.filter(s => s.status === 'pending_delivery').length}</p>
         </div>
         <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-blue-200 text-sm">Completed Deliveries</h3>
            <p className="text-2xl font-bold text-white mt-1">{sales.filter(s => s.status === 'delivered' || s.status === 'completed').length}</p>
         </div>
         <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <h3 className="text-blue-200 text-sm">Total Orders</h3>
            <p className="text-2xl font-bold text-white mt-1">{sales.length}</p>
         </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <input
              type="text"
              placeholder="Search by match or order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            />
          </div>
          <select
             value={selectedStatus}
             onChange={(e) => setSelectedStatus(e.target.value)}
             className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
          >
            <option value="all" className="text-gray-900">All Status</option>
            <option value="pending_delivery" className="text-gray-900">Pending Delivery</option>
            <option value="delivered" className="text-gray-900">Delivered/Completed</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filteredSales.map((sale) => (
          <div key={sale._id} className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-white/20 hover:border-blue-400/50 transition-colors">
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              
              {/* Info */}
              <div className="flex-1 flex items-center gap-4">
                {sale.competitionImage && (
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                    <img 
                      src={getImageUrl(sale.competitionImage)} 
                      alt="Competition" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{sale.match}</h3>
                    {getStatusBadge(sale.status)}
                  </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mt-2">
                   <div>
                     <p className="text-blue-300">Order ID</p>
                     <p className="text-white font-mono">{sale.purchaseId}</p>
                   </div>
                   <div>
                     <p className="text-blue-300">Quantity</p>
                     <p className="text-white">{sale.quantity} Tickets</p>
                   </div>
                   <div>
                     <p className="text-blue-300">Method</p>
                     <p className="text-white">{sale.deliveryMethod}</p>
                   </div>
                </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-6">
                {sale.status === 'pending_delivery' ? (
                  <button 
                    onClick={() => openDeliveryModal(sale)}
                    className="w-full lg:w-auto bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaBoxOpen /> Deliver Now
                  </button>
                ) : (
                  <button 
                    onClick={() => openDeliveryModal(sale)}
                    className="w-full lg:w-auto bg-white/5 hover:bg-white/10 text-blue-300 border border-white/20 py-2 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <FaEdit /> Edit / Re-upload
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredSales.length === 0 && (
           <div className="text-center py-10 text-blue-200">
             No deliveries found matching your filters.
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
