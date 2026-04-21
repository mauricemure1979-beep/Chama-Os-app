# System Patterns: Chama OS

## Architecture Overview

```
Mobile PWA → Next.js (App Router) → Supabase → M-Pesa/Africa's Talking
    ↓
Offline-first (IndexedDB) → Background sync → Audit log
```

## Key Design Patterns

### 1. Offline-First Database

- Writes go to IndexedDB immediately
- Changes queued for background sync
- Sync when online, retry on failure
- Conflict resolution: last-write-wins with timestamp

### 2. Server Components by Default

All pages start as Server Components (data fetching). Switch to `"use client"` only when:

- Using `useState`/`useEffect`
- Voice recording (Web Speech API)
- IndexedDB access
- Interactive form state

### 3. One Primary Action Per Screen

Each screen has exactly one main call-to-action:
- Home → "Add Contribution"
- Add → "Record & Send M-Pesa Prompt"
- Members → "Add Member" (FAB)
- Statements → "Download/Share" (after selecting month)
- Settings → Toggle switches

### 4. Color-Coded Status

```
Green (#16a34a):  paid, verified, complete
Red (#dc2626):    arrears, late, failed
Amber (#f59e0b):  pending, attention, processing
Gray (#6b7280):   neutral, inactive
```

### 5. Row Level Security (RLS)

All Supabase tables enforce RLS:
```sql
-- Users only see their chama data
CREATE POLICY chama_member_select ON chamas
  FOR SELECT USING (
    id IN (SELECT chama_id FROM chama_members WHERE user_id = auth.uid())
  );
```

## Voice Input Pipeline

```
Raw audio → Web Speech API / Whisper Model → Normalized text
     ↓
NLP: Tokenize → Name extraction (fuzzy match) → Amount extraction → Date extraction
     ↓
Confidence scoring → If <70%, show suggestions UI
     ↓
Populate form fields for manual review → Submit
```

## M-Pesa Integration Flow

```
1. User taps "Record Contribution"
2. Frontend → POST /api/mpesa/stk-push
   { PhoneNumber, Amount, AccountReference: "CHAMA|MEMBER" }
3. Safaricom sends STK prompt to user's phone
4. User enters PIN → Payment processed
5. Safaricom POSTS to /api/mpesa/webhook
6. Webhook:
   a. Verify signature
   b. Parse BillRefNumber → CHAMA_ID, MEMBER_ID
   c. Find pending contribution (by member, amount, ±3 days)
   d. Update → is_verified = true, status = paid
   e. Update audit_log
   f. Queue confirmation SMS
7. Frontend realtime subscription updates UI
```

## PDF Statement Generation

- **Library**: `@react-pdf/renderer` (client-side)
- **Content**:
  - Chama letterhead + stamp
  - Period (month/year)
  - Summary: contributions, payouts, fines, balance
  - Line items with M-Pesa transaction IDs
  - Treasurer signature line
- **Export**: Blob download + WhatsApp share

## Offline Sync Strategy

```typescript
// 1. Writes happen locally first
await offlineDb.storeContribution(contribution);
await offlineDb.queueSync('contributions', contribution.id);

// 2. Background worker syncs when online
if (navigator.onLine) {
  const pending = await offlineDb.getPendingChanges();
  await Promise.all(pending.map(item => syncToServer(item)));
  await offlineDb.markSynced(pending.map(p => p.id));
}

// 3. Realtime fallback
const channel = supabase.channel('updates')
  .on('postgres_changes', { event: '*', schema: 'public' }, handleChange)
  .subscribe();
```

## Authentication & Authorization

- **Method**: Supabase Auth (phone OTP or email/password)
- **Session**: HTTP-only cookies, refresh token rotation
- **Authorization**: RLS + application-level checks (double approval)

## File Structure

```
src/app/
├── page.tsx              # Home dashboard
├── layout.tsx            # Root layout
├── add-contribution/page.tsx
├── members/page.tsx
├── statements/page.tsx
├── settings/page.tsx
└── api/
    ├── mpesa/
    │   ├── stk-push/route.ts
    │   └── webhook/route.ts
    ├── contributions/route.ts
    ├── statements/route.ts
    └── ussd/route.ts

src/lib/
├── db.ts                 # Supabase client + typed queries
├── voice-parser.ts       # Swahili NLP
├── mpesa.ts              # M-Pesa API client
└── offline.ts            # IndexedDB wrapper

src/types/database.ts     # TypeScript interfaces
```

## Error Handling Strategy

- API errors: Try/catch with user-friendly messages
- Network errors: Retry queue with exponential backoff
- M-Pesa failures: Manual review UI for treasurer
- Voice parsing: Confidence threshold + suggestions

## Performance Optimizations

- Images: `next/image` with lazy loading
- Data: Limit queries, pagination (limit 50)
- Bundle: Server Components reduce client JS
- Offline: Service worker caching of static assets

## Security Patterns

- RLS enforced at database level
- PIN hashed with bcrypt/scrypt
- Biometric data never leaves device (WebAuthn local only)
- Audit log records all mutations
- No PII beyond phone + name
