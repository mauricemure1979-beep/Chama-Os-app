import { NextRequest, NextResponse } from 'next/server';
import type { MpesaWebhookPayload } from '@/types/database';

// M-Pesa Daraja webhook verification token
const MPESA_VERIFICATION_TOKEN = process.env.MPESA_VERIFICATION_TOKEN;

/**
 * M-Pesa Daraja C2B Webhook Handler
 * Receives payment confirmation from Safaricom
 * POST /api/mpesa/webhook
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const payload = body as MpesaWebhookPayload;

    // 1. Verify webhook signature (if using signed requests)
    const signature = req.headers.get('X-Mpesa-Signature');
    if (!verifySignature(signature, body)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // 2. Extract key data
    const {
      TransID,
      TransAmount,
      MSISDN,
      BillRefNumber,
      TransTime
    } = payload;

    // BillRefNumber format: "CHAMA|MEMBER_ID" or custom format
    const [chamaCode, memberIdentifier] = parseBillRef(BillRefNumber);

    if (!chamaCode) {
      console.error('Invalid BillRefNumber:', BillRefNumber);
      return NextResponse.json(
        { error: 'Invalid reference' },
        { status: 400 }
      );
    }

    // 3. Find the matching chama and member
    const chama = await getChamaByCode(chamaCode);
    if (!chama) {
      return NextResponse.json(
        { error: 'Chama not found' },
        { status: 404 }
      );
    }

    // Find member by phone number (normalize to E.164)
    const normalizedPhone = normalizePhone(MSISDN);
    const member = await getMemberByPhone(chama.id, normalizedPhone);

    if (!member) {
      // Payment from non-member - optionally reject or flag for manual review
      await logUnmatchedPayment({
        transactionId: TransID,
        phone: MSISDN,
        amount: TransAmount,
        chamaId: chama.id,
        raw: body
      });
      return NextResponse.json(
        { error: 'Member not found in this chama' },
        { status: 404 }
      );
    }

    // 4. Match to pending contribution
    // Find matching pending contribution for this member on this date
    const transactionDate = parseMpesaDate(TransTime);
    const matchingContribution = await findMatchingContribution(
      chama.id,
      member.id,
      TransAmount,
      transactionDate
    );

    if (matchingContribution) {
      // 5. Update contribution as verified
      await updateContributionVerified(matchingContribution.id, {
        is_verified: true,
        verified_at: new Date().toISOString(),
        mpesa_transaction_id: TransID,
        status: 'paid',
        paid_amount_cents: TransAmount * 100
      });

      // 6. Check for fines that should now be cleared
      await reconcileFines(chama.id, member.id);

      // 7. Check for overdue status (apply fine if past grace period)
      await applyLateFinesIfNeeded(chama.id, member.id);

      // 8. Trigger next steps
      // - Queue SMS confirmation to member
      await queueMessage({
        chama_id: chama.id,
        member_id: member.id,
        message_type: 'confirmation',
        message_body: `Asante! Umeweka KES ${TransAmount}. Reference: ${TransID}`,
        channel: 'sms',
        scheduled_for: new Date()
      });

      // - If merry-go-round and this completes cycle, schedule payout
      if (chama.type === 'merry-go-round' && isCycleComplete(chama.id)) {
        await scheduleNextPayout(chama.id);
      }

      return NextResponse.json(
        { status: 'success', contributionId: matchingContribution.id },
        { status: 200 }
      );
    } else {
      // No matching contribution - this might be an unscheduled payment
      // Create a new contribution record or flag for manual reconciliation
      await createOrFlagPayment({
        chamaId: chama.id,
        memberId: member.id,
        amount: TransAmount * 100,
        transactionId: TransID,
        date: transactionDate,
        rawPayload: body
      });

      return NextResponse.json(
        { status: 'received', message: 'Payment recorded, pending manual match' },
        { status: 202 }
      );
    }
  } catch (error) {
    console.error('M-Pesa webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * Verify webhook signature (Safaricom signs requests)
 */
function verifySignature(signature: string | null, body: unknown): boolean {
  if (!signature) return false;

  const secret = MPESA_VERIFICATION_TOKEN;
  if (!secret) return true; // Skip in dev mode

  const hmac = require('crypto').createHmac('sha256', secret);
  const digest = hmac.update(JSON.stringify(body)).digest('base64');

  return signature === digest;
}

/**
 * Parse BillRefNumber (format: CHAMA_CODE|MEMBER_ID)
 */
function parseBillRef(billRef: string): [string | null, string | null] {
  if (!billRef) return [null, null];
  const parts = billRef.split('|');
  return [parts[0] || null, parts[1] || null];
}

/**
 * Normalize phone number to E.164 (+2547...)
 */
function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');

  if (cleaned.startsWith('254')) return `+${cleaned}`;
  if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
    return '+254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '+254' + cleaned;
  }

  return `+${cleaned}`;
}

/**
 * Parse M-Pesa date format: "YYYYMMDDHHmmss"
 */
function parseMpesaDate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4), 10);
  const month = parseInt(dateStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateStr.substring(6, 8), 10);
  const hour = parseInt(dateStr.substring(8, 10), 10);
  const minute = parseInt(dateStr.substring(10, 12), 10);
  const second = parseInt(dateStr.substring(12, 14), 10);

  return new Date(year, month, day, hour, minute, second);
}

// Database helper stubs - replace with actual DB calls
interface Chama { id: string; type: string; }
interface Member { id: string; }

async function getChamaByCode(code: string): Promise<Chama | null> {
  return { id: 'chama-uuid', type: 'merry-go-round' };
}

async function getMemberByPhone(chamaId: string, phone: string): Promise<Member | null> {
  return { id: 'member-uuid' };
}

async function findMatchingContribution(
  chamaId: string,
  memberId: string,
  amountKES: number,
  date: Date
): Promise<{ id: string } | null> {
  return null;
}

async function updateContributionVerified(id: string, updates: Record<string, unknown>): Promise<void> {}

async function applyLateFinesIfNeeded(chamaId: string, memberId: string): Promise<void> {}

async function reconcileFines(chamaId: string, memberId: string): Promise<void> {}

function isCycleComplete(chamaId: string): boolean {
  return false;
}

async function scheduleNextPayout(chamaId: string): Promise<void> {}

async function queueMessage(params: { chama_id: string; member_id: string; message_type: string; message_body: string; channel: string; scheduled_for: Date }): Promise<void> {}

async function logUnmatchedPayment(params: { transactionId: string; phone: string; amount: number; chamaId: string; raw: unknown }): Promise<void> {}

async function createOrFlagPayment(params: { chamaId: string; memberId: string; amount: number; transactionId: string; date: Date; rawPayload: unknown }): Promise<void> {}
