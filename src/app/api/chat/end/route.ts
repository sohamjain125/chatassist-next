import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 }
      );
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Update the chat session status to 'ended'
    await pool.request()
      .input('LexSessionId', sql.NVarChar, sessionId)
      .input('UpdatedAt', sql.DateTime, new Date())
      .query(`
        UPDATE ChatSession 
        SET Status = 'ended', UpdatedAt = @UpdatedAt
        WHERE LexSessionId = @LexSessionId
      `);

    return NextResponse.json({ 
      success: true,
      message: 'Chat session ended successfully'
    });
  } catch (error) {
    console.error('Error ending chat session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to end chat session' },
      { status: 500 }
    );
  }
} 