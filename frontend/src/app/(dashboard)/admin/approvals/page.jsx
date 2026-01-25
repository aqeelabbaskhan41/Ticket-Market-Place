'use client';

import { useState, useEffect } from 'react';
import { 
  FaCheckCircle, 
  FaClock,
  FaArrowLeft,
  FaEnvelope,
  FaPhone,
  FaUser,
  FaUsers
} from 'react-icons/fa';
import Link from 'next/link';

export default function PendingApprovals() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch all users and filter for pending sellers
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login first');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          // Filter for pending sellers only
          const pendingSellers = data.users.filter(user => 
            user.status === 'pending' && user.role === 'seller'
          );
          setPendingUsers(pendingSellers);
        } else {
          setError(data.message || 'Failed to fetch users');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load pending approvals. Please check if server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleApprove = async (userId, userName) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login first');
      return;
    }

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Remove the approved user from the list
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setSuccess(`Successfully approved ${userName || 'seller'}`);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Approval failed');
      }
    } catch (err) {
      console.error('Error approving user:', err);
      setError('Failed to approve user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const getDaysPending = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading pending approvals...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/admin/users"
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to User Management
        </Link>
        
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
              <FaClock className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Pending Approvals</h1>
              <p className="text-blue-200 mt-1">Review and approve seller applications</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg mb-4 sm:mb-6 transition-all duration-300">
          <div className="flex items-center">
            <FaClock className="mr-2 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg mb-4 sm:mb-6 transition-all duration-300">
          <div className="flex items-center">
            <FaCheckCircle className="mr-2 flex-shrink-0" />
            <span>{success}</span>
          </div>
        </div>
      )}

      {/* Stats Card */}
      <div className="bg-yellow-500/20 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-yellow-400/30 mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-yellow-400 text-lg sm:text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Pending Seller Approvals</h3>
              <p className="text-yellow-300">
                {pendingUsers.length} application{pendingUsers.length !== 1 ? 's' : ''} waiting for review
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl sm:text-3xl font-bold text-white">{pendingUsers.length}</p>
            <p className="text-yellow-300 text-sm">Total Pending</p>
          </div>
        </div>
      </div>

      {/* Pending Applications */}
      {pendingUsers.length > 0 ? (
        <div className="space-y-4 sm:space-y-6">
          {pendingUsers.map((user) => {
            const daysPending = getDaysPending(user.createdAt);
            
            return (
              <div key={user._id} className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:border-blue-400/30 transition-all duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* User Info */}
                  <div className="flex items-start space-x-3 sm:space-x-4 flex-1">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <FaUser className="text-white text-lg sm:text-xl" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                        {user.profile?.name || 'Unknown User'}
                      </h3>
                      
                      <div className="mt-2 sm:mt-3 space-y-1 sm:space-y-2">
                        <div className="flex items-center text-blue-200 text-sm">
                          <FaEnvelope className="mr-2 sm:mr-3 text-blue-400 flex-shrink-0 text-xs sm:text-sm" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        
                        {user.profile?.phone && (
                          <div className="flex items-center text-blue-200 text-sm">
                            <FaPhone className="mr-2 sm:mr-3 text-blue-400 flex-shrink-0 text-xs sm:text-sm" />
                            <span>{user.profile.phone}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center text-blue-300 text-xs">
                          <FaClock className="mr-2 sm:mr-3 text-blue-400 flex-shrink-0" />
                          <span>
                            Applied {daysPending} day{daysPending !== 1 ? 's' : ''} ago • 
                            {' '}{new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Approve Button */}
                  <div className="flex-shrink-0">
                    <button 
                      onClick={() => handleApprove(user._id, user.profile?.name)}
                      disabled={actionLoading}
                      className="w-full lg:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-green-400 disabled:to-green-500 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                      <FaCheckCircle className="text-sm" />
                      {actionLoading ? 'Approving...' : 'Approve Seller'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 border border-green-400/30">
            <FaCheckCircle className="text-green-400 text-2xl sm:text-3xl" />
          </div>
          <h3 className="text-xl sm:text-2xl font-semibold text-white mb-2 sm:mb-3">All Caught Up!</h3>
          <p className="text-blue-200 text-sm sm:text-base max-w-md mx-auto mb-6 sm:mb-8">
            There are no pending seller approvals at the moment. New applications will appear here automatically.
          </p>
          <Link 
            href="/admin/users"
            className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 gap-2"
          >
            <FaArrowLeft className="text-sm" />
            Back to User Management
          </Link>
        </div>
      )}

      {/* Footer Stats */}
      {pendingUsers.length > 0 && (
        <div className="mt-6 sm:mt-8 text-center">
          <div className="inline-flex items-center bg-white/5 rounded-lg px-4 py-2 border border-white/10">
            <FaUsers className="text-blue-400 mr-2 text-sm" />
            <span className="text-blue-300 text-sm">
              {pendingUsers.length} pending approval{pendingUsers.length !== 1 ? 's' : ''} to review
            </span>
          </div>
        </div>
      )}
    </div>
  );
}