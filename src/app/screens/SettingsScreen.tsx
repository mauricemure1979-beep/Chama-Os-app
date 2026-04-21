'use client';

import { useState } from 'react';

type IconProps = { className?: string; size?: number };

const SettingsIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);
const UsersIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
const CalendarIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const DollarIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);
const ShieldIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const BellIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);
const ZapIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const LockIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const HelpIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
const ChevronRightIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const LogOutIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    language: 'sw' as 'sw' | 'en',
    notifications: true,
    biometricLock: true,
    autoSync: true,
    dataUsage: 'low' as 'low' | 'medium' | 'high'
  });

  const chama = {
    name: 'Mikopo Ya Biashara', type: 'merry-go-round' as const,
    contributionAmount: 2000, cycleDay: 5, fineRate: 5, graceDays: 3, maxWithdrawal: 50000
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const toggle = <K extends keyof typeof settings>(key: K) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="bg-green-600 p-6"><h2 className="text-xl font-bold text-white">Chama Settings</h2><p className="text-green-100 text-sm mt-1">Manage your group configuration</p></div>
        <div className="p-4 space-y-1">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><SettingsIcon className="text-green-600" /><span className="font-medium text-gray-900">Chama Type</span></div>
            <div className="text-right"><div className="font-semibold text-gray-700 capitalize">{chama.type.replace('-', ' ')}</div></div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><DollarIcon className="text-green-600" /><span className="font-medium text-gray-900">Contribution Amount</span></div>
            <div className="text-right"><div className="font-semibold text-gray-700">{formatCurrency(chama.contributionAmount)}</div></div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><CalendarIcon className="text-green-600" /><span className="font-medium text-gray-900">Cycle Day</span></div>
            <div className="text-right"><div className="font-semibold text-gray-700">Day {chama.cycleDay} of month</div></div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><ShieldIcon className="text-green-600" /><span className="font-medium text-gray-900">Fine Rate</span></div>
            <div className="text-right"><div className="font-semibold text-gray-700">{chama.fineRate}% after {chama.graceDays} days</div></div>
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><SettingsIcon className="text-green-600" /><span className="font-medium text-gray-900">Max Withdrawal</span></div>
            <div className="text-right"><div className="font-semibold text-gray-700">{formatCurrency(chama.maxWithdrawal)}</div></div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">App Settings</h2></div>
        <div className="p-4 space-y-1">
          <button onClick={() => toggle('notifications')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><BellIcon className="text-green-600" /><div><div className="font-medium text-gray-900">Reminders</div><div className="text-sm text-gray-500">SMS/WhatsApp before due dates</div></div></div>
            <div className={`w-12 h-7 rounded-full relative ${settings.notifications ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.notifications ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
          <button onClick={() => toggle('dataUsage')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><ZapIcon className="text-green-600" /><div><div className="font-medium text-gray-900">Data Saver</div><div className="text-sm text-gray-500">Compress data usage</div></div></div>
            <div className={`w-12 h-7 rounded-full relative ${settings.dataUsage === 'low' ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.dataUsage === 'low' ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
          <button onClick={() => toggle('biometricLock')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><LockIcon className={settings.biometricLock ? 'text-green-600' : 'text-gray-400'} /><div><div className="font-medium text-gray-900">Biometric Lock</div><div className="text-sm text-gray-500">{settings.biometricLock ? 'Fingerprint/Face ID' : 'PIN required'}</div></div></div>
            <div className={`w-12 h-7 rounded-full relative ${settings.biometricLock ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.biometricLock ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
          <button onClick={() => toggle('autoSync')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><SettingsIcon className="text-green-600" /><div><div className="font-medium text-gray-900">Auto-Sync</div><div className="text-sm text-gray-500">Sync when data available</div></div></div>
            <div className={`w-12 h-7 rounded-full relative ${settings.autoSync ? 'bg-green-600' : 'bg-gray-300'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.autoSync ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-4 space-y-1">
          <button onClick={() => alert('Language changed')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><SettingsIcon className="text-green-600" /><div><div className="font-medium text-gray-900">Language</div><div className="text-sm text-gray-500">Kiswahili</div></div></div>
            <ChevronRightIcon />
          </button>
          <button onClick={() => alert('Help')} className="w-full flex items-center justify-between p-3 hover:bg-gray-50 -mx-2 rounded-xl transition-colors">
            <div className="flex items-center gap-3"><HelpIcon className="text-green-600" /><div><div className="font-medium text-gray-900">Help & Support</div><div className="text-sm text-gray-500">FAQs, contact us</div></div></div>
            <ChevronRightIcon />
          </button>
        </div>
      </div>

      <button className="w-full bg-red-50 hover:bg-red-100 text-red-600 p-5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-colors">
        <LogOutIcon /> Sign Out
      </button>
      <p className="text-center text-xs text-gray-400 pb-8">Chama OS v1.0.0</p>
    </div>
  );
}
