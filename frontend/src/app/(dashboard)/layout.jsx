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
      <div className="flex h-screen bg-cover bg-center bg-fixed bg-no-repeat" style={{ 
        backgroundImage: "url('Z')" 
      }}>
        <div className="flex h-screen bg-gray-900/50 w-full items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cover bg-center bg-fixed bg-no-repeat" style={{ 
      backgroundImage: "url('Z')" 
    }}>
      <div className="flex h-screen bg-gray-900/50 w-full">
        {/* Sidebar */}
        <DashboardSidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
        
        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader onToggleSidebar={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}