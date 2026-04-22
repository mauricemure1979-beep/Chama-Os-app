import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';

interface BulkSMSRequest {
  message: string;
  memberIds?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { message, memberIds }: BulkSMSRequest = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const members = db.getMembers();
    const targetMembers = memberIds 
      ? members.filter((m: { id: string }) => memberIds.includes(m.id))
      : members;

    if (!AFRICASTALKING_API_KEY) {
      console.log('Bulk SMS would be sent to:', targetMembers.map((m: { phone: string }) => m.phone));
      return NextResponse.json({
        success: true,
        message: `SMS would be sent to ${targetMembers.length} members (demo mode)`,
        recipientCount: targetMembers.length
      });
    }

    const results = [];
    for (const member of targetMembers) {
      try {
        const formattedPhone = formatPhoneNumber(member.phone);
        const response = await fetch(`https://api.africastalking.com/version1/messaging`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'ApiKey': AFRICASTALKING_API_KEY
          },
          body: new URLSearchParams({
            username: AFRICASTALKING_USERNAME,
            to: formattedPhone,
            message: message
          }).toString()
        });

        const data = await response.json();
        results.push({ memberId: member.id, success: true, data });
      } catch (error) {
        results.push({ memberId: member.id, success: false, error: String(error) });
      }
    }

    const successful = results.filter((r: { success: boolean }) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `SMS sent to ${successful} of ${targetMembers.length} members`,
      results
    });
  } catch (error) {
    console.error('Bulk SMS error:', error);
    return NextResponse.json(
      { error: 'Failed to send bulk SMS' },
      { status: 500 }
    );
  }
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0')) {
    return `+254${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return `+254${cleaned}`;
  }
  
  return `+${cleaned}`;
}