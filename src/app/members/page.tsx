'use client';

import { useState } from 'react';
import Link from 'next/link';

type IconProps = { className?: string; size?: number };

const SearchIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const UserPlusIcon = ({ className, size = 28 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);
const ShieldIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const AlertIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const CheckCircleIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const PhoneIcon = ({ className, size = 14 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

export default function MembersScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'pending'>('all');

  const mockMembers = [
    { id: '1', name: 'Wanjiku Mwaura', phone: '+254712345678', totalContrib: 45000, status: 'active', role: 'member' },
    { id: '2', name: 'Kamau Omondi', phone: '+254723456789', totalContrib: 42000, status: 'active', role: 'member' },
    { id: '3', name: 'Achieng Odhiambo', phone: '+254734567890', totalContrib: 50000, status: 'active', role: 'chair' },
    { id: '4', name: 'Mary Wairimu', phone: '+254745678901', totalContrib: 38000, status: 'active', role: 'secretary' },
    { id: '5', name: 'John Njoroge', phone: '+254756789012', totalContrib: 0, status: 'suspended', role: 'member' },
  ];

  const filteredMembers = mockMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || member.status === filter;
    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (cents: number) => `KES ${(cents / 100).toLocaleString()}`;

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Members</h1>
        <p className="text-gray-500 text-sm">{mockMembers.length} total members</p>
        <div className="mt-4 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search member..." className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
        </div>
        <div className="flex gap-2 mt-4">
          {(['all', 'active', 'pending'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`flex-1 py-3 rounded-xl font-medium capitalize transition-colors ${filter === f ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}>
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Pending'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pb-24">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white p-5 rounded-2xl shadow border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">{member.name.charAt(0)}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{member.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <PhoneIcon /> {member.phone.replace(/(\d{3})\d{3}(\d{4})/, '$1****$2')}
                  </div>
                </div>
              </div>
              {member.status === 'active' ? <CheckCircleIcon className="text-green-500" /> : <AlertIcon className="text-amber-500" />}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Total Contributed</div>
                <div className="font-bold text-gray-900">{formatCurrency(member.totalContrib)}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">Role</div>
                <div className="font-medium text-gray-900 capitalize flex items-center gap-2">
                  {member.role === 'chair' && <ShieldIcon className="text-amber-600" />}
                  {member.role}
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">Send Reminder</button>
              <button className="px-4 py-3 border border-gray-300 hover:border-green-500 rounded-xl transition-colors">View History</button>
            </div>
          </div>
        ))}
      </div>
      <button className="fixed bottom-24 right-4 w-16 h-16 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95">
        <UserPlusIcon />
      </button>
    </div>
  );
}
