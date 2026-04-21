# Project Brief: Chama OS

## Purpose

Chama OS is a mobile-first digital ledger application for Kenyan chamas (merry-go-rounds, investment groups, savings circles). It replaces notebook record-keeping and WhatsApp/SMS threads with a trusted, offline-capable system.

## Target Users

**Primary**: Treasurer of chama (age 28-55, moderate tech comfort)
**Secondary**: Chama members who contribute cycles

Users primarily use WhatsApp and M-Pesa. Phones are low-end Android devices. Data is expensive. Connectivity is unreliable.

## Core Use Case

A treasurer needs to:
1. Onboard a new chama in 2 minutes
2. Record member contributions via voice or text
3. Process M-Pesa payments automatically
4. Track balances, arrears, and next payout
5. Apply fines for late payments
6. Rotate payouts in merry-go-round cycles
7. Generate monthly statements (PDF) with M-Pesa transaction verification
8. Manage member roles and approvals

A member needs to:
1. See their contribution history
2. Know when their turn for payout is
3. Receive SMS reminders before due dates
4. View statements

## Key Requirements

### Functional

- **Onboarding**: Create chama, select type, set contribution amount, cycle day, fine rules
- **Voice & Text Input**: Natural language in Sheng/Swahili → parse into ledger entry
- **M-Pesa Integration**: STK push for payments, auto-match incoming transactions by phone number
- **Offline-First Ledger**: Local SQLite storage, sync when online
- **Automatic Fines & Rotation**: Late fees after grace period, automatic payouts for merry-go-round
- **Statements**: One-tap PDF generation with chama stamp, signature line, M-Pesa transaction IDs. Share to WhatsApp.
- **Roles & Audit**: Treasurer, chair, secretary, member. Double-approval for withdrawals over limit. Full audit log visible to all.
- **USSD Fallback**: *384*code# to check balance or confirm payment for feature phones

### Non-Functional

- **Performance**: Data usage under 2MB per month per user
- **Reliability**: Works offline, handles network drops gracefully
- **Accessibility**: Simple Swahili first, English secondary. Big buttons, clear icons
- **Security**: End-to-end encryption at rest, PIN + biometric lock, no member data selling

## Constraints

- Mobile-first (Android low-end phones)
- Expensive data → minimize usage
- Spotty connectivity → offline-first
- Language: Swahili mixed with English (Sheng)
- Monetization: Free ≤10 members, KES 50/member/month above 10 (billed via M-Pesa to treasurer)
- No ads

## Success Metrics

- Onboarding completed in ≤2 minutes
- Voice parsing accuracy ≥90% for common Sheng phrases
- M-Pesa payment matching ≥95% auto-match rate
- Monthly active users ≥80% of chama members
- Statement generation <5 seconds
