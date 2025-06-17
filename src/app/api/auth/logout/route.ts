import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

export async function POST() {
  try {
    // Clear the auth token cookie
    const cookieStore = await cookies();
    
    // Set cookie with options that will cause it to be deleted
    cookieStore.set('auth_token', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as ResponseCookie['sameSite'],
      path: '/',
      maxAge: 0 // This ensures the cookie is deleted immediately
    });
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
} 