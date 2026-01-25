'use client';

import { useState, useEffect } from 'react';
import { 
  FaTicketAlt, FaCoins, FaEye, FaCheck, FaPlus, FaTimes,
  FaFilter, FaSearch, FaEdit, FaCopy, FaTrash, FaSave,
  FaExclamationTriangle, FaShoppingCart, FaClock, FaCheckCircle,
  FaUser, FaCalendarAlt, FaMapMarkerAlt
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function MyListings() {
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  // Categories and other options
  const categories = [
    'Central Longside Lower', 'Longside Lower', 'Shortside Lower',
    'Central Longside Upper', 'Longside Upper', 'Shortside Upper',
    'Away Section', 'VIP Packages'
  ];

  const restrictions = ['Clear View', 'Restricted View'];
  const deliveryMethods = ['Mobile Ticket', 'PDF Ticket', 'Pickup'];
  const splitTypes = ['Singles','Pairs','3 Seats Together','4 Seats Together','5 Seats Together','6 Seats Together'];
  const ageBands = ['Adult','Junior','Senior','Adult + Junior','Adult + Senior'];

  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchListings();
  }, []);

  const getAuthToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      return null;
    }
    return token;
  };

  const fetchListings = async () => {
    setLoading(true);
    setError('');
    try {
      const token = getAuthToken();
      if (!token) {
        setError('Please log in to view your listings');
        return;
      }

      
      // FIXED: Using correct endpoint for seller listings
      const res = await fetch(`${API_BASE_URL}/tickets/seller/listings`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      
      if (res.status === 401) {
        setError('Authentication failed. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return;
      }

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch listings: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Fetch sales data for accurate statistics
  const [salesStats, setSalesStats] = useState({
    totalSales: 0,
    totalPoints: 0,
    pendingPoints: 0,
    availablePoints: 0
  });

  useEffect(() => {
    fetchSalesStats();
  }, []);

  const fetchSalesStats = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      
      const res = await fetch(`${API_BASE_URL}/tickets/seller/sales`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (res.ok) {
        const data = await res.json();
        
        // Use the stats from the API response
        if (data.stats) {
          setSalesStats({
            totalSales: data.stats.totalSales || 0,
            totalPoints: data.stats.totalPoints || 0,
            pendingPoints: data.stats.pendingPoints || 0,
            availablePoints: data.stats.availablePoints || 0
          });
        }
      } else {
        // Fallback to local calculation if API fails
        calculateLocalStats();
      }
    } catch (err) {
      // Fallback to local calculation if API fails
      calculateLocalStats();
    }
  };

  // Fallback function to calculate stats locally if API fails
  const calculateLocalStats = () => {
    const totalSales = listings.reduce((acc, listing) => {
      if (listing.originalQuantity && listing.quantity) {
        return acc + (listing.originalQuantity - listing.quantity);
      }
      return acc + (listing.soldQuantity || 0);
    }, 0);

    const totalPoints = listings.reduce((acc, listing) => {
      const soldCount = listing.originalQuantity && listing.quantity 
        ? (listing.originalQuantity - listing.quantity)
        : (listing.soldQuantity || 0);
      return acc + ((listing.price || 0) * soldCount);
    }, 0);

    // Estimate pending points as 50% of total points for demo
    const pendingPoints = totalPoints * 0.5;
    const availablePoints = totalPoints * 0.5;

    setSalesStats({
      totalSales,
      totalPoints,
      pendingPoints,
      availablePoints
    });
  };

  // Update local stats when listings change
  useEffect(() => {
    if (listings.length > 0) {
      calculateLocalStats();
    }
  }, [listings]);

  // Rest of your existing functions remain exactly the same...
  const startEdit = (listing) => {
    setEditingId(listing._id);
    setEditForm({
      category: listing.category || '',
      blockArea: listing.blockArea || '',
      restriction: listing.restriction || 'Clear View',
      deliveryMethod: listing.deliveryMethod || 'Mobile Ticket',
      quantity: listing.quantity || 1,
      splitType: listing.splitType || 'Singles',
      ageBand: listing.ageBand || 'Adult',
      price: listing.price || 0,
      note: listing.note || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const validateEditForm = () => {
    const requiredFields = ['category', 'blockArea', 'quantity', 'ageBand', 'price'];
    const missingFields = requiredFields.filter(field => {
      const value = editForm[field];
      return value === undefined || value === null || value === '' || (typeof value === 'number' && isNaN(value));
    });
    
    if (missingFields.length > 0) {
      alert(`Missing required fields: ${missingFields.join(', ')}`);
      return false;
    }

    if (editForm.quantity < 1) {
      alert('Quantity must be at least 1');
      return false;
    }

    if (editForm.price <= 0) {
      alert('Price must be greater than 0');
      return false;
    }

    return true;
  };

  const saveEdit = async (id) => {
    if (!validateEditForm()) {
      return;
    }

    setSaveLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in to update listings');
        return;
      }

      // Prepare clean data for API
      const updateData = {
        category: editForm.category.trim(),
        blockArea: editForm.blockArea.trim(),
        restriction: editForm.restriction,
        deliveryMethod: editForm.deliveryMethod,
        quantity: Number(editForm.quantity),
        splitType: editForm.splitType,
        ageBand: editForm.ageBand,
        price: Number(editForm.price),
        note: editForm.note?.trim() || ''
      };

      
      const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      let responseData;
      try {
        responseData = await res.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Authentication failed. Please log in again.');
        } else if (res.status === 403) {
          throw new Error('You are not authorized to update this listing.');
        } else if (res.status === 404) {
          throw new Error('Listing not found.');
        } else if (res.status === 400) {
          throw new Error(responseData.message || 'Invalid data provided.');
        } else {
          throw new Error(responseData.message || `Server error: ${res.status}`);
        }
      }
      
      // Update local state
      setListings(prev => prev.map(listing => 
        listing._id === id ? { ...listing, ...updateData } : listing
      ));
      
      setEditingId(null);
      setEditForm({});
      
    } catch (err) {
      alert(`Error updating listing: ${err.message}`);
    } finally {
      setSaveLoading(false);
    }
  };

  const duplicateListing = async (listing) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in to duplicate listings');
        return;
      }

      
      const duplicateData = {
        match: listing.match?._id || listing.match,
        category: listing.category,
        blockArea: listing.blockArea,
        restriction: listing.restriction || 'Clear View',
        deliveryMethod: listing.deliveryMethod || 'Mobile Ticket',
        quantity: listing.quantity,
        splitType: listing.splitType,
        ageBand: listing.ageBand,
        price: listing.price,
        note: listing.note || '',
        status: 'active'
      };


      const res = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(duplicateData)
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to duplicate listing');
      }
      
      setListings(prev => [responseData, ...prev]);
      
    } catch (err) {
      alert(`Error duplicating listing: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Please log in to delete listings');
        return;
      }

      
      const res = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        throw new Error(responseData.message || 'Failed to delete listing');
      }
      
      setListings(prev => prev.filter(l => l._id !== id));
    } catch (err) {
      alert(`Error deleting listing: ${err.message}`);
    }
  };

  const handleEditChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  const filteredListings = listings.filter(listing =>
    (selectedStatus === 'all' || listing.status === selectedStatus) &&
    (listing.match?.homeTeam?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     listing.match?.awayTeam?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     listing.blockArea?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-500/20 text-green-300 border-green-400/30', label: 'Active' },
      pending: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30', label: 'Pending' },
      sold: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Sold' },
      expired: { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', label: 'Expired' },
      cancelled: { color: 'bg-red-500/20 text-red-300 border-red-400/30', label: 'Cancelled' },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getRestrictionBadge = (restriction) => {
    const color = restriction === 'Clear View' 
      ? 'bg-green-500/20 text-green-300 border-green-400/30' 
      : 'bg-yellow-500/20 text-yellow-300 border-yellow-400/30';
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${color}`}>
        {restriction}
      </span>
    );
  };

  // UPDATED STATISTICS - Using real sales data from API
  const getActiveListingsCount = () => {
    return listings.filter(l => l.status === 'active').length;
  };

  const getSoldTicketsCount = () => {
    return salesStats.totalSales;
  };

  const getPendingPoints = () => {
    return salesStats.pendingPoints;
  };

  const getTotalEarnings = () => {
    return salesStats.totalPoints;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
      <span className="ml-3 text-white">Loading listings...</span>
    </div>
  );
  
  if (error) return (
    <div className="text-center py-20">
      <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-6 max-w-md mx-auto">
        <FaExclamationTriangle className="text-red-400 text-2xl mx-auto mb-3" />
        <p className="text-red-300 mb-2 font-semibold">Error loading listings</p>
        <p className="text-red-200 text-sm mb-4">{error}</p>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={fetchListings}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors"
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My Listings</h1>
          <p className="text-blue-200 mt-1 sm:mt-2">Manage your ticket listings and track sales</p>
        </div>
        <button
          onClick={() => router.push('/seller/listings/create')}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold shadow-lg flex items-center gap-2 transition-all duration-200 w-full lg:w-auto justify-center"
        >
          <FaPlus className="text-sm" /> Create New Listing
        </button>
      </div>

      {/* UPDATED: Stats with real sales data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaTicketAlt className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Active Listings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{getActiveListingsCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaShoppingCart className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Sold Tickets</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{getSoldTicketsCount()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Pending Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{getPendingPoints().toLocaleString()} pts</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaCheckCircle className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">Total Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{getTotalEarnings().toLocaleString()} pts</p>
            </div>
          </div>
        </div>
      </div>

      {/* The rest of your existing JSX remains exactly the same */}
      {/* Filter and Search */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <input
              type="text"
              placeholder="Search by teams, category, or block..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
          </div>
          
          {/* Filter */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
            >
              <option value="all" className="text-gray-900">All Status</option>
              <option value="active" className="text-gray-900">Active</option>
              <option value="pending" className="text-gray-900">Pending</option>
              <option value="sold" className="text-gray-900">Sold</option>
              <option value="expired" className="text-gray-900">Expired</option>
              <option value="cancelled" className="text-gray-900">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings Table - Everything below remains exactly the same */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-white">Your Listings</h2>
          <span className="text-blue-200 text-sm">
            {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {filteredListings.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-blue-200">No listings found matching your criteria.</p>
            {listings.length === 0 && (
              <button
                onClick={() => router.push('/seller/listings/create')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold inline-flex items-center gap-2 transition-all duration-200"
              >
                <FaPlus /> Create Your First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Match</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Category</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Block/Area</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Restriction</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Qty</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Price</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Status</th>
                  <th className="text-left py-3 px-4 text-blue-200 font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing._id} className="border-b border-white/10 hover:bg-white/5">
                    {/* Match */}
                    <td className="py-3 px-4 text-white text-sm">
                      <div className="flex items-center gap-2">
                        <FaCalendarAlt className="text-blue-400 text-xs" />
                        <div>
                          <div className="font-medium">{listing.match?.homeTeam} vs {listing.match?.awayTeam}</div>
                          <div className="text-blue-300 text-xs">
                            {listing.match?.date ? new Date(listing.match.date).toLocaleDateString() : 'Date TBD'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* Category */}
                    <td className="py-3 px-4 text-white text-sm">
                      {editingId === listing._id ? (
                        <select 
                          value={editForm.category} 
                          onChange={(e) => handleEditChange('category', e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="" className="text-gray-900">Select Category</option>
                          {categories.map(c => <option key={c} value={c} className="text-gray-900">{c}</option>)}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaTicketAlt className="text-green-400 text-xs" />
                          {listing.category}
                        </div>
                      )}
                    </td>
                    
                    {/* Block/Area */}
                    <td className="py-3 px-4 text-white text-sm">
                      {editingId === listing._id ? (
                        <input 
                          type="text" 
                          value={editForm.blockArea} 
                          onChange={(e) => handleEditChange('blockArea', e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                          placeholder="Enter block/area"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <FaMapMarkerAlt className="text-yellow-400 text-xs" />
                          {listing.blockArea}
                        </div>
                      )}
                    </td>
                    
                    {/* Restriction */}
                    <td className="py-3 px-4 text-white text-sm">
                      {editingId === listing._id ? (
                        <select 
                          value={editForm.restriction} 
                          onChange={(e) => handleEditChange('restriction', e.target.value)}
                          className="w-full px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                        >
                          {restrictions.map(r => <option key={r} value={r} className="text-gray-900">{r}</option>)}
                        </select>
                      ) : (
                        getRestrictionBadge(listing.restriction || 'Clear View')
                      )}
                    </td>
                    
                    {/* Quantity */}
                    <td className="py-3 px-4 text-white text-sm">
                      {editingId === listing._id ? (
                        <input 
                          type="number" 
                          value={editForm.quantity} 
                          onChange={(e) => handleEditChange('quantity', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                          min={1}
                        />
                      ) : (
                        <div className="text-center">
                          <div className="font-semibold">{listing.quantity}</div>
                          {listing.originalQuantity && listing.originalQuantity > listing.quantity && (
                            <div className="text-green-400 text-xs">
                              -{listing.originalQuantity - listing.quantity} sold
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    
                    {/* Price */}
                    <td className="py-3 px-4 text-white text-sm font-semibold">
                      {editingId === listing._id ? (
                        <input 
                          type="number" 
                          value={editForm.price} 
                          onChange={(e) => handleEditChange('price', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-white/10 border border-white/20 rounded text-white text-sm focus:ring-1 focus:ring-blue-500"
                          min={0}
                          step="0.01"
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          <FaCoins className="text-yellow-400 text-xs" />
                          {listing.price} pts
                        </div>
                      )}
                    </td>
                    
                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(listing.status)}
                    </td>
                    
                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {editingId === listing._id ? (
                          <>
                            <button
                              onClick={() => saveEdit(listing._id)}
                              disabled={saveLoading}
                              className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Save"
                            >
                              {saveLoading ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-400"></div>
                              ) : (
                                <FaCheck size={14} />
                              )}
                            </button>
                            <button
                              onClick={cancelEdit}
                              disabled={saveLoading}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors disabled:opacity-50"
                              title="Cancel"
                            >
                              <FaTimes size={14} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(listing)}
                              className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors"
                              title="Edit"
                            >
                              <FaEdit size={14} />
                            </button>
                            <button
                              onClick={() => duplicateListing(listing)}
                              className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors"
                              title="Duplicate"
                            >
                              <FaCopy size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(listing._id)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                              title="Delete"
                            >
                              <FaTrash size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}