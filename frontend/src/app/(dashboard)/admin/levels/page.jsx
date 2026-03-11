'use client';
import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaSearch, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUserTie,
  FaUserCheck,
  FaUserPlus,
  FaCoins,
  FaPercentage,
  FaSync,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCog,
  FaCog,
  FaMoneyBillWave,
  FaLevelUpAlt,
  FaChartLine,
  FaFilter,
  FaUserShield
} from 'react-icons/fa';

export default function AdminLevelManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [editingUser, setEditingUser] = useState(null);
  const [newLevel, setNewLevel] = useState('');
  const [commissionSettings, setCommissionSettings] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });
  const [editingCommission, setEditingCommission] = useState(null);
  const [customCommissionRate, setCustomCommissionRate] = useState('');
  const [showCommissionSettings, setShowCommissionSettings] = useState(false);
  const [tempCommissionSettings, setTempCommissionSettings] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    fetchUsers();
    fetchCommissionSettings();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, levelFilter]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/commission/admin/users-with-levels`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        calculateStats(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showMessage('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/commission/admin/settings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCommissionSettings(data.settings);
        setTempCommissionSettings(JSON.parse(JSON.stringify(data.settings)));
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
    }
  };

  const calculateStats = (userList) => {
    const stats = {
      total: userList.length,
      level1: userList.filter(user => user.level === 'level1').length,
      level2: userList.filter(user => user.level === 'level2').length,
      level3: userList.filter(user => user.level === 'level3').length,
      customCommissions: userList.filter(user => user.commissionType === 'custom').length,
      totalPoints: userList.reduce((sum, user) => sum + (user.points || 0), 0)
    };
    setStats(stats);
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.profile?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (levelFilter !== 'all') {
      if (levelFilter === 'custom') {
        filtered = filtered.filter(user => user.commissionType === 'custom');
      } else {
        filtered = filtered.filter(user => user.level === levelFilter);
      }
    }

    setFilteredUsers(filtered);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setNewLevel(user.level);
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setNewLevel('');
  };

  const startCommissionEdit = (user) => {
    setEditingCommission(user);
    setCustomCommissionRate(user.effectiveCommissionRate ? (user.effectiveCommissionRate * 100).toFixed(1) : '');
  };

  const cancelCommissionEdit = () => {
    setEditingCommission(null);
    setCustomCommissionRate('');
  };

  const updateUserLevel = async (userId) => {
    if (!newLevel) {
      showMessage('error', 'Please select a level');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/commission/admin/users/${userId}/level`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ level: newLevel })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { ...user, level: newLevel } : user
          )
        );
        setEditingUser(null);
        setNewLevel('');
        showMessage('success', `User level updated to ${newLevel}`);
      } else {
        showMessage('error', 'Failed to update user level');
      }
    } catch (error) {
      console.error('Error updating user level:', error);
      showMessage('error', 'Error updating user level');
    }
  };

  const setCustomCommission = async (userId) => {
    if (!customCommissionRate || isNaN(customCommissionRate)) {
      showMessage('error', 'Please enter a valid commission rate');
      return;
    }

    const rate = parseFloat(customCommissionRate) / 100;
    if (rate < 0 || rate > 1) {
      showMessage('error', 'Commission rate must be between 0% and 100%');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/commission/admin/users/${userId}/custom-commission`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ commissionRate: rate })
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { 
              ...user, 
              customCommissionRate: rate,
              isCustomCommission: true,
              commissionType: 'custom',
              effectiveCommissionRate: rate
            } : user
          )
        );
        setEditingCommission(null);
        setCustomCommissionRate('');
        showMessage('success', `Custom commission rate of ${customCommissionRate}% set for user`);
      } else {
        showMessage('error', 'Failed to set custom commission');
      }
    } catch (error) {
      console.error('Error setting custom commission:', error);
      showMessage('error', 'Error setting custom commission');
    }
  };

  const removeCustomCommission = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/commission/admin/users/${userId}/custom-commission`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user._id === userId ? { 
              ...user, 
              customCommissionRate: null,
              isCustomCommission: false,
              commissionType: 'level'
            } : user
          )
        );
        showMessage('success', 'Custom commission removed, using level-based rate');
      } else {
        showMessage('error', 'Failed to remove custom commission');
      }
    } catch (error) {
      console.error('Error removing custom commission:', error);
      showMessage('error', 'Error removing custom commission');
    }
  };

  const getLevelConfig = (level) => {
    const config = {
      level1: { color: 'bg-gray-600', label: 'Standard', icon: FaUserPlus },
      level2: { color: 'bg-blue-600', label: 'Premium', icon: FaUserCheck },
      level3: { color: 'bg-purple-600', label: 'VIP', icon: FaUserTie }
    };
    return config[level] || config.level1;
  };

  const getCommissionRate = (user) => {
    if (user.commissionType === 'custom') {
      return (user.effectiveCommissionRate * 100).toFixed(1);
    }
    if (!commissionSettings) return '0';
    return (commissionSettings[user.level]?.commissionRate * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-white">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-300">Manage levels and commission rates</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <FaFilter />
            {viewMode === 'table' ? 'Card View' : 'Table View'}
          </button>
          <button
            onClick={() => setShowCommissionSettings(!showCommissionSettings)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <FaCog />
            Settings
          </button>
          <button
            onClick={fetchUsers}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            <FaSync />
            Refresh
          </button>
        </div>
      </div>

      {/* Commission Settings */}
      {showCommissionSettings && commissionSettings && (
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <FaCog className="text-purple-400" />
            Commission Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {['level1', 'level2', 'level3'].map((level) => (
              <div key={level} className="bg-gray-700/50 rounded-lg p-3 border border-gray-600">
                <h4 className="font-semibold text-white mb-2 text-sm">{tempCommissionSettings[level].name}</h4>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={tempCommissionSettings[level].name}
                    onChange={(e) => handleCommissionSettingChange(level, 'name', e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={(tempCommissionSettings[level].commissionRate * 100).toFixed(1)}
                    onChange={(e) => handleCommissionSettingChange(level, 'commissionRate', e.target.value)}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowCommissionSettings(false)}
              className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={updateCommissionSettings}
              className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors flex items-center gap-1"
            >
              <FaSave size={12} />
              Save
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Total Users</p>
              <p className="text-xl font-bold text-white">{stats.total}</p>
            </div>
            <FaUsers className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-100 text-xs">Standard</p>
              <p className="text-xl font-bold text-white">{stats.level1}</p>
            </div>
            <FaUserPlus className="text-gray-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs">Premium</p>
              <p className="text-xl font-bold text-white">{stats.level2}</p>
            </div>
            <FaUserCheck className="text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs">VIP</p>
              <p className="text-xl font-bold text-white">{stats.level3}</p>
            </div>
            <FaUserTie className="text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-xs">Custom Rates</p>
              <p className="text-xl font-bold text-white">{stats.customCommissions}</p>
            </div>
            <FaUserCog className="text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs">Total Points</p>
              <p className="text-xl font-bold text-white">{(stats.totalPoints / 1000).toFixed(0)}K</p>
            </div>
            <FaCoins className="text-green-200" />
          </div>
        </div>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div className={`p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-900/50 border border-green-700 text-green-300' 
            : 'bg-red-900/50 border border-red-700 text-red-300'
        }`}>
          <div className="flex items-center gap-2 text-sm">
            {message.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
            {message.text}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl p-4 border border-gray-700">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-9 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>
          </div>
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
          >
            <option value="all">All Levels</option>
            <option value="level1">Standard</option>
            <option value="level2">Premium</option>
            <option value="level3">VIP</option>
            <option value="custom">Custom Rates</option>
          </select>
        </div>
      </div>

      {/* Users Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map((user) => {
            const levelConfig = getLevelConfig(user.level);
            const IconComponent = levelConfig.icon;
            const commissionRate = getCommissionRate(user);
            
            return (
              <div key={user._id} className="bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-700 p-4 hover:border-gray-600 transition-colors">
                {/* User Header */}
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-white text-sm truncate">
                      {user.profile?.fullName || 'No Name'}
                    </h3>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>
                  <div className={`${levelConfig.color} text-white px-2 py-1 rounded-full text-xs flex items-center gap-1`}>
                    <IconComponent size={10} />
                    {levelConfig.label}
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs mb-1">
                      <FaCoins size={10} />
                      Points
                    </div>
                    <div className="text-white font-semibold text-sm">
                      {(user.points || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2 text-center">
                    <div className="flex items-center justify-center gap-1 text-blue-400 text-xs mb-1">
                      <FaPercentage size={10} />
                      Commission
                    </div>
                    <div className="text-white font-semibold text-sm">
                      {commissionRate}%
                    </div>
                  </div>
                </div>

                {/* Commission Type */}
                <div className="mb-4">
                  {user.commissionType === 'custom' ? (
                    <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-yellow-300">Custom Rate</span>
                        <span className="text-yellow-200 font-semibold">{commissionRate}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-900/30 border border-green-700/50 rounded-lg px-3 py-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-300">Level Rate</span>
                        <span className="text-green-200 font-semibold">{commissionRate}%</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {/* Level Edit */}
                  {editingUser?._id === user._id ? (
                    <div className="flex-1 bg-blue-900/20 p-2 rounded border border-blue-700">
                      <div className="flex items-center gap-2 mb-1">
                        <FaLevelUpAlt className="text-blue-400" size={12} />
                        <span className="text-blue-300 text-xs">Change Level</span>
                      </div>
                      <div className="flex gap-1">
                        <select
                          value={newLevel}
                          onChange={(e) => setNewLevel(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="level1">Standard</option>
                          <option value="level2">Premium</option>
                          <option value="level3">VIP</option>
                        </select>
                        <button
                          onClick={() => updateUserLevel(user._id)}
                          className="text-green-400 hover:text-green-300 transition-colors p-1"
                        >
                          <FaSave size={12} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(user)}
                      className="flex-1 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs transition-colors justify-center"
                    >
                      <FaLevelUpAlt size={10} />
                      Level
                    </button>
                  )}

                  {/* Commission Edit */}
                  {editingCommission?._id === user._id ? (
                    <div className="flex-1 bg-yellow-900/20 p-2 rounded border border-yellow-700">
                      <div className="flex items-center gap-2 mb-1">
                        <FaChartLine className="text-yellow-400" size={12} />
                        <span className="text-yellow-300 text-xs">Commission</span>
                      </div>
                      <div className="flex gap-1">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={customCommissionRate}
                          onChange={(e) => setCustomCommissionRate(e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-xs focus:outline-none focus:border-yellow-500"
                          placeholder="0.0"
                        />
                        <button
                          onClick={() => setCustomCommission(user._id)}
                          className="text-green-400 hover:text-green-300 transition-colors p-1"
                        >
                          <FaSave size={12} />
                        </button>
                        <button
                          onClick={cancelCommissionEdit}
                          className="text-red-400 hover:text-red-300 transition-colors p-1"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </div>
                  ) : user.commissionType === 'custom' ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => startCommissionEdit(user)}
                        className="flex-1 flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs transition-colors justify-center"
                      >
                        <FaEdit size={10} />
                        Rate
                      </button>
                      <button
                        onClick={() => removeCustomCommission(user._id)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-2 py-2 rounded text-xs transition-colors"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startCommissionEdit(user)}
                      className="flex-1 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs transition-colors justify-center"
                    >
                      <FaChartLine size={10} />
                      Rate
                    </button>
                  )}
                </div>

                {/* Joined Date */}
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-gray-500 text-xs">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Compact Table View */
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Commission
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => {
                  const levelConfig = getLevelConfig(user.level);
                  const IconComponent = levelConfig.icon;
                  const commissionRate = getCommissionRate(user);
                  
                  return (
                    <tr key={user._id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium text-white text-xs">
                            {user.profile?.fullName || 'No Name'}
                          </div>
                          <div className="text-gray-400 text-xs">{user.email}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-yellow-400 text-xs">
                          <FaCoins size={10} />
                          {(user.points || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`${levelConfig.color} text-white px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit`}>
                          <IconComponent size={10} />
                          {levelConfig.label}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          user.commissionType === 'custom' 
                            ? 'bg-yellow-900/50 text-yellow-300' 
                            : 'bg-green-900/50 text-green-300'
                        }`}>
                          {commissionRate}% {user.commissionType === 'custom' && '(Custom)'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(user)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded text-xs transition-colors"
                            title="Change Level"
                          >
                            <FaLevelUpAlt size={10} />
                          </button>
                          {user.commissionType === 'custom' ? (
                            <>
                              <button
                                onClick={() => startCommissionEdit(user)}
                                className="bg-yellow-600 hover:bg-yellow-700 text-white p-1 rounded text-xs transition-colors"
                                title="Edit Commission"
                              >
                                <FaEdit size={10} />
                              </button>
                              <button
                                onClick={() => removeCustomCommission(user._id)}
                                className="bg-red-600 hover:bg-red-700 text-white p-1 rounded text-xs transition-colors"
                                title="Remove Custom"
                              >
                                <FaTimes size={10} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => startCommissionEdit(user)}
                              className="bg-green-600 hover:bg-green-700 text-white p-1 rounded text-xs transition-colors"
                              title="Set Custom Commission"
                            >
                              <FaChartLine size={10} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <FaUsers className="mx-auto text-3xl text-gray-500 mb-3" />
              <p className="text-gray-400 text-sm">No users found</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Modals for Table View */}
      {(editingUser || editingCommission) && viewMode === 'table' && (
        <>
          {/* Level Edit Modal */}
          {editingUser && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-sm w-full">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FaLevelUpAlt className="text-blue-400" />
                  Change Level for {editingUser.profile?.fullName}
                </h3>
                <select
                  value={newLevel}
                  onChange={(e) => setNewLevel(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:border-blue-500"
                >
                  <option value="level1">Standard</option>
                  <option value="level2">Premium</option>
                  <option value="level3">VIP</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateUserLevel(editingUser._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Commission Edit Modal */}
          {editingCommission && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-sm w-full">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <FaChartLine className="text-yellow-400" />
                  Set Commission for {editingCommission.profile?.fullName}
                </h3>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={customCommissionRate}
                  onChange={(e) => setCustomCommissionRate(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:border-yellow-500"
                  placeholder="Enter commission rate (0-100)"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomCommission(editingCommission._id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelCommissionEdit}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}