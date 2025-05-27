import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url);
    const searchId = searchParams.get('searchId');

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: 'Search ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // Get chat session and messages
    const { recordset: sessions } = await pool.request()
      .input('SearchId', sql.Int, searchId)
      .query(`
        SELECT TOP 1 ChatSessionId, LexSessionId
        FROM ChatSession 
        WHERE SearchId = @SearchId
        ORDER BY CreatedAt DESC
      `);

    if (sessions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Chat session not found' },
        { status: 404 }
      );
    }

    const chatSessionId = sessions[0].ChatSessionId;
    const lexSessionId = sessions[0].LexSessionId;

    const { recordset: messages } = await pool.request()
      .input('ChatSessionId', sql.Int, chatSessionId)
      .query(`
        SELECT 
          ChatMessageId as id,
          Content as content,
          Sender as sender,
          Timestamp as timestamp,
          ResponseCard as responseCard
        FROM ChatMessage
        WHERE ChatSessionId = @ChatSessionId
        ORDER BY Timestamp ASC
      `);

    // Parse response cards from JSON strings
    const parsedMessages = messages.map(msg => ({
      ...msg,
      responseCard: msg.responseCard ? JSON.parse(msg.responseCard) : null
    }));

    return NextResponse.json({ 
      success: true, 
      messages: parsedMessages,
      sessionId: lexSessionId
    });
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
} 