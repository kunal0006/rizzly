import { NextResponse } from 'next/server';
import { validateAdminCredentials, signAdminToken, setAdminCookie } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signAdminToken();
    await setAdminCookie(token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
