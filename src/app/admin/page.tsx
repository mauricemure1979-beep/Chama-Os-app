'use client';

import { useState, useLayoutEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/session';
import { db } from '@/lib/db';

const BackIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const CheckIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const WarningIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

interface MemberContribution {
  id: string;
  name: string;
  phone: string;
  totalContributions: number;
  status: string;
  role: string;
  lastContribution?: string;
}

function getInitialMembers(): MemberContribution[] {
  if (typeof window === 'undefined') return [];
  db.initDemo();
  return db.getMembers();
}

function getInitialContributions() {
  if (typeof window === 'undefined') return [];
  return db.getContributions();
}

export default function AdminPage() {
  const router = useRouter();
  const { session, isAdmin, logout } = useSession();
  const [members, setMembers] = useState<MemberContribution[]>(getInitialMembers);
  const [contributions, setContributions] = useState<Array<{id: string; memberId: string; amount: number; date: string; status: string}>>(getInitialContributions);
  const [filter, setFilter] = useState('all');
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const formatCurrency = (cents: number) => `KES ${cents.toLocaleString()}`;
  
  const totalCollected = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalMembers = members.length;
  const paidMembers = contributions.filter(c => c.status === 'paid').length;
  const pendingMembers = totalMembers - paidMembers;

  const filteredMembers = members.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'paid') return m.status === 'active';
    if (filter === 'pending') return !contributions.find(c => c.memberId === m.id && c.status === 'paid');
    return true;
  });

  const handleVerify = (contributionId: string) => {
    const updated = contributions.map(c => 
      c.id === contributionId ? { ...c, status: 'paid' as const } : c
    );
    localStorage.setItem('chama_contributions', JSON.stringify(updated));
    setContributions(updated);
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-lg">
          <BackIcon size={20} />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <button onClick={logout} className="ml-auto text-sm text-red-600 hover:text-red-700">Logout</button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-600 text-white p-4 rounded-xl">
          <div className="text-green-100 text-xs">Total Collected</div>
          <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="bg-blue-600 text-white p-4 rounded-xl">
          <div className="text-blue-100 text-xs">Total Members</div>
          <div className="text-2xl font-bold">{totalMembers}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="text-gray-500 text-xs">Paid This Cycle</div>
          <div className="text-xl font-bold text-green-600">{paidMembers}</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="text-gray-500 text-xs">Pending</div>
          <div className="text-xl font-bold text-amber-600">{pendingMembers}</div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'paid', 'pending'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              filter === f 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
          All Members ({filteredMembers.length})
        </div>
        <div className="divide-y divide-gray-100">
          {filteredMembers.map((member) => {
            const memberContribution = contributions.find(c => c.memberId === member.id);
            const isPaid = memberContribution?.status === 'paid';
            
            return (
              <div key={member.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isPaid ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                      <span className={`font-bold ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                        {member.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {member.name}
                        {member.role === 'treasurer' && (
                          <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Admin</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{member.phone}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(member.totalContributions)}
                    </div>
                    <div className={`text-xs ${isPaid ? 'text-green-600' : 'text-amber-600'}`}>
                      {isPaid ? 'Paid' : 'Pending'}
                    </div>
                  </div>
                </div>
                {memberContribution && !isPaid && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleVerify(memberContribution.id)}
                      className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                    >
                      Verify Payment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 font-semibold text-gray-700">
          Recent Contributions
        </div>
        <div className="divide-y divide-gray-100">
          {contributions.slice(0, 10).map((contribution) => (
            <div key={contribution.id} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">Member #{contribution.memberId}</div>
                <div className="text-xs text-gray-500">{contribution.date}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-semibold text-gray-900">{formatCurrency(contribution.amount)}</div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  contribution.status === 'paid' ? 'bg-green-100' : 'bg-amber-100'
                }`}>
                  {contribution.status === 'paid' ? (
                    <CheckIcon size={14} className="text-green-600" />
                  ) : (
                    <WarningIcon size={14} className="text-amber-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Link href="/" className="block text-center text-gray-500 text-sm py-4">
        Back to Home
      </Link>
    </div>
  );
}