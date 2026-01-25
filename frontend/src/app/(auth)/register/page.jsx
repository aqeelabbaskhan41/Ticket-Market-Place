'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaBuilding,
  FaExclamationTriangle,
  FaUserPlus,
  FaTicketAlt,
  FaGoogle,
  FaFacebookF,
  FaApple,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'buyer',
    businessName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          role: formData.role,
          businessName: formData.role === 'seller' ? formData.businessName : ''
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* 🔹 Fixed Background */}
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/31160152/pexels-photo-31160152/free-photo-of-vibrant-football-match-at-night-stadium.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          backgroundAttachment: "fixed",
        }}
      >
        {/* Optional dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* 🔹 Scrollable Form Content */}
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="relative z-10 w-[90%] sm:w-[400px] md:w-[500px] lg:w-[550px] p-8 sm:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-white">
          
          {/* Logo and Title */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600/80 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <FaTicketAlt className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">TicketHub</h1>
                <p className="text-sm text-blue-200">Your Ticket Marketplace</p>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-white">Create Account</h2>
            <p className="text-blue-200 text-sm mt-1">Join our community today</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-400 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name & Email */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm text-blue-200 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3 text-blue-300 text-sm" />
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-blue-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-3 text-blue-300 text-sm" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-blue-200 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3 text-blue-300 text-sm" />
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm text-blue-200 mb-2">
                Account Type
              </label>
              <div className="relative">
                <select
                  id="role"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition appearance-none"
                >
                  <option value="buyer" className="text-gray-900">Buyer</option>
                  <option value="seller" className="text-gray-900">Seller</option>
                </select>
                <div className="absolute right-3 top-3 text-blue-300 pointer-events-none">
                  ▼
                </div>
              </div>
            </div>

            {/* Business Name (only if seller) */}
            {formData.role === 'seller' && (
              <div>
                <label htmlFor="businessName" className="block text-sm text-blue-200 mb-2">
                  Business Name
                </label>
                <div className="relative">
                  <FaBuilding className="absolute left-3 top-3 text-blue-300 text-sm" />
                  <input
                    id="businessName"
                    type="text"
                    required
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Enter your business name"
                  />
                </div>
              </div>
            )}

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm text-blue-200 mb-2">
                  Password
                </label>
                <div className="relative flex items-center">
                  <FaLock className="absolute left-3 text-blue-300 text-sm top-1/2 -translate-y-1/2" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength="6"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Create a password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-blue-300 hover:text-blue-100 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-blue-200 mb-2">
                  Confirm Password
                </label>
                <div className="relative flex items-center">
                  <FaLock className="absolute left-3 text-blue-300 text-sm top-1/2 -translate-y-1/2" />
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 text-blue-300 hover:text-blue-100 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2.5 rounded-lg font-semibold shadow-lg transition flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <FaUserPlus className="mr-2" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Social Logins */}
          <div className="mt-6">
            <p className="text-center text-blue-200 text-sm mb-3">
              Or continue with
            </p>
            <div className="flex justify-center gap-4">
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-yellow-400 hover:text-red-300 transition">
                <FaGoogle />
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-blue-400 hover:text-blue-300 transition">
                <FaFacebookF />
              </button>
              <button className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white transition">
                <FaApple />
              </button>
            </div>
          </div>

          {/* Sign In */}
          <p className="text-center text-blue-200 text-sm mt-6">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-400 font-semibold hover:text-blue-300"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
