# Technical Context: Chama OS

## Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.x (App Router) | React framework with Server Components |
| React | 19.x | UI library |
| TypeScript | 5.9.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling |
| Bun | Latest | Package manager & runtime |
| Supabase | Latest | PostgreSQL DB, Auth, Storage |
| @supabase/supabase-js | ^2.x | Database client |
| M-Pesa Daraja API | - | STK push & C2B webhooks |
| Africa's Talking API | - | SMS & USSD |
| react-pdf | Latest | PDF statement generation |

## Development Environment

### Prerequisites

- Bun installed
- Node.js 20+ (optional, Bun preferred)

### Commands

```bash
bun install          # Install dependencies
bun dev              # Start dev server (http://localhost:3000)
bun build            # Production build
bun start            # Start production server
bun lint             # Run ESLint
bun typecheck        # Run TypeScript type checking
bun add <package>    # Add dependency
```

## Project Configuration

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit"
  }
}
```

### TypeScript Config

- Strict mode enabled
- Path alias: `@/*` → `src/*`
- Target: ESNext
- Module: ESNext

### Tailwind CSS

- Tailwind CSS 4 with PostCSS
- Custom colors defined in `tailwind.config.ts`
- Custom brand: `green-600` (primary), `amber-500` (warnings)

### ESLint

- `eslint-config-next` for Next.js best practices
- Flat config format

## Key Dependencies

### Production

```json
{
  "next": "^16.1.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "@supabase/supabase-js": "^2.x",
  "@react-pdf/renderer": "^3.x"
}
```

### Dev

```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@types/react-dom": "^19.2.3",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## File Structure

```
/
├── .kilocode/          # AI context rules & recipes
├── .env.example        # Environment template
├── package.json
├── bun.lock
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── README.md
├── schema.sql          # Database schema
└── src/
    ├── app/
    │   ├── api/
    │   │   ├── mpesa/
    │   │   │   ├── stk-push/route.ts
    │   │   │   └── webhook/route.ts
    │   │   ├── contributions/route.ts
    │   │   ├── statements/
    │   │   └── ussd/
    │   ├── add-contribution/page.tsx
    │   ├── members/page.tsx
    │   ├── statements/page.tsx
    │   ├── settings/page.tsx
    │   ├── layout.tsx
    │   ├── page.tsx
    │   └── globals.css
    ├── lib/
    │   ├── db.ts
    │   ├── voice-parser.ts
    │   ├── mpesa.ts
    │   └── offline.ts
    ├── types/
    │   └── database.ts
    └── components/ (to be added)
```

## Technical Decisions

### Why Next.js App Router?

- Server Components reduce client JS bundle
- API routes co-located with UI
- Built-in optimizations (image, font)
- Vercel deployment seamless

### Why Supabase?

- PostgreSQL with realtime subscriptions
- Built-in auth & row-level security
- Free tier sufficient for MVP
- Easy to self-host if needed later

### Why Tailwind CSS 4?

- Latest with CSS-first config
- Great mobile utilities
- Small final bundle with purge

### Why Bun?

- Faster installs (10x npm)
- Built-in bundler (faster builds)
- TypeScript-native

## Performance Budgets

- **Initial JS**: <150KB gzipped
- **Images**: WebP format, lazy-loaded
- **API calls**: Batch where possible
- **Database queries**: Indexed, paginated (limit 50)

## Browser Support

- Chrome 90+ (Android)
- Samsung Internet 13+
- No Safari iOS yet (future)

## Security Measures

- RLS policies on all tables
- API rate limiting (100/min per IP)
- Input sanitization
- HTTPS enforced in production
- CSRF tokens for forms
- No sensitive data in localStorage

## Deployment Targets

1. **Vercel** (recommended) - one-click deploy
2. **Netlify** - good alternative
3. **Railway/Render** - self-hosted option
4. **On-premise** - Docker image for enterprise customers (future)

## Monitoring

- Error tracking: Sentry (optional)
- Analytics: Plausible (privacy-first)
- Uptime: UptimeRobot
- Database: Supabase dashboard

## Data Schema Details

### Users Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | User ID |
| phone_number | VARCHAR(15) UNIQUE | E.164 format, login ID |
| full_name | VARCHAR(100) | Legal name |
| pin_hash | VARCHAR(256) | Encrypted 4-digit PIN |
| biometric_enabled | BOOLEAN | Use fingerprint/face |
| role | VARCHAR(20) | treasurer/chair/secretary/member |
| preferred_language | VARCHAR(10) | sw (Swahili) or en |

### Chamas Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Chama ID |
| name | VARCHAR(100) | Display name |
| type | VARCHAR(20) | merry-go-round/equal-shares/investment |
| treasurer_id | UUID (FK) | Owner |
| contribution_amount_cents | INTEGER | Standard amount |
| cycle_day | INTEGER | 1-31, day of month |
| fine_rate_cents | INTEGER | Late fee % (500 = 5%) |
| fine_grace_days | INTEGER | Days before fine applies |

### Contributions Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Contribution ID |
| chama_id | UUID (FK) | Which chama |
| member_id | UUID (FK) | Who paid |
| amount_cents | INTEGER | Amount paid |
| mpesa_transaction_id | VARCHAR(50) UNIQUE | Matched from webhook |
| status | VARCHAR(20) | paid/partial/late/pending |
| is_verified | BOOLEAN | Confirmed by M-Pesa |

### Indexes

```sql
CREATE INDEX idx_contributions_chama_date ON contributions(chama_id, contribution_date DESC);
CREATE INDEX idx_mpesa_transaction ON contributions(mpesa_transaction_id);
CREATE INDEX idx_users_name_trgm ON users USING gin(full_name gin_trgm_ops);
```

## Environment Variables

See `.env.example` for full list. Critical ones:

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Admin key (server-only)
- `MPESA_CONSUMER_KEY` - Safaricom API key
- `MPESA_CONSUMER_SECRET` - Safaricom secret
- `MPESA_PASSKEY` - For STK push signature
- `MPESA_SHORTCODE` - Paybill/till number
- `MPESA_CALLBACK_URL` - Webhook URL
- `AT_USERNAME` / `AT_API_KEY` - Africa's Talking credentials

## Open Source Alternatives

If Supabase cost becomes issue:
- Database: PostgreSQL on Railway/Render ($5/mo)
- Storage: Backblaze B2 ($0.005/GB)
- SMS: Twilio or local Kenyan gateway

## License

MIT License - commercial use allowed
