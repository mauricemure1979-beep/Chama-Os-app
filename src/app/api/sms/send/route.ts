import { NextRequest, NextResponse } from 'next/server';

const AFRICASTALKING_API_KEY = process.env.AFRICASTALKING_API_KEY;
const AFRICASTALKING_USERNAME = process.env.AFRICASTALKING_USERNAME || 'sandbox';

interface SendSMSRequest {
  phoneNumber: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message }: SendSMSRequest = await request.json();

    if (!phoneNumber || !message) {
      return NextResponse.json(
        { error: 'Phone number and message are required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    if (!AFRICASTALKING_API_KEY) {
      console.log('SMS would be sent:', { to: formattedPhone, message });
      return NextResponse.json({
        success: true,
        message: 'SMS queued (demo mode)',
        recipient: formattedPhone
      });
    }

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

    if (data.ACK !== 'Success' && !data.SMSMessageData?.Recipients) {
      throw new Error(data.SMSMessageData?.Message || 'Failed to send SMS');
    }

    return NextResponse.json({
      success: true,
      message: 'SMS sent successfully',
      recipient: formattedPhone,
      data
    });
  } catch (error) {
    console.error('SMS send error:', error);
    return NextResponse.json(
      { error: 'Failed to send SMS' },
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