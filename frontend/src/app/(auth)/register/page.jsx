'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GoogleLogin } from '@react-oauth/google';
import {
  FaEnvelope, FaLock, FaUser, FaPhone,
  FaExclamationTriangle, FaUserPlus, FaTicketAlt,
  FaEye, FaEyeSlash, FaAt
} from 'react-icons/fa';
import { useRole } from '../../../contexts/RoleContext';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useRole();

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
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        router.push('/buyer');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credentialResponse.credential }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
        if (data.needsUsername) {
          router.push('/login?setUsername=1');
        } else {
          router.push('/buyer');
        }
      } else {
        setError(data.message || 'Google sign-up failed');
      }
    } catch {
      setError('Network error during Google sign-up.');
    } finally {
      setLoading(false);
    }
  };

  // const handleFacebookLogin = () => {
  //   const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  //   if (!appId) {
  //     setError('Facebook login is not configured.');
  //     return;
  //   }
  //   const redirectUri = encodeURIComponent(`${window.location.origin}/auth/facebook/callback`);
  //   const scope = encodeURIComponent('email,public_profile');
  //   window.location.href = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  // };

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/31160152/pexels-photo-31160152/free-photo-of-vibrant-football-match-at-night-stadium.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-10 sm:py-12 px-4">
        <div className="relative z-10 w-full sm:w-[400px] md:w-[500px] lg:w-[550px] p-5 sm:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl text-white">

          <div className="text-center mb-5 sm:mb-6">
            <div className="flex items-center justify-center mb-3 sm:mb-4">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600/80 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <FaTicketAlt className="text-white text-base sm:text-lg" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">TicketHub</h1>
                <p className="text-xs sm:text-sm text-blue-200">Your Ticket Marketplace</p>
              </div>
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-white">Create Account</h2>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">Join as a buyer — become a seller anytime</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm text-blue-200 mb-1">Full Name</label>
              <div className="relative">
                <FaUser className="absolute left-3 top-2.5 sm:top-3 text-blue-300 text-sm" />
                <input
                  id="name" type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Your full name"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs sm:text-sm text-blue-200 mb-1">Username</label>
              <div className="relative">
                <FaAt className="absolute left-3 top-2.5 sm:top-3 text-blue-300 text-sm" />
                <input
                  id="username" type="text" required minLength={3}
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Choose a username"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm text-blue-200 mb-1">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-2.5 sm:top-3 text-blue-300 text-sm" />
                <input
                  id="email" type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Your email"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs sm:text-sm text-blue-200 mb-1">Phone Number</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-2.5 sm:top-3 text-blue-300 text-sm" />
                <input
                  id="phone" type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Phone number (optional)"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm text-blue-200 mb-1">Password</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-3 text-blue-300 text-sm top-1/2 -translate-y-1/2" />
                <input
                  id="password" type={showPassword ? 'text' : 'password'} required minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Create a password"
                />
                <button type="button" className="absolute right-3 text-blue-300 hover:text-blue-100 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-xs sm:text-sm text-blue-200 mb-1">Confirm Password</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-3 text-blue-300 text-sm top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Confirm your password"
                />
                <button type="button" className="absolute right-3 text-blue-300 hover:text-blue-100 top-1/2 -translate-y-1/2" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-lg transition flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Creating Account...</>
              ) : (
                <><FaUserPlus className="mr-2" /> Create Account</>
              )}
            </button>
          </form>

          {/* OAuth */}
          <div className="mt-5 sm:mt-6">
            <p className="text-center text-blue-200 text-xs sm:text-sm mb-3">Or sign up with</p>
            <div className="flex flex-col items-center gap-3">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-up failed. Please try again.')}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="signup_with"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-blue-200 text-xs sm:text-sm mt-5 sm:mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 font-semibold hover:text-blue-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
