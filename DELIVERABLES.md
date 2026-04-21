# Chama OS - Project Deliverables Summary

## Overview

Chama OS is a mobile-first digital ledger for Kenyan chamas (merry-go-rounds, investment groups). This deliverable includes complete architecture, database schema, 5 core UI screens, M-Pesa integration, and Swahili voice parsing.

---

## 1. Database Schema

**File**: `schema.sql` (root)

### Tables (10 tables)

| Table | Purpose |
|-------|---------|
| `users` | Treasurers and members with roles, PIN, language preference |
| `chamas` | Group settings (type, contribution amount, cycle, fine rules) |
| `chama_members` | Many-to-many membership with join date, status, payouts |
| `contributions` | Core ledger with M-Pesa transaction matching |
| `payouts` | Withdrawal records with double-approval support |
| `fines` | Late fees and other penalties |
| `audit_log` | Full audit trail of all mutations (readable by all members) |
| `message_queue` | SMS/WhatsApp reminders scheduling |
| `statements` | PDF statement metadata with M-Pesa transaction IDs |
| `device_sync` | Offline sync tracking per device |

### Key Features

- **Monetary values as cents** (integers) - no float errors
- **Row Level Security (RLS)** ready - per-chama isolation
- **Full-text search** with pg_trgm for voice-parsed name matching
- **Indexes** on foreign keys, dates, and M-Pesa transaction IDs
- **Foreign key constraints** with cascading deletes where appropriate

---

## 2. Five Key Screens

All screens use mobile-first design: big buttons, clear colors (green/red/amber), Swahili-first text.

### Screen 1: Home Dashboard

**File**: `src/app/page.tsx`

Features:
- Chama name & type display (green header)
- Current balance (large)
- Next payout date & recipient
- Quick-action grid: "Add Contribution" (primary), "Members" (secondary)
- This cycle progress bar
- Recent activity feed (last 5 with status icons)
- Bottom tab navigation

Colors: Green paid, red arrears

### Screen 2: Add Contribution

**File**: `src/app/add-contribution/page.tsx`

Features:
- Primary voice button (mic icon) - triggers Web Speech API
- Secondary manual input fields
- Real-time voice parsing preview with confidence indicator
- Member name autocomplete with fuzzy matching (for voice errors)
- Amount quick-select buttons (1k, 2k, 5k, 10k)
- Date picker (defaults to today)
- Green submit button: "Record & Send M-Pesa Prompt"
- Info banner: 24-hour payment deadline

Integration: Calls `/api/mpesa/stk-push` on submit to trigger SMS prompt

### Screen 3: Members

**File**: `src/app/members/page.tsx`

