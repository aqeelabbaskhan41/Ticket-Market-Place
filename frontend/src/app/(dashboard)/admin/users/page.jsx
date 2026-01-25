"use client";

import { useState, useEffect } from "react";
import {
  FaUsers,
  FaClock,
  FaFutbol,
  FaShoppingCart,
  FaSearch,
  FaUserShield,
  FaFilter,
  FaCoins, 
  FaExclamationTriangle,
  FaEllipsisH
} from "react-icons/fa";
import Link from "next/link";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showMoreActions, setShowMoreActions] = useState(false);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        if (data.success) {
          setUsers(data.users || []);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const roleMatch = selectedRole === "all" || user.role === selectedRole;
    const statusMatch =
      selectedStatus === "all" || user.status === selectedStatus;
    const searchMatch =
      searchTerm === "" ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.profile?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return roleMatch && statusMatch && searchMatch;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-300 border-yellow-400/30",
        label: "Pending",
      },
      approved: {
        color: "bg-green-500/20 text-green-300 border-green-400/30",
        label: "Approved",
      },
      suspended: {
        color: "bg-red-500/20 text-red-300 border-red-400/30",
        label: "Suspended",
      },
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: {
        color: "bg-purple-500/20 text-purple-300 border-purple-400/30",
        label: "Admin",
      },
      seller: {
        color: "bg-blue-500/20 text-blue-300 border-blue-400/30",
        label: "Seller",
      },
      buyer: {
        color: "bg-gray-500/20 text-gray-300 border-gray-400/30",
        label: "Buyer",
      },
    };
    const config = roleConfig[role] || roleConfig.buyer;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // Calculate pending sellers count
  const pendingSellersCount = users.filter(
    (u) => u.status === "pending" && u.role === "seller"
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            User Management
          </h1>
          <p className="text-blue-200 mt-1 sm:mt-2">
            Manage all users and monitor user activity
          </p>
        </div>
        
        {/* Action Buttons - Improved Layout */}
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          {/* Primary Actions - Always Visible */}
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/approvals"
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold ${
                pendingSellersCount > 0 
                  ? "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white border border-yellow-500/30"
                  : "bg-white/10 hover:bg-white/20 text-blue-200 border border-white/20"
              }`}
            >
              <FaClock className="text-xs" />
              Approvals
              {pendingSellersCount > 0 && (
                <span className="bg-white/20 text-white px-1.5 py-0.5 rounded-full text-xs min-w-5 h-5 flex items-center justify-center">
                  {pendingSellersCount}
                </span>
              )}
            </Link>

            <Link
              href="/admin/disputes"
              className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold border border-orange-500/30"
            >
              <FaExclamationTriangle className="text-xs" />
              Disputes
            </Link>
          </div>

          {/* Secondary Actions - Dropdown on mobile, inline on desktop */}
          <div className="relative">
            <div className="hidden sm:flex gap-2">
              <Link
                href="/admin/users/add-points"
                className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold border border-blue-500/30"
              >
                <FaCoins className="text-xs" />
                Points
              </Link>
              <Link
                href="/admin/users/add-admin"
                className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold border border-green-500/30"
              >
                <FaUserShield className="text-xs" />
                Add Admin
              </Link>
            </div>

            {/* Mobile Dropdown */}
            <div className="sm:hidden">
              <button
                onClick={() => setShowMoreActions(!showMoreActions)}
                className="flex items-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-sm font-semibold border border-purple-500/30"
              >
                <FaEllipsisH className="text-xs" />
                More
              </button>
              
              {showMoreActions && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-10 py-2">
                  <Link
                    href="/admin/users/add-points"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setShowMoreActions(false)}
                  >
                    <FaCoins className="text-xs" />
                    Manage Points
                  </Link>
                  <Link
                    href="/admin/users/add-admin"
                    className="flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm"
                    onClick={() => setShowMoreActions(false)}
                  >
                    <FaUserShield className="text-xs" />
                    Add New Admin
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* Total Users */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-blue-400/30">
              <FaUsers className="text-lg sm:text-xl text-blue-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">
                Total Users
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {users.length}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Sellers */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-yellow-400/30">
              <FaClock className="text-lg sm:text-xl text-yellow-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">
                Pending Sellers
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {pendingSellersCount}
              </p>
            </div>
          </div>
        </div>

        {/* Approved Sellers */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-green-400/30">
              <FaFutbol className="text-lg sm:text-xl text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">
                Approved Sellers
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {
                  users.filter(
                    (u) => u.role === "seller" && u.status === "approved"
                  ).length
                }
              </p>
            </div>
          </div>
        </div>

        {/* Buyers */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20">
          <div className="flex items-center">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mr-3 sm:mr-4 border border-purple-400/30">
              <FaShoppingCart className="text-lg sm:text-xl text-purple-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-blue-200">
                Buyers
              </p>
              <p className="text-xl sm:text-2xl font-bold text-white">
                {users.filter((u) => u.role === "buyer").length}
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
            />
          </div>

          {/* Role Filter */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
            >
              <option value="all" className="text-gray-900">
                All Roles
              </option>
              <option value="admin" className="text-gray-900">
                Admin
              </option>
              <option value="seller" className="text-gray-900">
                Seller
              </option>
              <option value="buyer" className="text-gray-900">
                Buyer
              </option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
            >
              <option value="all" className="text-gray-900">
                All Status
              </option>
              <option value="pending" className="text-gray-900">
                Pending
              </option>
              <option value="approved" className="text-gray-900">
                Approved
              </option>
              <option value="suspended" className="text-gray-900">
                Suspended
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/20">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-white/5 transition-colors duration-150"
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center mr-3 shadow-lg">
                        <span className="text-white font-bold text-xs sm:text-sm">
                          {user.profile?.name?.[0]?.toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-white truncate max-w-[120px] sm:max-w-[200px]">
                          {user.profile?.name || "No Name"}
                        </div>
                        <div className="text-sm text-blue-200 truncate max-w-[120px] sm:max-w-[200px]">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-white">
                    {user.profile?.phone || "N/A"}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-blue-200">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-400/30">
              <FaUsers className="text-2xl text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              No users found
            </h3>
            <p className="text-blue-200">
              {searchTerm || selectedRole !== "all" || selectedStatus !== "all"
                ? "Try adjusting your search or filters"
                : "No users registered yet"}
            </p>
            {(searchTerm ||
              selectedRole !== "all" ||
              selectedStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedRole("all");
                  setSelectedStatus("all");
                }}
                className="mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Table Footer */}
        {filteredUsers.length > 0 && (
          <div className="border-t border-white/20 px-4 sm:px-6 py-3">
            <div className="flex justify-between items-center text-sm text-blue-300">
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <span className="text-xs">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}