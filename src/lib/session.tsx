'use client';

import { createContext, useContext, useState, useLayoutEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface Session {
  user_id: string;
  phone_number: string;
  role: string;
  name: string;
}

interface SessionContextType {
  session: Session | null;
  loading: boolean;
  login: (session: Session) => void;
  logout: () => void;
  isAdmin: boolean;
}

const SessionContext = createContext<SessionContextType | null>(null);

function getInitialSession(): Session | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('chama_session');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem('chama_session');
    }
  }
  return null;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(getInitialSession);
  const [loading, setLoading] = useState(false);

  const login = (newSession: Session) => {
    localStorage.setItem('chama_session', JSON.stringify(newSession));
    setSession(newSession);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('chama_session');
    setSession(null);
    router.push('/login');
  };

  return (
    <SessionContext.Provider value={{ 
      session, 
      loading, 
      login, 
      logout,
      isAdmin: session?.role === 'treasurer' || session?.role === 'chair'
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}