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
const PlusIcon = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const TrashIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const BookIcon = ({ size = 24, className = '' }: { size?: number; className?: string }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

interface MemberContribution {
  id: string;
  name: string;
  phone: string;
  totalContributions: number;
  status: string;
  role: string;
}

interface Rule {
  id: string;
  title: string;
  content: string;
  category: string;
  createdAt?: string;
}

type TabType = 'members' | 'rules';

const RULE_CATEGORIES = [
  { value: 'contribution', label: 'Contribution', color: 'bg-blue-100 text-blue-700' },
  { value: 'fine', label: 'Fine & Penalty', color: 'bg-red-100 text-red-700' },
  { value: 'payout', label: 'Payout', color: 'bg-green-100 text-green-700' },
  { value: 'membership', label: 'Membership', color: 'bg-purple-100 text-purple-700' },
  { value: 'meeting', label: 'Meeting', color: 'bg-amber-100 text-amber-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100 text-gray-700' },
];

function getInitialData() {
  if (typeof window === 'undefined') return { members: [], contributions: [], rules: [] };
  db.initDemo();
  return {
    members: db.getMembers(),
    contributions: db.getContributions(),
    rules: db.getRules()
  };
}

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, logout } = useSession();
  const initialData = getInitialData();
  
  const [members, setMembers] = useState(initialData.members);
  const [contributions, setContributions] = useState(initialData.contributions);
  const [rules, setRules] = useState<Rule[]>(initialData.rules);
  const [filter, setFilter] = useState('all');
  const [activeTab, setActiveTab] = useState<TabType>('members');
  
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleContent, setRuleContent] = useState('');
  const [ruleCategory, setRuleCategory] = useState('contribution');

  useLayoutEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  const formatCurrency = (cents: number) => `KES ${cents.toLocaleString()}`;
  
  const totalCollected = contributions.reduce((sum: number, c: { amount: number }) => sum + c.amount, 0);
  const totalMembers = members.length;
  const paidMembers = contributions.filter((c: { status: string }) => c.status === 'paid').length;
  const pendingMembers = totalMembers - paidMembers;

  const filteredMembers = members.filter((m: MemberContribution) => {
    if (filter === 'all') return true;
    if (filter === 'paid') return m.status === 'active';
    if (filter === 'pending') return !contributions.find((c: { memberId: string; status: string }) => c.memberId === m.id && c.status === 'paid');
    return true;
  });

  const handleVerify = (contributionId: string) => {
    const updated = contributions.map((c: { id: string; status: string }) => 
      c.id === contributionId ? { ...c, status: 'paid' as const } : c
    );
    localStorage.setItem('chama_contributions', JSON.stringify(updated));
    setContributions(updated);
  };

  const handleSaveRule = () => {
    if (!ruleTitle.trim() || !ruleContent.trim()) return;

    if (editingRule) {
      db.updateRule(editingRule.id, { title: ruleTitle, content: ruleContent, category: ruleCategory });
      setRules(rules.map(r => r.id === editingRule.id ? { ...r, title: ruleTitle, content: ruleContent, category: ruleCategory } : r));
    } else {
      const newRule = { id: crypto.randomUUID(), title: ruleTitle, content: ruleContent, category: ruleCategory, createdAt: new Date().toISOString() };
      db.saveRule(newRule);
      setRules([...rules, newRule]);
    }

    setRuleTitle('');
    setRuleContent('');
    setRuleCategory('contribution');
    setEditingRule(null);
    setShowRuleForm(false);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setRuleTitle(rule.title);
    setRuleContent(rule.content);
    setRuleCategory(rule.category);
    setShowRuleForm(true);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      db.deleteRule(ruleId);
      setRules(rules.filter(r => r.id !== ruleId));
    }
  };

  const getCategoryColor = (category: string) => {
    return RULE_CATEGORIES.find(c => c.value === category)?.color || 'bg-gray-100 text-gray-700';
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

      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
            activeTab === 'members' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Members
        </button>
        <button
          onClick={() => setActiveTab('rules')}
          className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'rules' 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <BookIcon size={18} /> Rules & Constitution
        </button>
      </div>

      {activeTab === 'members' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-600 text-white p-4 rounded-xl">
              <div className="text-emerald-100 text-xs">Total Collected</div>
              <div className="text-2xl font-bold">{formatCurrency(totalCollected)}</div>
            </div>
            <div className="bg-blue-600 text-white p-4 rounded-xl">
              <div className="text-blue-100 text-xs">Total Members</div>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
              <div className="text-gray-500 text-xs">Paid This Cycle</div>
              <div className="text-xl font-bold text-emerald-600">{paidMembers}</div>
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
                    ? 'bg-emerald-600 text-white' 
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
            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {filteredMembers.map((member: MemberContribution) => {
                const memberContribution = contributions.find((c: { memberId: string }) => c.memberId === member.id);
                const isPaid = memberContribution?.status === 'paid';
                
                return (
                  <div key={member.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isPaid ? 'bg-emerald-100' : 'bg-amber-100'
                        }`}>
                          <span className={`font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
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
                        <div className={`text-xs ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {isPaid ? 'Paid' : 'Pending'}
                        </div>
                      </div>
                    </div>
                    {memberContribution && !isPaid && (
                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => handleVerify(memberContribution.id)}
                          className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
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
        </>
      )}

      {activeTab === 'rules' && (
        <>
          <div className="bg-white rounded-xl shadow border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Group Rules & Constitution</h2>
                <p className="text-sm text-gray-500">Manage your group&apos;s rules and regulations</p>
              </div>
              <button
                onClick={() => { setEditingRule(null); setRuleTitle(''); setRuleContent(''); setRuleCategory('contribution'); setShowRuleForm(true); }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <PlusIcon size={18} /> Add Rule
              </button>
            </div>

            {showRuleForm && (
              <div className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">
                  {editingRule ? 'Edit Rule' : 'Add New Rule'}
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rule Title</label>
                    <input
                      type="text"
                      value={ruleTitle}
                      onChange={(e) => setRuleTitle(e.target.value)}
                      placeholder="e.g., Monthly Contribution"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={ruleContent}
                      onChange={(e) => setRuleContent(e.target.value)}
                      placeholder="Describe the rule in detail&hellip;"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={ruleCategory}
                      onChange={(e) => setRuleCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      {RULE_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveRule}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-medium"
                    >
                      {editingRule ? 'Update Rule' : 'Save Rule'}
                    </button>
                    <button
                      onClick={() => { setShowRuleForm(false); setEditingRule(null); }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {rules.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <BookIcon size={40} className="mx-auto mb-2 text-gray-300" />
                  <p>No rules added yet.</p>
                  <p className="text-sm">Click &quot;Add Rule&quot; to create your first group rule.</p>
                </div>
              ) : (
                rules.map((rule) => (
                  <div key={rule.id} className="border border-gray-200 rounded-xl p-4 hover:border-emerald-300 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{rule.title}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(rule.category)}`}>
                            {RULE_CATEGORIES.find(c => c.value === rule.category)?.label}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm">{rule.content}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg"
                        >
                          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <Link href="/" className="block text-center text-gray-500 text-sm py-4">
        Back to Home
      </Link>
    </div>
  );
}