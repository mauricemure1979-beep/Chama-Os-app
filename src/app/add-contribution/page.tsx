'use client';

import { useState } from 'react';
import Link from 'next/link';

type IconProps = { className?: string; size?: number };

const MicIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" y1="19" x2="12" y2="23" />
    <line x1="8" y1="23" x2="16" y2="23" />
  </svg>
);
const SquareIcon = ({ className, size = 24 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor" />
);
const CheckIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const ClockIcon = ({ className, size = 20 }: IconProps) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function AddContributionScreen() {
  const [input, setInput] = useState('');
  const [parsed, setParsed] = useState<{ memberName: string; amount: number | null; date: Date | null; confidence: number; raw_text: string } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const allMembers = ['Wanjiku', 'Kamau', 'Achieng', 'Mary', 'John', 'Peter', 'James', 'Sarah'];

  const handleTextChange = (text: string) => {
    setInput(text);
    if (text.length > 3) {
      // @ts-ignore - global from lib
      const result = (window as any).parseVoiceInput ? (window as any).parseVoiceInput(text) : { memberName: '', amount: null, date: null, confidence: 0, raw_text: text };
      setParsed(result);
      if (result.memberName) {
        // @ts-ignore
        setSuggestions((window as any).getFuzzyNameSuggestions ? (window as any).getFuzzyNameSuggestions(result.memberName, allMembers) : []);
        setShowSuggestions(result.confidence < 0.7);
      }
      if (result.amount) setAmount(result.amount.toString());
      if (result.date) setDate(result.date.toISOString().split('T')[0]);
    } else {
      setParsed(null);
      setShowSuggestions(false);
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setTimeout(() => { setIsRecording(false); handleTextChange('Wanjiku ameweka 2000 leo'); }, 2000);
  };

  const handleSubmit = async () => {
    const amt = parseFloat(amount) || 0;
    if (!selectedMember || !amt) {
      alert('Tafadhari jaza jina na kiasi (Please fill name and amount)');
      return;
    }
    alert(`Recorded: ${selectedMember} - KES ${amt}\n\nM-Pesa prompt will open.`);
    setInput(''); setParsed(null); setAmount(''); setSelectedMember(null);
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return `KES ${num.toLocaleString()}`;
  };

  return (
    <div className="p-4 space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Record Contribution</h1>
        <p className="text-gray-500 text-sm mb-6">Speak or type in Sheng/Swahili</p>
        <div className="space-y-4">
          <div className="flex gap-3">
            {!isRecording ? (
              <button onClick={startRecording} className="flex-1 bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 transition-all">
                <MicIcon className="text-white" /><span className="font-semibold">Press to Speak</span>
              </button>
            ) : (
              <button onClick={() => setIsRecording(false)} className="flex-1 bg-red-600 hover:bg-red-700 text-white p-4 rounded-xl flex items-center justify-center gap-3 animate-pulse">
                <SquareIcon className="text-white" /><span className="font-semibold">Stop Recording</span>
              </button>
            )}
          </div>
          {parsed && parsed.confidence > 0.5 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
              <div className="flex items-center gap-2 text-green-700 text-sm mb-2">
                <CheckIcon /><span>Parsed from voice</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between"><span className="text-gray-600">Member:</span><span className="font-semibold text-gray-900">{parsed.memberName}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Amount:</span><span className="font-semibold text-gray-900">{formatCurrency(parsed.amount?.toString() || '0')}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Date:</span><span className="font-semibold text-gray-900">{parsed.date?.toLocaleDateString('sw-KE')}</span></div>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Member Name <span className="text-red-500">*</span></label>
            <input type="text" value={selectedMember || parsed?.memberName || ''} onChange={(e) => setSelectedMember(e.target.value)} onFocus={() => setShowSuggestions(true)} placeholder="Wanjiku" className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            {showSuggestions && suggestions.length > 0 && (
              <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {suggestions.map((name, i) => (
                  <button key={i} onClick={() => { setSelectedMember(name); setShowSuggestions(false); }} className="w-full text-left p-3 hover:bg-green-50 first:rounded-t-xl last:rounded-b-xl">{name}</button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Amount (KES) <span className="text-red-500">*</span></label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="2000" className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
            <div className="flex gap-2 mt-2">
              {[1000, 2000, 5000, 10000].map((preset) => (
                <button key={preset} onClick={() => setAmount(preset.toString())} className="flex-1 py-2 bg-gray-100 hover:bg-green-100 rounded-lg text-sm font-medium transition-colors">
                  {formatCurrency(preset.toString())}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
        </div>
        <button onClick={handleSubmit} disabled={!selectedMember || !amount} className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white p-5 rounded-xl font-bold text-lg shadow-lg mt-6 transition-all active:scale-[0.98]">
          Record & Send M-Pesa Prompt
        </button>
        <div className="mt-4 flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-xl">
          <ClockIcon className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">You have 24 hours to complete payment</p>
            <p className="text-amber-700">M-Pesa prompt will appear on your phone</p>
          </div>
        </div>
      </div>
    </div>
  );
}
