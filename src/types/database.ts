// Database types for Chama OS
export type UserRole = 'treasurer' | 'chair' | 'secretary' | 'member';
export type ChamaType = 'merry-go-round' | 'equal-shares' | 'investment';
export type PaymentMethod = 'mpesa' | 'cash' | 'bank_transfer' | 'ussd';
export type ContributionStatus = 'paid' | 'partial' | 'late' | 'pending';
export type PayoutStatus = 'pending' | 'processing' | 'paid' | 'failed';
export type MessageChannel = 'sms' | 'whatsapp' | 'ussd';
export type Language = 'sw' | 'en';

// User with role in a chama
export interface ChamaMember {
  id: string;
  chama_id: string;
  user_id: string;
  join_date: string;
  status: 'active' | 'suspended' | 'left';
  total_contributions_cents: number;
  last_contribution_date: string | null;
  next_payout_date: string | null;
  payout_order: number | null;
  user: {
    id: string;
    full_name: string;
    phone_number: string;
    role: UserRole;
  };
}

// Chama settings
export interface Chama {
  id: string;
  name: string;
  type: ChamaType;
  description: string;
  treasurer_id: string;
  contribution_amount_cents: number;
  cycle_day: number;
  cycle_type: 'monthly' | 'weekly' | 'custom';
  fine_rate_cents: number; // 500 = 5%
  fine_grace_days: number;
  max_withdrawal_limit_cents: number | null;
  requires_double_approval: boolean;
  is_active: boolean;
  member_count?: number;
}

// Contribution/ledger entry
export interface Contribution {
  id: string;
  chama_id: string;
  member_id: string;
  amount_cents: number;
  payment_method: PaymentMethod;
  mpesa_transaction_id: string | null;
  raw_mpesa_message: string | null;
  contribution_date: string;
  due_date: string | null;
  status: ContributionStatus;
  paid_amount_cents: number;
  is_verified: boolean;
  verified_at: string | null;
  member_name?: string;
}

// Payout record
export interface Payout {
  id: string;
  chama_id: string;
  member_id: string;
  amount_cents: number;
  payout_date: string;
  status: PayoutStatus;
  paid_at: string | null;
}

// Fine record
export interface Fine {
  id: string;
  chama_id: string;
  member_id: string;
  contribution_id: string | null;
  reason: string;
  amount_cents: number;
  applied_at: string;
  paid_at: string | null;
  is_waived: boolean;
}

// Dashboard summary
export interface DashboardSummary {
  chama: Chama;
  total_balance_cents: number;
  next_payout_date: string | null;
  next_payout_member?: string;
  contributions_this_cycle: number;
  pending_approvals: number;
  recent_activity: ActivityItem[];
}

// Recent activity for dashboard
export interface ActivityItem {
  id: string;
  type: 'contribution' | 'payout' | 'fine' | 'member_join';
  member_name: string;
  amount_cents?: number;
  date: string;
  description: string;
  status: string;
}

// Statement record
export interface Statement {
  id: string;
  month: number;
  year: number;
  total_contributions_cents: number;
  total_payouts_cents: number;
  total_fines_cents: number;
  balance_cents: number;
  generated_at: string;
  pdf_url?: string;
  mpesa_transaction_ids: string[];
}

// Mpesa webhook payload
export interface MpesaWebhookPayload {
  TransactionType: string;
  TransID: string;
  TransTime: string;
  TransAmount: number;
  BusinessShortCode: string;
  BillRefNumber: string;
  InvoiceNumber: string;
  OrgAccountBalance: string;
  ThirdPartyTransID: string;
  MSISDN: string; // sender phone
  FirstName: string;
  MiddleName: string;
  LastName: string;
}

// Voice parsing result
export interface VoiceParseResult {
  memberName: string;
  amount: number | null;
  date: Date | null;
  confidence: number; // 0-1
  raw_text: string;
}
