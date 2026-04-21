'use client';

import { useState } from 'react';

type IconProps = { className?: string; size?: number };

const DownloadIcon = ({ className, size = 28 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ShareIcon = ({ className, size = 28 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
const CalendarIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
const FileIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);
const CreditCardIcon = ({ className, size = 16 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

export default function StatementsScreen() {
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);

  const mockStatements = [
    { month: 4, year: 2025, totalContrib: 60000, totalPayouts: 0, totalFines: 0, balance: 60000, generatedAt: '2025-04-01' },
    { month: 3, year: 2025, totalContrib: 60000, totalPayouts: 0, totalFines: 0, balance: 60000, generatedAt: '2025-03-01' },
    { month: 2, year: 2025, totalContrib: 60000, totalPayouts: 45000, totalFines: 0, balance: 15000, generatedAt: '2025-02-01' },
    { month: 1, year: 2025, totalContrib: 60000, totalPayouts: 0, totalFines: 100, balance: 59900, generatedAt: '2025-01-01' },
    { month: 12, year: 2024, totalContrib: 60000, totalPayouts: 0, totalFines: 200, balance: 59800, generatedAt: '2024-12-01' },
  ];

  const formatCurrency = (cents: number) => `KES ${(cents / 100).toLocaleString()}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const handleDownload = async (statement: typeof mockStatements[0]) => {
    alert(`Download PDF for ${months[statement.month - 1]} ${statement.year}`);
  };

  const handleShare = async (statement: typeof mockStatements[0]) => {
    const message = `Chama Statement - ${months[statement.month - 1]} ${statement.year}\n\nTotal Contributions: ${formatCurrency(statement.totalContrib)}\nTotal Payouts: ${formatCurrency(statement.totalPayouts)}\nFines: ${formatCurrency(statement.totalFines)}\nBalance: ${formatCurrency(statement.balance)}\n\nGenerated: ${new Date(statement.generatedAt).toLocaleDateString()}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Statements</h1>
        <p className="text-gray-500 text-sm">Monthly financial summaries</p>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {mockStatements.map((stmt, idx) => (
            <button key={idx} onClick={() => setSelectedMonth(stmt.month)} className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${selectedMonth === stmt.month ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-green-50'}`}>
              {months[stmt.month - 1]} {stmt.year}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 pb-24">
        {selectedMonth !== null ? (
          (() => {
            const stmt = mockStatements.find(s => s.month === selectedMonth);
            if (!stmt) return null;
            return (
              <div className="space-y-4">
                <div className="bg-white p-6 rounded-2xl shadow border-2 border-green-200">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{months[stmt.month - 1]} {stmt.year}</h2>
                    <FileIcon className="text-green-600" />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-600">Total Contributions</span><span className="font-bold text-green-600">{formatCurrency(stmt.totalContrib)}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-600">Payouts & Withdrawals</span><span className="font-bold text-red-600">-{formatCurrency(stmt.totalPayouts)}</span></div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100"><span className="text-gray-600">Fines & Penalties</span><span className="font-bold text-amber-600">-{formatCurrency(stmt.totalFines)}</span></div>
                    <div className="flex justify-between items-center py-4 bg-green-50 -mx-4 px-4 rounded-b-2xl">
                      <span className="font-semibold text-gray-900">Net Balance</span>
                      <span className="font-bold text-2xl text-green-700">{formatCurrency(stmt.balance)}</span>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2"><CreditCardIcon /> <span>M-Pesa Transaction IDs</span></div>
                    <div className="text-xs font-mono text-gray-700 space-y-1">
                      <div>LFJ3H7M - KES 2,000</div>
                      <div>XJA9B2C - KES 2,000</div>
                      <div>...</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleDownload(stmt)} className="bg-green-600 hover:bg-green-700 text-white p-5 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <DownloadIcon /><span className="font-semibold">Download PDF</span>
                  </button>
                  <button onClick={() => handleShare(stmt)} className="bg-[#25D366] hover:bg-[#20BD5A] text-white p-5 rounded-2xl flex flex-col items-center gap-2 transition-all">
                    <ShareIcon /><span className="font-semibold">Share to WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })()
        ) : (
          <div className="space-y-3">
            {mockStatements.map((stmt, idx) => (
              <div key={idx} onClick={() => setSelectedMonth(stmt.month)} className="bg-white p-5 rounded-2xl shadow border border-gray-100 cursor-pointer hover:border-green-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center"><CalendarIcon className="text-green-600" /></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{months[stmt.month - 1]} {stmt.year}</h3>
                      <p className="text-sm text-gray-500">{new Date(stmt.generatedAt).toLocaleDateString('sw-KE', { day: 'numeric', month: 'long' })}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{formatCurrency(stmt.balance)}</div>
                    <div className="text-xs text-gray-400">View details →</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
