# Product Context: Chama OS

## Why This Exists

Kenyan chamas traditionally manage funds using notebooks, WhatsApp messages, and SMS. This creates inefficiency, errors, lack of transparency, and no audit trail. Chama OS provides a trusted digital ledger that works offline and mimics the familiar notebook feel with M-Pesa integration.

## User Flows

### Onboarding Flow
```
Open App → Create Chama → Set rules (amount, cycle, fines) → Add Members → Done
```
Duration: ~2 minutes

### Record Contribution (Voice)
```
Tap Add → Press Mic → Say "Wanjiku ameweka 2000 leo" → Review → Confirm → M-Pesa prompt
```
Duration: ~15 seconds

### Record Contribution (Manual)
```
Tap Add → Select member → Enter amount → Record → M-Pesa prompt
```
Duration: ~30 seconds

### View Statement
```
Tap Statements → Select month → View → Download PDF OR Share to WhatsApp
```
Duration: ~10 seconds

### Payout Rotation
```
Cycle due → Identify recipient → Double approval → Initiate payout → Auto-M-Pesa
```
Duration: ~1 minute

## UX Goals

### Design Principles

1. **One primary action per screen**
   - No hamburger menus
   - Clear single call-to-action

2. **Big, tappable buttons**
   - Minimum 44×44px touch targets
   - High contrast colors

3. **Color semantics**
   - Green = paid/arrived/complete
   - Red = arrears/overdue/failed
   - Amber = pending/attention

4. **Swahili first, English secondary**
   - All copy in simple Swahili
   - English in smaller grey text

5. **Data economy**
   - <2MB per month per user
   - Image compression, lazy loading

### Screens

#### Home Dashboard
- Current balance (large)
- Next payout date & recipient
- Add Contribution button (prominent)
- Members quick access
- Cycle progress bar
- Recent activity (last 5)

#### Add Contribution
- Microphone button (primary)
- Manual fields fallback
- Parsed preview (green confirmation)
- Amount quick-select (1k, 2k, 5k, 10k)
- M-Pesa status

#### Members List
- Search bar
- Filter (All/Active/Pending)
- Member card: avatar, name, masked phone, total, role, status
- Actions: Send Reminder, View History
- Floating add button

#### Statements
- Horizontal month selector
- Monthly PDF preview with totals
- Download PDF button
- WhatsApp share button
- M-Pesa transaction IDs visible

#### Settings
- Chama settings (type, amount, cycle, fines, withdrawal limit)
- App settings (language, notifications, data saver, biometric lock, auto-sync)
- Help & Support
- Sign Out

### Error States

- **Network down**: Offline indicator, actions queued
- **Payment unmatched**: Manual review screen
- **Voice unclear**: Show suggestions, confirm manually
- **Low balance**: Warning banner
