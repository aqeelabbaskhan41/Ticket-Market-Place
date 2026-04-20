'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { FaTicketAlt, FaExclamationTriangle } from 'react-icons/fa';

function FacebookCallbackContent() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.push('/login'), 1500);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' }}>
      <div className="text-center">
        <div className="w-14 h-14 bg-blue-600/80 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg">
          <FaTicketAlt className="text-white text-xl" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-2 text-red-400 mb-3">
            <FaExclamationTriangle />
            <p className="text-sm">Facebook login is currently disabled.</p>
          </div>
          <p className="text-blue-400 text-xs">Redirecting back to login...</p>
        </div>
      </div>
    </div>
  );
}

export default function FacebookCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0f172a' }}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400" />
      </div>
    }>
      <FacebookCallbackContent />
    </Suspense>
  );
}
