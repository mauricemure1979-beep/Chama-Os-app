import { NextRequest, NextResponse } from 'next/server';

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL;

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, amount, accountReference, transactionDesc }: STKPushRequest = await request.json();

    if (!phoneNumber || !amount || !accountReference) {
      return NextResponse.json(
        { error: 'Phone number, amount, and account reference are required' },
        { status: 400 }
      );
    }

    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE) {
      console.log('STK Push would be initiated:', { phoneNumber, amount, accountReference });
      return NextResponse.json({
        success: true,
        message: 'STK push initiated (demo mode)',
        checkoutRequestId: 'demo_' + Date.now(),
        recipient: formatPhoneNumber(phoneNumber),
        amount
      });
    }

    const accessToken = await getAccessToken();
    
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14);
    const password = Buffer.from(`${MPESA_SHORTCODE}${process.env.MPESA_PASSKEY || 'bfb279f9aa9b250cf06cf1ed252c02af'}${timestamp}`).toString('base64');

    const response = await fetch('https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        BusinessShortCode: MPESA_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerBuyGoodsOnline',
        Amount: Math.ceil(amount),
        PartyA: formatPhoneNumber(phoneNumber),
        PartyB: MPESA_SHORTCODE,
        PhoneNumber: formatPhoneNumber(phoneNumber),
        CallBackURL: MPESA_CALLBACK_URL || `${request.nextUrl.origin}/api/mpesa/callback`,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || 'Chama OS Contribution'
      })
    });

    const data = await response.json();

    if (data.ResponseCode !== '0') {
      throw new Error(data.ResponseDescription || 'STK push failed');
    }

    return NextResponse.json({
      success: true,
      message: 'STK push sent successfully',
      checkoutRequestId: data.CheckoutRequestID,
      merchantRequestId: data.MerchantRequestID
    });
  } catch (error) {
    console.error('STK push error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate STK push' },
      { status: 500 }
    );
  }
}

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

  const response = await fetch('https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
    method: 'GET',
    headers: {
      'Authorization': `Basic ${credentials}`
    }
  });

  const data = await response.json();
  return data.access_token;
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  if (cleaned.startsWith('7') && cleaned.length === 9) {
    return '254' + cleaned;
  }
  
  return cleaned;
}