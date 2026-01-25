'use client';

import { useState, useEffect } from 'react';
import { 
  FaTicketAlt, 
  FaSearch, 
  FaFilter, 
  FaCalendar, 
  FaMapMarkerAlt, 
  FaChevronRight,
  FaDownload,
  FaCheckCircle,
  FaClock,
  FaExclamationCircle
} from 'react-icons/fa';
import Link from 'next/link';

export default function MyOrders() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/tickets/buyer/purchased`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTickets(data.tickets || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      delivered: 'bg-green-500/20 text-green-300 border-green-500/30',
      pending_delivery: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      cancelled: 'bg-red-500/20 text-red-300 border-red-500/30',
      used: 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    };
    
    const labels = {
      delivered: 'Delivered',
      pending_delivery: 'Pending Delivery',
      cancelled: 'Cancelled',
      used: 'Used'
    };

    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.pending_delivery}`}>
        {labels[status] || status}
      </span>
    );
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesSearch = 
      ticket.match.toLowerCase().includes(searchTerm.toLowerCase()) || 
      ticket.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.purchaseId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">My Orders</h1>
        <p className="text-blue-200 mt-1">Manage and access your purchased tickets</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300" />
          <input
            type="text"
            placeholder="Search matches, venues, or Order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-blue-300/50 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <FaFilter className="text-blue-300" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors [&>option]:bg-[#1a1f2e]"
          >
            <option value="all">All Orders</option>
            <option value="pending_delivery">Pending Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <FaTicketAlt className="mx-auto text-4xl text-blue-500/30 mb-4" />
            <h3 className="text-xl font-medium text-white">No tickets found</h3>
            <p className="text-blue-200 mt-2">You haven't purchased any tickets yet.</p>
            <Link href="/matches" className="inline-block mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors">
              Browse Matches
            </Link>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div key={ticket._id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 overflow-hidden hover:border-blue-500/30 transition-all duration-300 group">
              <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                {/* Date Box */}
                <div className="flex-shrink-0">
                  <div className="w-full sm:w-20 sm:h-20 bg-blue-500/10 rounded-xl border border-blue-500/20 flex flex-row sm:flex-col items-center justify-center p-3 sm:p-0 gap-3 sm:gap-0">
                    <span className="text-blue-300 font-medium text-sm uppercase">
                      {new Date(ticket.purchaseDate).toLocaleString('default', { month: 'short' })}
                    </span>
                    <span className="text-white font-bold text-xl sm:text-2xl">
                      {new Date(ticket.purchaseDate).getDate()}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                      {ticket.match}
                    </h3>
                    {getStatusBadge(ticket.status)}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200">
                    <div className="flex items-center gap-1.5">
                      <FaMapMarkerAlt className="text-blue-400" />
                      {ticket.venue}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <FaTicketAlt className="text-blue-400" />
                      {ticket.quantity} Ticket{ticket.quantity > 1 ? 's' : ''}
                    </div>
                    <div className="hidden sm:block w-1 h-1 bg-blue-500/30 rounded-full" />
                    <span className="uppercase tracking-wider text-xs font-semibold bg-white/5 px-2 py-0.5 rounded">
                      {ticket.deliveryMethod}
                    </span>
                  </div>

                  <div className="pt-2 text-xs text-blue-300 font-mono">
                    ID: {ticket.purchaseId}
                  </div>
                </div>

                {/* Action */}
                <div className="flex items-center justify-end sm:border-l sm:border-white/10 sm:pl-6">
                  <Link 
                    href={`/buyer/orders/${ticket._id}`}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-blue-600 hover:text-white rounded-xl border border-white/10 hover:border-blue-500 text-blue-200 transition-all duration-200 font-medium group/btn"
                  >
                    {ticket.status === 'delivered' ? 'Access Tickets' : 'View Details'}
                    <FaChevronRight className="text-sm group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
