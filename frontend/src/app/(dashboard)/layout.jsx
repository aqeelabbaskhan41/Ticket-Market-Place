'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardSidebar from '../../../components/dashboard/DashboardSidebar';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import { useRole } from '../../contexts/RoleContext';

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentRole, isInitialized, user } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        router.push('/login');
        return;
      }

      if (user && currentRole) {
        // Get current path and check if it matches the current role
        const currentPath = window.location.pathname;
        const rolePath = `/${currentRole}`; // Remove /dashboard prefix since we're in (dashboard) group
        
        // If we're not on the correct role path, redirect
        if (!currentPath.startsWith(rolePath) && currentPath !== '/') {
          console.log('DashboardLayout - Redirecting to:', rolePath);
          router.push(rolePath);
        }
      }
    }
  }, [currentRole, isInitialized, router, user]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen bg-gray-900 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
        <span className="ml-3 text-white text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 overflow-hidden">
      <div className="flex h-screen bg-gray-900/50 w-full relative">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/31160152/pexels-photo-31160152/free-photo-of-vibrant-football-match-at-night-stadium.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')" 
          }}
        ></div>
        
        {/* Main Content (Relative to be above background) */}
        <div className="flex w-full relative z-10">
          {/* Sidebar */}
          <DashboardSidebar 
            isOpen={sidebarOpen} 
            onClose={() => setSidebarOpen(false)} 
          />
          
          {/* Main content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <DashboardHeader onToggleSidebar={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-auto p-4 relative">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}