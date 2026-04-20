'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { GoogleLogin } from '@react-oauth/google';
import Link from 'next/link';
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaExclamationTriangle, FaSignInAlt, FaTicketAlt,
  FaAt, FaCheck
} from 'react-icons/fa';
import { useRole } from '../../../contexts/RoleContext';

function UsernameModal({ token, onDone }) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/auth/set-username`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: username.trim().toLowerCase() })
      });
      const data = await res.json();
      if (res.ok) {
        onDone(data.user);
      } else {
        setError(data.message || 'Failed to set username');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 w-full max-w-sm text-white shadow-2xl">
        <div className="text-center mb-5 sm:mb-6">
          <div className="w-11 h-11 sm:w-12 sm:h-12 bg-blue-600/80 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FaAt className="text-white text-base sm:text-lg" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">Choose a Username</h2>
          <p className="text-blue-200 text-xs sm:text-sm mt-1">Pick a unique username for your account</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <FaExclamationTriangle className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-300 text-xs sm:text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaAt className="absolute left-3 top-3 text-blue-300 text-sm" />
            <input
              type="text" required minLength={3}
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
              placeholder="e.g. johndoe"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-lg transition flex items-center justify-center text-sm sm:text-base"
          >
            {loading ? (
              <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Saving...</>
            ) : (
              <><FaCheck className="mr-2" /> Confirm Username</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function LoginContent() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const router = useRouter();
  const { login } = useRole();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const setUsernameParam = searchParams.get('setUsername');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // If redirected here after OAuth with needsUsername flag
  useEffect(() => {
    if (setUsernameParam === '1') {
      setShowUsernameModal(true);
    }
  }, [setUsernameParam]);

  const redirectAfterLogin = (user) => {
    if (redirectPath) return router.push(redirectPath);
    if (user.role === 'admin') return router.push('/admin');
    if (user.role === 'seller') return router.push('/seller');
    return router.push('/buyer');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        login(data.user, data.token);
        redirectAfterLogin(data.user);
      } else {
        setError(data.message || 'Login failed');
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
          setShowUsernameModal(true);
        } else {
          redirectAfterLogin(data.user);
        }
      } else {
        setError(data.message || 'Google login failed');
      }
    } catch {
      setError('Network error during Google login.');
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
  //   const fbAuthUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
  //   window.location.href = fbAuthUrl;
  // };

  // const verifyFacebookToken = async (accessToken) => {
  //   setLoading(true);
  //   setError('');
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/auth/facebook`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ accessToken }),
  //     });
  //     const data = await response.json();
  //     if (response.ok) {
  //       login(data.user, data.token);
  //       if (data.needsUsername) {
  //         setShowUsernameModal(true);
  //       } else {
  //         redirectAfterLogin(data.user);
  //       }
  //     } else {
  //       setError(data.message || 'Facebook login failed');
  //     }
  //   } catch {
  //     setError('Network error during Facebook login.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleUsernameSet = (updatedUser) => {
    // Update stored user with username
    const token = localStorage.getItem('token');
    login(updatedUser, token);
    setShowUsernameModal(false);
    redirectAfterLogin(updatedUser);
  };

  return (
    <div className="relative min-h-screen">

      {showUsernameModal && (
        <UsernameModal
          token={localStorage.getItem('token')}
          onDone={handleUsernameSet}
        />
      )}

      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{
          backgroundImage:
            "url('https://images.pexels.com/photos/31160152/pexels-photo-31160152/free-photo-of-vibrant-football-match-at-night-stadium.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')",
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center py-10 sm:py-12 px-4">
        <div className="relative z-10 w-full sm:w-[400px] md:w-[500px] lg:w-[550px] p-5 sm:p-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">

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
            <h2 className="text-lg sm:text-xl font-semibold text-white">Welcome Back</h2>
            <p className="text-blue-200 text-xs sm:text-sm mt-1">Sign in to continue</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-400/30 rounded-lg p-3 mb-4 flex items-start space-x-3">
              <FaExclamationTriangle className="text-red-400 mt-0.5" />
              <p className="text-red-300 text-xs sm:text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs sm:text-sm text-blue-200 mb-1.5 sm:mb-2">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-2.5 sm:top-3 text-blue-300 text-sm" />
                <input
                  id="email" name="email" type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs sm:text-sm text-blue-200 mb-1.5 sm:mb-2">Password</label>
              <div className="relative flex items-center">
                <FaLock className="absolute left-3 text-blue-300 text-sm top-1/2 -translate-y-1/2" />
                <input
                  id="password" name="password" type={showPassword ? 'text' : 'password'} required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 sm:py-2.5 bg-white/10 border border-white/20 rounded-lg placeholder-blue-200 text-white text-sm sm:text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                  placeholder="Enter your password"
                />
                <button type="button" className="absolute right-3 text-blue-300 hover:text-blue-100 top-1/2 -translate-y-1/2" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end text-xs sm:text-sm">
              <a href="/forgot-password" className="text-blue-400 hover:text-blue-300">Forgot password?</a>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 sm:py-2.5 rounded-lg font-semibold shadow-lg transition flex items-center justify-center text-sm sm:text-base"
            >
              {loading ? (
                <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>Signing in...</>
              ) : (
                <><FaSignInAlt className="mr-2" /> Sign In</>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-6">
            <p className="text-center text-blue-200 text-xs sm:text-sm mb-3">Or continue with</p>
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Sign-In was unsuccessful. Please try again.')}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                />
              </div>
            </div>
          </div>

          <p className="text-center text-blue-200 text-xs sm:text-sm mt-5 sm:mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-blue-400 font-semibold hover:text-blue-300">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginContent />
    </Suspense>
  );
}
