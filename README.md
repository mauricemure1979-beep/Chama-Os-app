# Chama OS - Digital Ledger for Kenyan Chamas

Mobile-first web app for managing merry-go-rounds, investment groups, and chamas. Built for low-end Android phones with expensive data and spotty connectivity.

## Features

- **2-minute onboarding**: Create chama, set rules, invite members
- **Voice/text input**: Record "Wanjiku ameweka 2k leo" → auto-parse
- **M-Pesa integration**: STK push, auto-payment matching via phone number
- **Offline-first ledger**: Works without internet, syncs when connected
- **Automatic fines & rotation**: Late fees, cycle rotation, SMS reminders
- **One-tap PDF statements**: With chama stamp and M-Pesa verification
- **Roles & audit log**: Treasurer, chair, secretary with double-approval for withdrawals
- **USSD fallback**: *384*code# for feature phones

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL) or Firebase
- **Payments**: M-Pesa Daraja API (STK push, C2B webhooks)
- **SMS**: Africa's Talking API
- **Offline**: SQLite (browser IndexedDB + SQL.js), sync queue
- **Voice**: Web Speech API (fallback to typing)
- **PWA**: Service worker for offline-first

## Getting Started

### Prerequisites

- Node.js 18+
- Bun package manager (recommended) or npm
- Supabase account (free tier)

### Install Dependencies

```bash
bun install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# M-Pesa Daraja
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_PASSKEY=your-passkey
MPESA_SHORTCODE=your-shortcode
MPESA_CALLBACK_URL=https://yourdomain.com/api/mpesa/webhook
MPESA_VERIFICATION_TOKEN=random-secret-for-webhook-validation

# Africa's Talking (SMS)
AT_USERNAME=your-username
AT_API_KEY=your-api-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Run Development Server

```bash
bun dev
```

Open http://localhost:3000

### Build & Deploy

```bash
bun build
bun start
```

Deploy to Vercel (recommended) with one click.

## Database Schema

See `schema.sql` for full schema. Key tables:

- `users` - Treasurers and members
- `chamas` - Group settings
- `chama_members` - Many-to-many membership
- `contributions` - Ledger of all payments
- `payouts` - Withdrawal records
- `fines` - Late fees
- `audit_log` - Full transparency
- `message_queue` - SMS/WhatsApp reminders
- `statements` - PDF metadata

## Voice Input Format

Speak in **Sheng** or **Swahili**:

| Input | Parsed |
|-------|--------|
| "Wanjiku ameweka 2000 leo" | member=Wanjiku, amount=2000, date=today |
| "Kamau alikopa 500 jana" | member=Kamau, amount=500, date=yesterday |
| "2k kwa Maria" | member=Maria, amount=2000, date=today |
| "Achieng alihamsika 10000" | member=Achieng, amount=10000, date=today |

Supported number words: `moja, mbili, tatu, nne, tano, sita, saba, nane, tisa, kumi, elfu, milioni`
Abbreviations: `2k, 5k, 10k, 1m`

## M-Pesa Integration

### STK Push Flow

1. User records contribution in app
2. App calls `/api/mpesa/stk-push` with amount, phone, reference
3. M-Pesa sends payment prompt to user's phone
4. User confirms via PIN
5. M-Pesa sends webhook to `/api/mpesa/webhook`
6. App matches `BillRefNumber` to chama & member
7. Contribution marked `verified`, audit log updated

### Webhook Payload

```json
{
  "TransactionType": "PAYBILL",
  "TransID": "LG1234567",
  "TransAmount": 2000,
  "MSISDN": "254712345678",
  "BillRefNumber": "CHAMA_CODE|MEMBER_ID",
  "TransTime": "20250421120000"
}
```

## Offline-First Architecture

```typescript
// 1. Write to IndexedDB immediately
await offlineDb.storeContribution(contribution);

// 2. Queue for sync
await offlineDb.queueSync('contributions', contribution.id);

// 3. When online, batch sync
const pending = await offlineDb.getPendingChanges();
await Promise.all(pending.map(item => 
  syncToServer(item)
));
await offlineDb.markSynced(pending.map(p => p.id));
```

## Monetization

- Free for chamas ≤ 10 members
- KES 50 per additional member/month
- Billed automatically via M-Pesa to treasurer
- No ads, no data selling

## Security

- End-to-end encryption for ledger at rest
- RLS (Row Level Security) per chama
- PIN + biometric lock support
- Audit log visible to all members
- No PII stored beyond phone number & name

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── mpesa/
│   │   │   ├── stk-push/route.ts    # Trigger STK push
│   │   │   └── webhook/route.ts      # Handle M-Pesa confirmation
│   │   ├── contributions/route.ts    # CRUD contributions
│   │   ├── statements/route.ts       # Generate PDF
│   │   └── ussd/route.ts             # USSD handler
│   ├── add-contribution/page.tsx     # Screen 2
│   ├── members/page.tsx              # Screen 3
│   ├── statements/page.tsx           # Screen 4
│   ├── settings/page.tsx             # Screen 5
│   └── page.tsx                      # Screen 1 (Home)
├── lib/
│   ├── db.ts                         # Database client
│   ├── voice-parser.ts               # Swahili NLP
│   ├── mpesa.ts                      # Daraja API client
│   └── offline-storage.ts            # IndexedDB wrapper
├── types/
│   └── database.ts                   # TypeScript types
└── styles/
    └── globals.css                   # Tailwind + custom
```

## Contributing

This is an MVP specification. Implementation PRs welcome.

## License

MIT
