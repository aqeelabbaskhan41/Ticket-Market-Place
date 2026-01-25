'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserShield, FaArrowLeft, FaEnvelope, FaUser, FaLock, FaPhone } from 'react-icons/fa';
import Link from 'next/link';

export default function AddAdminForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Check if logged-in user is admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.role !== 'admin') {
        router.push('/login'); // redirect non-admin users
      } else {
        setIsAdmin(true);
      }
    } catch (err) {
      router.push('/login');
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in as admin');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // send admin token
        },
        body: JSON.stringify({
          profile: {
            name: formData.name,
            phone: formData.phone
          },
          email: formData.email,
          password: formData.password,
          role: 'admin'
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Admin user created successfully!');
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: ''
        });

        setTimeout(() => {
          router.push('/admin/users');
        }, 2000);
      } else {
        setError(data.message || 'Failed to create admin user');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white">Verifying admin access...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <Link 
          href="/admin/users"
          className="inline-flex items-center text-blue-200 hover:text-white font-medium mb-4 transition-colors duration-200 group"
        >
          <FaArrowLeft className="mr-2 text-blue-300 group-hover:text-white transition-colors" />
          Back to User Management
        </Link>
        
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mr-3 sm:mr-4 shadow-lg">
            <FaUserShield className="text-white text-lg sm:text-xl" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Add New Admin</h1>
            <p className="text-blue-200 mt-1">Create a new administrator account</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-lg p-4 sm:p-8 border border-white/20">
        {error && (
          <div className="bg-red-500/20 border border-red-400/30 text-red-300 px-4 py-3 rounded-lg text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-green-400/30 text-green-300 px-4 py-3 rounded-lg text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-200 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition"
                placeholder="Enter full name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-blue-200 mb-2">
              Email Address *
            </label>
            <div className="relative">
              <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition"
                placeholder="Enter email address"
              />
            </div>
          </div>

          {/* Phone Field */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-blue-200 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition"
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-blue-200 mb-2">
                Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition"
                  placeholder="Create password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-blue-200 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-300 text-sm" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition"
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-400/20">
            <p className="text-blue-300 text-xs font-medium mb-1">Password Requirements:</p>
            <ul className="text-blue-200 text-xs space-y-1">
              <li className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${formData.password.length >= 6 ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                At least 6 characters long
              </li>
              <li className="flex items-center">
                <div className={`w-1.5 h-1.5 rounded-full mr-2 ${formData.password === formData.confirmPassword && formData.password ? 'bg-green-400' : 'bg-blue-400'}`}></div>
                Passwords must match
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 disabled:from-purple-400 disabled:to-purple-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Admin...
                </>
              ) : (
                <>
                  <FaUserShield className="text-sm" />
                  Create Admin Account
                </>
              )}
            </button>
            
            <Link 
              href="/admin/users"
              className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-200 text-center flex items-center justify-center gap-2"
            >
              <FaArrowLeft className="text-sm" />
              Cancel
            </Link>
          </div>
        </form>

        {/* Admin Privileges Info */}
        <div className="mt-6 sm:mt-8 border-t border-white/20 pt-4 sm:pt-6">
          <h3 className="text-sm font-semibold text-white mb-2">Admin Privileges</h3>
          <ul className="text-blue-200 text-xs space-y-1">
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
              Full access to user management
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
              Ability to approve/reject sellers
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
              Access to system reports and analytics
            </li>
            <li className="flex items-center">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
              Platform configuration and settings
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}