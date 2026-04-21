'use client';

import { useState, useLayoutEffect } from 'react';
import { useRouter } from 'next/navigation';
import HomeScreen from './screens/HomeScreen';

function hasSession(): boolean {
  if (typeof window === 'undefined') return true;
  return !!localStorage.getItem('chama_session');
}

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(hasSession);

  useLayoutEffect(() => {
    if (!loading) {
      router.push('/login');
    }
  }, [router, loading]);

  if (!loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <HomeScreen />;
}