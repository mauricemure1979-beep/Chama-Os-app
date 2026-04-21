import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, pin, name, role } = await request.json();

    if (!phoneNumber || !pin) {
      return NextResponse.json(
        { error: 'Phone number and PIN required' },
        { status: 400 }
      );
    }

    const formattedPhone = phoneNumber.replace(/^254/, '+254').replace(/^0/, '+254');
    
    const user = {
      id: crypto.randomUUID(),
      phone: formattedPhone,
      pin,
      name: name || 'New User',
      role: role || 'member',
      createdAt: new Date().toISOString()
    };

    const response = NextResponse.json({
      user,
      session: {
        user_id: user.id,
        phone_number: user.phone,
        role: user.role,
        name: user.name
      }
    });

    response.cookies.set('session', JSON.stringify({
      user_id: user.id,
      phone_number: user.phone,
      role: user.role,
      name: user.name
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}