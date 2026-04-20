'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const RoleContext = createContext();

export function RoleProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsInitialized(true);
  }, []);

  const handleRoleSwitch = async (newRole) => {
    try {
      if (!user || user.role !== 'seller') {
        console.error('Only sellers can switch roles');
        return { success: false, message: 'Only sellers can switch roles' };
      }

      // Block switching to seller mode if still pending approval
      if (newRole === 'seller' && user.status === 'pending') {
        return { success: false, message: 'Your seller account is pending admin approval. You cannot switch to seller mode yet.' };
      }

      const token = localStorage.getItem('token');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiBaseUrl}/roles/switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        window.location.reload();
      }
      return data;
    } catch (error) {
      console.error('Role switch error:', error);
      return { success: false, message: 'Error switching roles. Please try again.' };
    }
  };

  const requestSellerRole = async (sellerDetails) => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiBaseUrl}/roles/request-seller`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sellerDetails)
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      return data;
    } catch (error) {
      console.error('Request seller role error:', error);
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const refreshUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
      
      const response = await fetch(`${apiBaseUrl}/roles/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const value = {
    user,
    currentRole: user?.activeRole || user?.role || 'buyer',
    actualRole: user?.role || 'buyer',
    handleRoleSwitch,
    requestSellerRole,
    refreshUser,
    canSwitchRoles: user?.role === 'seller', // ONLY sellers can switch
    isBuyer: (user?.activeRole || user?.role) === 'buyer',
    isSeller: (user?.activeRole || user?.role) === 'seller',
    isAdmin: user?.role === 'admin',
    isActualSeller: user?.role === 'seller',
    isActualBuyer: user?.role === 'buyer',
    isActualSeller: user?.role === 'seller',
    isActualBuyer: user?.role === 'buyer',
    isInitialized,
    login: (userData, token) => {
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', token);
      setUser(userData);
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}