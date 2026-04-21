-- Chama OS Database Schema
-- Offline-first SQLite compatible with Supabase/Firebase
-- All monetary values in KES, stored as integer (cents) to avoid float errors

-- Users table: both treasurers and members
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number VARCHAR(15) UNIQUE NOT NULL, -- +2547xx...
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    pin_hash VARCHAR(256) NOT NULL, -- encrypted PIN
    biometric_enabled BOOLEAN DEFAULT FALSE,
    role VARCHAR(20) NOT NULL DEFAULT 'member', -- 'treasurer', 'chair', 'secretary', 'member'
    preferred_language VARCHAR(10) DEFAULT 'sw', -- 'sw' (Swahili) or 'en' (English)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chamas (investment groups)
CREATE TABLE chamas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'merry-go-round', 'equal-shares', 'investment'
    description TEXT,
    treasurer_id UUID NOT NULL REFERENCES users(id),
    contribution_amount_cents INTEGER NOT NULL, -- e.g., 2000 = KES 20.00
    cycle_day INTEGER NOT NULL, -- day of month (1-31) for contributions
    cycle_type VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'weekly', 'custom'
    fine_rate_cents INTEGER DEFAULT 0, -- late fee as % of contribution (stored as integer: 500 = 5%)
    fine_grace_days INTEGER DEFAULT 3, -- days after due date before fine applies
    max_withdrawal_limit_cents INTEGER, -- requires two-person approval if set
    requires_double_approval BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members in each chama (many-to-many)
CREATE TABLE chama_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'suspended', 'left'
    total_contributions_cents INTEGER DEFAULT 0,
    last_contribution_date DATE,
    next_payout_date DATE, -- for merry-go-round
    payout_order INTEGER, -- rotation order for merry-go-round
    UNIQUE(chama_id, user_id)
);

-- Contribution ledger (core accounting)
CREATE TABLE contributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    member_id UUID NOT NULL REFERENCES chama_members(id),
    amount_cents INTEGER NOT NULL,
    payment_method VARCHAR(20), -- 'mpesa', 'cash', 'bank_transfer', 'ussd'
    mpesa_transaction_id VARCHAR(50) UNIQUE, -- matched from webhook
    raw_mpesa_message TEXT, -- original SMS/webhook payload
    contribution_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE, -- when payment was due
    status VARCHAR(20) DEFAULT 'pending', -- 'paid', 'partial', 'late', 'pending'
    paid_amount_cents INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE, -- confirmed via M-Pesa
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP
);

-- Payouts (for merry-go-round withdrawals)
CREATE TABLE payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    member_id UUID NOT NULL REFERENCES chama_members(id),
    amount_cents INTEGER NOT NULL,
    payout_date DATE NOT NULL,
    payment_method VARCHAR(20) DEFAULT 'mpesa',
    mpesa_transaction_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
    approved_by UUID REFERENCES users(id), -- first approver
    approved_by_2 UUID REFERENCES users(id), -- second approver (if required)
    approved_at TIMESTAMP,
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Fines applied automatically
CREATE TABLE fines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    member_id UUID NOT NULL REFERENCES chama_members(id),
    contribution_id UUID REFERENCES contributions(id),
    reason VARCHAR(100) NOT NULL, -- 'late_payment', 'absence', 'rule_breach'
    amount_cents INTEGER NOT NULL,
    grace_days INTEGER DEFAULT 3,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    paid_at TIMESTAMP,
    is_waived BOOLEAN DEFAULT FALSE,
    waived_by UUID REFERENCES users(id),
    waiver_reason TEXT
);

-- Audit log (read-only for all members)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL, -- 'contribution_added', 'payout_created', 'member_added', 'settings_updated'
    entity_type VARCHAR(30), -- 'contribution', 'payout', 'member', 'chama'
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS/WhatsApp message queue (for reminders)
CREATE TABLE message_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    member_id UUID NOT NULL REFERENCES chama_members(id),
    message_type VARCHAR(20) NOT NULL, -- 'reminder', 'confirmation', 'statement', 'fine_notice'
    message_body TEXT NOT NULL,
    channel VARCHAR(10) DEFAULT 'sms', -- 'sms', 'whatsapp', 'ussd'
    scheduled_for TIMESTAMP NOT NULL,
    sent_at TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Statements (PDF metadata)
CREATE TABLE statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chama_id UUID NOT NULL REFERENCES chamas(id),
    member_id UUID NOT NULL REFERENCES chama_members(id),
    month INTEGER NOT NULL, -- 1-12
    year INTEGER NOT NULL,
    total_contributions_cents INTEGER NOT NULL,
    total_payouts_cents INTEGER NOT NULL,
    total_fines_cents INTEGER NOT NULL,
    balance_cents INTEGER NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    pdf_url TEXT, -- stored in cloud storage
    mpesa_transaction_ids JSONB, -- array of M-Pesa IDs for verification
    UNIQUE(chama_id, member_id, month, year)
);

-- Device sync metadata (for offline-first)
CREATE TABLE device_sync (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_id VARCHAR(100) NOT NULL,
    last_sync_at TIMESTAMP,
    pending_changes INTEGER DEFAULT 0,
    sync_status VARCHAR(20) DEFAULT 'idle' -- 'idle', 'syncing', 'error'
);

-- Indexes for performance
CREATE INDEX idx_contributions_chama_date ON contributions(chama_id, contribution_date DESC);
CREATE INDEX idx_contributions_member ON contributions(member_id);
CREATE INDEX idx_payouts_chama_date ON payouts(chama_id, payout_date DESC);
CREATE INDEX idx_mpesa_transaction ON contributions(mpesa_transaction_id) WHERE mpesa_transaction_id IS NOT NULL;
CREATE INDEX idx_audit_chama_date ON audit_log(chama_id, created_at DESC);
CREATE INDEX idx_chama_members_chama ON chama_members(chama_id);
CREATE INDEX idx_messages_scheduled ON message_queue(scheduled_for, status);

-- Row Level Security (Supabase) - enable per-chama isolation
-- ALTER TABLE chamas ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE chama_members ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
-- ... add policies per chama_id

-- Full-text search for voice input name matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_users_name_trgm ON users USING gin (full_name gin_trgm_ops);
CREATE INDEX idx_chamas_name_trgm ON chamas USING gin (name gin_trgm_ops);