Features:
- Search bar (top)
- Filter tabs: All | Active | Pending
- Member cards with:
  - Avatar (first letter)
  - Name & masked phone (# 7****89)
  - Total contributed amount
  - Role (chair/secretary/member) with shield icon
  - Status badge (green check or amber alert)
- Action buttons: "Send Reminder", "View History"
- Floating "+" FAB to add member

### Screen 4: Statements

**File**: `src/app/statements/page.tsx`

Features:
- Horizontal month selector (scrollable)
- Two modes:
  - **List view** (no month selected): Cards for each month with balance
  - **Detail view** (month selected): Full breakdown
- PDF preview with color-coded rows:
  - Contributions (green)
  - Payouts (red)
  - Fines (amber)
  - Net balance (green footer)
- M-Pesa Transaction IDs section (small text)
- Two large action buttons: "Download PDF" (green) and "Share to WhatsApp" (WhatsApp green)
- WhatsApp share pre-fills statement text

### Screen 5: Settings

**File**: `src/app/settings/page.tsx`

Features:
- **Chama Settings** section: type, amount, cycle day, fine rate, max withdrawal (all readonly for now, edit future)
- **App Settings** section with toggles:
  - Reminders (SMS/WhatsApp)
  - Data Saver Mode (compress to <2MB/month)
  - Biometric Lock / PIN Lock
  - Auto-Sync
- **Other**: Language switcher (Kiswahili/English), Help & Support, Sign Out
- Version footer

Toggles: Pill-shaped green/black switch

---

## 3. M-Pesa Webhook Handler

**File**: `src/app/api/mpesa/webhook/route.ts`

### Endpoint
`POST /api/mpesa/webhook`

### Flow

1. **Verify signature** using `MPESA_VERIFICATION_TOKEN`
2. **Parse payload**:
   - `TransID`, `TransAmount`, `MSISDN` (sender phone), `BillRefNumber`, `TransTime`
3. **Parse BillRefNumber**: Format = `CHAMA_CODE|MEMBER_ID`
4. **Find chama & member** by IDs, normalize phone to E.164 format
5. **Match contribution**:
   - Look for unpaid contribution for member within ±3 days, same amount
6. **If matched**:
   - Update contribution: `is_verified = true`, `status = 'paid'`, `mpesa_transaction_id = TransID`
   - Reconcile fines
   - Apply late fines if past grace period
   - Queue confirmation SMS via `message_queue`
   - If merry-go-round cycle complete, schedule next payout
   - Return 200 with contribution ID
7. **If not matched**:
   - Create as manual/unmatched payment
   - Flag for treasurer review
   - Return 202 (accepted, pending match)

### Error Handling

- Invalid signature → 401
- Chama/member not found → 404
- Processing error → 500 (logged)

### Database Stubs

Functions at bottom show where to hook in actual DB:
- `getChamaByCode()`, `getMemberByPhone()`, `findMatchingContribution()`, `updateContributionVerified()`, etc.

---

## 4. Swahili Voice Parsing Rules

**File**: `src/lib/voice-parser.ts`

### Entry Function

```typescript
parseVoiceInput(text: string): VoiceParseResult
```

Returns:
- `memberName` (string)
- `amount` (number | null)
- `date` (Date | null)
- `confidence` (0-1 score)
- `raw_text`

### Supported Input Formats

| Example | Parsed |
|---------|--------|
| "Wanjiku ameweka 2000 leo" | name=Wanjiku, amount=2000, date=today |
| "Kamau alikopa 500 jana" | name=Kamau, amount=500, date=yesterday |
| "2k kwa Maria" | name=Maria, amount=2000 |
| "Achieng alihamsika elfu kumi" | name=Achieng, amount=10000 |
| "Tarehe 5: Mary alituma 2000" | name=Mary, amount=2000, date=5th of current month |

### Number Parsing

**Numeric**: `2000`, `2000/=`
**Sheng abbreviations**: `2k`→2000, `5k`→5000, `10k`→10000, `1m`→1000000, `100b`→100
**Swahili words**: `moja`=1, `mbili`=2, `tano`=5, `kumi`=10, `elfu`=1000, `miliyoni`=1000000

### Date Parsing

- `leo` → today
- `jana` → yesterday
- `kesho` → tomorrow
- `wiki iliyopita` → 7 days ago
- `tarehe 12` → day 12 of current month
- `12/04` → April 12, current year

### Name Extraction Logic

1. Position: Usually between verb/marker and amount/date
2. Fuzzy match against member list via `getFuzzyNameSuggestions()`
3. Confidence increased if exact match found
4. Shows dropdown suggestions when confidence <70%

### Validation

```typescript
validateParseResult(result): { isValid: boolean; errors: string[] }
```

Checks:
- Name present and ≥2 chars
- Amount present and between KES 50 - 1,000,000
- Returns Swahili error messages

### Global Exposure

Parser functions are attached to `window` for client-side use:
```typescript
window.parseVoiceInput = parseVoiceInput;
window.getFuzzyNameSuggestions = getFuzzyNameSuggestions;
```

---

## Supporting Files

### Type Definitions

**File**: `src/types/database.ts`

All TypeScript interfaces:
- `User`, `UserRole`, `Chama`, `ChamaType`, `ChamaMember`
- `Contribution`, `ContributionStatus`
- `Payout`, `PayoutStatus`
- `Fine`, `AuditLog`, `Statement`, `DashboardSummary`
- `MpesaWebhookPayload`, `VoiceParseResult`

### Database Client

**File**: `src/lib/db.ts`

- Supabase client setup
- `SQLiteStorage` class (offline-first wrapper using localStorage/IndexedDB)
- Typed query functions (`getChamas()`, `getContributions()`, etc.)

### PWA Manifest

**File**: `public/manifest.json`

- App name: "Chama OS"
- Theme color: green (#16a34a)
- Standalone display for mobile
- Icons: 192×192, 512×512
- Categories: finance, business

### Tailwind Config

**File**: `tailwind.config.ts`
- Custom green/amber colors
- Inter font

### Environment Template

**File**: `.env.example`
All M-Pesa, Supabase, Africa's Talking variables.

---

## Quick Start for Developer

1. **Clone & install**
   ```bash
   bun install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env.local
   # Fill in Supabase + M-Pesa credentials
   ```

3. **Run database schema**
   ```sql
   -- In Supabase SQL editor
   \i schema.sql
   ```

4. **Start dev server**
   ```bash
   bun dev
   ```

5. **Open app**
   http://localhost:3000

---

## Dependencies to Install

```bash
bun add @supabase/supabase-js @react-pdf/renderer lucide-react
# Note: lucide-react can be removed if keeping inline SVG icons
```

---

## Architecture Highlights

### Offline-First

- All writes go to IndexedDB first
- Queue pending changes
- Background sync when online
- Realtime subscriptions for live updates

### Voice Input

- Primary: Web Speech API (native browser)
- Fallback: Manual typing with voice parser
- Parser handles Sheng abbreviations and Swahili number words

### M-Pesa Integration

- STK Push via `/api/mpesa/stk-push`
- Webhook verification and matching
- Idempotent handling via transaction ID deduplication

### Monetization Ready

- Billing logic hooks in `Statements` screen (KES 50/member >10)
- Could add Stripe for card payments as alternative

### Security

- End-to-end encryption at rest (Supabase)
- Row-level security per chama
- PIN + biometric lock support
- Audit log visible to all members

---

## That's All Deliverables

✅ Database schema (`schema.sql`)
✅ 5 Key screens (`src/app/` pages)
✅ M-Pesa webhook handler (`src/app/api/mpesa/webhook/route.ts`)
✅ Swahili voice parsing rules (`src/lib/voice-parser.ts`)
✅ Supporting types, configs, memory bank, README

Next steps: install dependencies, run app, connect database.
