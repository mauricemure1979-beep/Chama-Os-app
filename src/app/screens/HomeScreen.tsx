'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { db } from '@/lib/db';

type IconProps = { className?: string; size?: number };

const PlusIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const UsersIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const FileIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const SettingsIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const WalletIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);
const ChatIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);
const LogoutIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);
const AdminIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

function getInitialContributions(): Array<{id: string; memberName: string; amount: number; date: string; status: string}> {
  if (typeof window === 'undefined') return [];
  db.initDemo();
  return db.getContributions();
}

export default function HomeScreen() {
  const router = useRouter();
  const { session, logout, isAdmin } = useSession();
  const [contributions, setContributions] = useState<Array<{id: string; memberName: string; amount: number; date: string; status: string}>>(getInitialContributions);

  const mockChama = { totalBalance: 450000, nextPayoutDate: '2025-05-05', nextPayoutMember: 'Wanjiru Kimani', contributionAmount: 2000 };
  const formatCurrency = (cents: number) => `KES ${(cents / 100).toLocaleString()}`;

  const recentActivity = contributions.length > 0 ? contributions.slice(0, 5) : [
    { id: '1', memberName: 'Wanjiku', amount: 2000, date: 'Today', status: 'paid' },
    { id: '2', memberName: 'Kamau', amount: 100, date: 'Yesterday', status: 'applied' },
    { id: '3', memberName: 'Achieng', amount: 45000, date: '2 days ago', status: 'paid' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold mb-1">Mikopo Ya Biashara</h1>
            <p className="text-green-100 text-sm">Merry-go-round</p>
            {session?.name && <p className="text-green-200 text-xs mt-2">Welcome, {session.name}</p>}
          </div>
          <button onClick={handleLogout} className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <LogoutIcon size={20} />
          </button>
        </div>
      </div>

      {isAdmin && (
        <button onClick={() => router.push('/admin')} className="w-full bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
          <AdminIcon size={20} /><span className="font-semibold">Admin Dashboard</span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="text-gray-500 text-xs mb-1">Current Balance</div>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(mockChama.totalBalance)}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="text-gray-500 text-xs mb-1">Next Payout</div>
          <div className="text-lg font-bold text-gray-900">{new Date(mockChama.nextPayoutDate).toLocaleDateString('sw-KE', { day: 'numeric', month: 'short' })}</div>
          <div className="text-xs text-gray-500 truncate">{mockChama.nextPayoutMember}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => router.push('/add-contribution')} className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-2xl shadow-lg transition-all active:scale-95 text-center">
          <PlusIcon className="mx-auto mb-2 text-white" /><span className="font-semibold text-lg">Add Contribution</span>
        </button>
        <button onClick={() => router.push('/members')} className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:border-green-200 transition-all active:scale-95 text-center">
          <UsersIcon className="mx-auto mb-2 text-gray-700" /><span className="font-semibold text-lg text-gray-900">Members</span>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => router.push('/chat')} className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95">
          <ChatIcon size={20} /><span className="font-semibold">Group Chat</span>
        </button>
        <button onClick={() => router.push('/statements')} className="bg-white p-4 rounded-xl shadow border border-gray-100 hover:border-green-200 transition-all active:scale-95 text-center">
          <FileIcon className="mx-auto mb-1 text-gray-700" /><span className="font-semibold text-gray-900">Statements</span>
        </button>
      </div>
      <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
        <h2 className="font-semibold text-gray-900 mb-3">This Cycle</h2>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Paid out of {formatCurrency(mockChama.contributionAmount * 10)}</span>
          <span className="font-bold text-green-600">{formatCurrency(mockChama.totalBalance)}</span>
        </div>
        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: '45%' }} /></div>
      </div>
      <div className="space-y-3">
        <h2 className="font-semibold text-gray-900">Recent Activity</h2>
        {recentActivity.map((activity) => (
          <div key={activity.id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity.status === 'paid' ? 'bg-green-100' : 'bg-red-100'}`}>
                <WalletIcon className={activity.status === 'paid' ? 'text-green-600' : 'text-red-600'} />
              </div>
              <div>
                <div className="font-medium text-gray-900">{activity.memberName}</div>
                <div className="text-xs text-gray-500">{activity.date}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-semibold ${activity.status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                {activity.status === 'paid' ? '+' : '-'}{formatCurrency(activity.amount || 0)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around">
        <Link href="/" className="flex flex-col items-center text-green-600"><WalletIcon size={20} /><span className="text-xs mt-1">Home</span></Link>
        <Link href="/add-contribution" className="flex flex-col items-center text-gray-400 hover:text-green-600"><PlusIcon size={20} /><span className="text-xs mt-1">Add</span></Link>
        <Link href="/members" className="flex flex-col items-center text-gray-400 hover:text-green-600"><UsersIcon size={20} /><span className="text-xs mt-1">Members</span></Link>
        <Link href="/chat" className="flex flex-col items-center text-gray-400 hover:text-green-600"><ChatIcon size={20} /><span className="text-xs mt-1">Chat</span></Link>
        <Link href="/statements" className="flex flex-col items-center text-gray-400 hover:text-green-600"><FileIcon size={20} /><span className="text-xs mt-1">Statements</span></Link>
      </nav>
    </div>
  );
}