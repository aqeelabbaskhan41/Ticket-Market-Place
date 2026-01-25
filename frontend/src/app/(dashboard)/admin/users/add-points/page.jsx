'use client';

import { useState, useEffect, useRef } from 'react';
import { FaUserPlus, FaCoins, FaUsers, FaStar, FaSearch, FaChevronDown, FaArrowLeft, FaPlus, FaEdit } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminAddPoints() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [points, setPoints] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [actionType, setActionType] = useState('set');
  const dropdownRef = useRef(null);

  
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found. Please login.');

        const res = await fetch(`${API_BASE_URL}/users`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch users');

        const buyersAndSellers = data.users.filter(u => u.role === 'buyer' || u.role === 'seller');
        setUsers(buyersAndSellers);
      } catch (err) {
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedUser) {
      const user = users.find(u => u._id === selectedUser);
      if (user) {
        setPoints(user.points?.toString() || '0');
      }
    } else {
      setPoints('');
    }
  }, [selectedUser, users]);

  const handlePointsAction = async () => {
    if (!selectedUser || !points) {
      setError('Please select a user and enter points');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found. Please login.');

      const currentUser = users.find(u => u._id === selectedUser);
      const currentPoints = currentUser?.points || 0;
      let newPoints;

      if (actionType === 'add') {
        newPoints = currentPoints + parseInt(points);
      } else {
        newPoints = parseInt(points);
      }

      const res = await fetch(`${API_BASE_URL}/users/update-points`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          userId: selectedUser, 
          points: newPoints
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update points');

      const actionText = actionType === 'add' ? `added ${points} points to` : `updated points to ${points} for`;
      setSuccess(`Successfully ${actionText} ${data.user.profile?.name || data.user.email}`);
      setPoints('');
      setSelectedUser('');
      setSearchTerm('');
      setError('');
      setIsDropdownOpen(false);
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === selectedUser 
            ? { ...user, points: newPoints }
            : user
        )
      );
    } catch (err) {
      setError(err.message || 'Failed to update points');
      setSuccess('');
    }
  };

  const getSelectedUser = () => {
    return users.find(b => b._id === selectedUser);
  };

  const getUserPoints = (userId) => {
    const user = users.find(b => b._id === userId);
    return user?.points || 0;
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm) {
      return selectedRole === 'all' || user.role === selectedRole;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (
      user.email?.toLowerCase().includes(searchLower) ||
      user.profile?.name?.toLowerCase().includes(searchLower) ||
      user.name?.toLowerCase().includes(searchLower)
    );
    
    return matchesSearch && (selectedRole === 'all' || user.role === selectedRole);
  });

  const handleSelectUser = (user) => {
    setSelectedUser(user._id);
    setSearchTerm(user.profile?.name || user.name || user.email);
    setIsDropdownOpen(false);
  };

  const handleSearchFocus = () => {
    setIsDropdownOpen(true);
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      seller: { color: 'bg-blue-500/20 text-blue-300 border-blue-400/30', label: 'Seller' },
      buyer: { color: 'bg-gray-500/20 text-gray-300 border-gray-400/30', label: 'Buyer' }
    };
    const config = roleConfig[role] || roleConfig.buyer;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
      <span className="ml-3 text-white text-lg">Loading users...</span>
    </div>
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header with Back Button */}
      <div className="mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link 
              href="/admin/users"
              className="flex items-center text-blue-300 hover:text-blue-200 mr-4 transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Back to Users
            </Link>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
              <FaCoins className="text-white text-lg sm:text-xl" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Points</h1>
              <p className="text-blue-200 mt-1">Add or update points for buyers and sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Users</p>
              <p className="text-xl sm:text-2xl font-bold text-white">{users.length}</p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center border border-blue-400/30">
              <FaUsers className="text-lg sm:text-xl text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Total Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {users.reduce((total, user) => total + (user.points || 0), 0)}
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-400/30">
              <FaCoins className="text-lg sm:text-xl text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-200 text-sm font-medium">Average Points</p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {users.length > 0 
                  ? Math.round(users.reduce((total, user) => total + (user.points || 0), 0) / users.length)
                  : 0
                }
              </p>
            </div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center border border-purple-400/30">
              <FaStar className="text-lg sm:text-xl text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Points Management Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4">Manage User Points</h2>

        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg text-sm mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Role Filter and Search */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Filter by Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              >
                <option value="all" className="text-gray-900">All Users (Buyers & Sellers)</option>
                <option value="buyer" className="text-gray-900">Buyers Only</option>
                <option value="seller" className="text-gray-900">Sellers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">Search Users</label>
              <div className="relative" ref={dropdownRef}>
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onFocus={handleSearchFocus}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Search by name or email..."
                  />
                  <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm cursor-pointer" />
                </div>

                {/* Dropdown */}
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map(user => (
                        <div
                          key={user._id}
                          onClick={() => handleSelectUser(user)}
                          className={`px-4 py-3 cursor-pointer hover:bg-blue-600/20 transition-colors ${
                            selectedUser === user._id ? 'bg-blue-600/30' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-white font-medium text-sm">
                                  {user.profile?.name || user.name || user.email}
                                </p>
                                {getRoleBadge(user.role)}
                              </div>
                              <p className="text-blue-200 text-xs">{user.email}</p>
                            </div>
                            <span className="text-green-400 font-semibold text-sm">
                              {user.points || 0} points
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-blue-200 text-center">
                        No users found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected User Info */}
          {selectedUser && (
            <div className="bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-white font-medium">
                    Selected: {getSelectedUser()?.profile?.name || getSelectedUser()?.name || getSelectedUser()?.email}
                  </p>
                  <p className="text-blue-200 text-sm">
                    Role: {getSelectedUser()?.role} • Current Points: {getUserPoints(selectedUser)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser('');
                    setSearchTerm('');
                    setPoints('');
                  }}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Action Type Selection */}
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-2">Action Type</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  setActionType('add');
                  if (selectedUser) {
                    setPoints('0');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200 ${
                  actionType === 'add'
                    ? 'bg-blue-500/20 border-blue-400/30 text-white'
                    : 'bg-white/10 border-white/20 text-blue-200 hover:bg-white/15'
                }`}
              >
                <FaPlus className="text-sm" />
                Add Points
              </button>
              <button
                onClick={() => {
                  setActionType('set');
                  if (selectedUser) {
                    const user = users.find(u => u._id === selectedUser);
                    setPoints(user?.points?.toString() || '0');
                  }
                }}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg border transition-all duration-200 ${
                  actionType === 'set'
                    ? 'bg-blue-500/20 border-blue-400/30 text-white'
                    : 'bg-white/10 border-white/20 text-blue-200 hover:bg-white/15'
                }`}
              >
                <FaEdit className="text-sm" />
                Edit Points
              </button>
            </div>
          </div>

          {/* Points Input */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                {actionType === 'add' ? 'Points to Add' : 'Points'}
              </label>
              <div className="relative">
                <FaCoins className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
                <input
                  type="number"
                  value={points}
                  onChange={e => setPoints(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition placeholder-blue-200"
                  placeholder={actionType === 'add' ? "Enter points to add" : "Edit points"}
                  min="0"
                />
              </div>
              <p className="text-blue-300 text-xs mt-2">
                {actionType === 'add' 
                  ? `Points will be added to current balance`
                  : `Editing current points directly`
                }
              </p>
            </div>

            {/* Quick Points Buttons */}
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-2">
                {actionType === 'add' ? 'Quick Add' : 'Common Values'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {actionType === 'add' ? (
                  [100, 500, 1000, 5000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setPoints(amount.toString())}
                      className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-300 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      +{amount}
                    </button>
                  ))
                ) : (
                  [0, 100, 500, 1000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setPoints(amount.toString())}
                      className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-blue-300 py-2 rounded-lg transition-all duration-200 text-sm"
                    >
                      Set {amount}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handlePointsAction}
            disabled={!selectedUser || !points}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <FaUserPlus />
            {selectedUser && points ? (
              actionType === 'add' ? `Add ${points} Points` : `Update to ${points} Points`
            ) : (
              actionType === 'add' ? 'Add Points' : 'Update Points'
            )}
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-white">All Buyers & Sellers</h3>
          <span className="text-blue-300 text-sm">
            {users.length} users total
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {users.map(user => (
            <div 
              key={user._id} 
              className={`bg-white/5 rounded-xl p-3 sm:p-4 border transition-colors ${
                selectedUser === user._id 
                  ? 'border-blue-400 bg-blue-500/10' 
                  : 'border-white/10 hover:border-blue-400/30'
              }`}
              onClick={() => handleSelectUser(user)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-white text-sm truncate">
                    {user.profile?.name || user.name || user.email}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    {getRoleBadge(user.role)}
                  </div>
                </div>
                <span className="text-blue-400 font-bold text-sm">{user.points || 0}</span>
              </div>
              <p className="text-blue-200 text-xs mb-2 truncate">{user.email}</p>
              <div className="flex justify-between items-center text-xs">
                <span className="text-blue-300">Points</span>
                <span className="text-green-400 font-semibold">{user.points || 0}</span>
              </div>
            </div>
          ))}
        </div>

        {users.length === 0 && (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-blue-400/30">
              <FaUsers className="text-xl text-blue-400" />
            </div>
            <p className="text-blue-200">No buyers or sellers found</p>
          </div>
        )}
      </div>
    </div>
  );
}