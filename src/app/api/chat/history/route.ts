import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { decodeSearchId } from '@/lib/hash';

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
    let searchId = searchParams.get('searchId');
    const hash = searchParams.get('h');
    const sessionId = searchParams.get('sessionId') || searchParams.get('s');

    // If hash is provided, decode it
    if (hash) {
      try {
        searchId = decodeSearchId(hash).toString();
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid hash' },
          { status: 400 }
        );
      }
    }

    if (!searchId) {
      return NextResponse.json(
        { success: false, error: 'Search ID is required' },
        { status: 400 }
      );
    }

    const pool = await getConnection();

    // First verify that the user has access to this search
    const searchResult = await pool.request()
      .input('SearchId', sql.Int, searchId)
      .input('UserId', sql.Int, user.UserId)
      .query(`
        SELECT SearchId 
        FROM Search 
        WHERE SearchId = @SearchId AND UserId = @UserId
      `);

    if (searchResult.recordset.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    if (sessionId) {
      // Get specific chat session and messages
      const { recordset: sessions } = await pool.request()
        .input('SearchId', sql.Int, searchId)
        .input('LexSessionId', sql.NVarChar, sessionId)
        .query(`
          SELECT ChatSessionId, LexSessionId, Status, CreatedAt
          FROM ChatSession 
          WHERE SearchId = @SearchId AND LexSessionId = @LexSessionId
        `);

      if (sessions.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Chat session not found' },
          { status: 404 }
        );
      }

      const chatSessionId = sessions[0].ChatSessionId;

      // Get messages with proper ordering and deduplication
      const { recordset: messages } = await pool.request()
        .input('ChatSessionId', sql.Int, chatSessionId)
        .query(`
          WITH RankedMessages AS (
            SELECT 
              ChatMessageId as id,
              Content as content,
              Sender as sender,
              Timestamp as timestamp,
              ResponseCard as responseCard,
              ROW_NUMBER() OVER (
                PARTITION BY Content, Sender, Timestamp 
                ORDER BY ChatMessageId
              ) as rn
            FROM ChatMessage
            WHERE ChatSessionId = @ChatSessionId
          )
          SELECT 
            id,
            content,
            sender,
            timestamp,
            responseCard
          FROM RankedMessages
          WHERE rn = 1
          ORDER BY timestamp ASC
        `);

      // Parse response cards from JSON strings
      const parsedMessages = messages.map(msg => ({
        ...msg,
        responseCard: msg.responseCard ? JSON.parse(msg.responseCard) : null
      }));

      return NextResponse.json({ 
        success: true, 
        messages: parsedMessages,
        sessionId: sessions[0].LexSessionId,
        status: sessions[0].Status,
        createdAt: sessions[0].CreatedAt
      });
    } else {
      // Get all chat sessions for the search
      const { recordset: sessions } = await pool.request()
        .input('SearchId', sql.Int, searchId)
        .query(`
          SELECT 
            ChatSessionId,
            LexSessionId,
            Status,
            CreatedAt,
            (
              SELECT TOP 1 Content
              FROM ChatMessage
              WHERE ChatSessionId = ChatSession.ChatSessionId
              ORDER BY Timestamp ASC
            ) as FirstMessage,
            (
              SELECT TOP 1 Content
              FROM ChatMessage
              WHERE ChatSessionId = ChatSession.ChatSessionId
              ORDER BY Timestamp DESC
            ) as LastMessage
          FROM ChatSession 
          WHERE SearchId = @SearchId
          ORDER BY CreatedAt DESC
        `);

      return NextResponse.json({ 
        success: true, 
        sessions: sessions.map(session => ({
          ...session,
          firstMessage: session.FirstMessage,
          lastMessage: session.LastMessage
        }))
      });
    }
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve chat history' },
      { status: 500 }
    );
  }
} 