import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'Australia/Melbourne';

export async function POST(req: Request) {
  let transaction;
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

    const { searchId, sessionId, messages } = await req.json();
   

    // Get database connection
    const pool = await getConnection();

    // Start a transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    // Create or update chat session and get the generated ChatSessionId
    const sessionResult = await transaction.request()
      .input('SearchId', sql.Int, searchId)
      .input('LexSessionId', sql.NVarChar, sessionId)
      .query(`
        IF EXISTS (SELECT 1 FROM ChatSession WHERE LexSessionId = @LexSessionId)
          SELECT ChatSessionId FROM ChatSession WHERE LexSessionId = @LexSessionId
        ELSE
          INSERT INTO ChatSession (SearchId, LexSessionId)
          OUTPUT INSERTED.ChatSessionId
          VALUES (@SearchId, @LexSessionId)
      `);

    const chatSessionId = sessionResult.recordset[0].ChatSessionId;
   

    // Insert messages with deduplication
    for (const msg of messages) {
      // Convert timestamp to UTC before saving
      const utcTimestamp = new Date(formatInTimeZone(new Date(msg.timestamp), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"));
      
      // Check if message already exists
      const existingMessage = await transaction.request()
        .input('ChatSessionId', sql.Int, chatSessionId)
        .input('Content', sql.NVarChar, msg.content)
        .input('Sender', sql.NVarChar, msg.sender)
        .input('Timestamp', sql.DateTime, utcTimestamp)
        .query(`
          SELECT TOP 1 ChatMessageId
          FROM ChatMessage
          WHERE ChatSessionId = @ChatSessionId
            AND Content = @Content
            AND Sender = @Sender
            AND Timestamp = @Timestamp
        `);

      if (existingMessage.recordset.length === 0) {
        // Only insert if message doesn't exist
        await transaction.request()
          .input('ChatSessionId', sql.Int, chatSessionId)
          .input('Content', sql.NVarChar, msg.content)
          .input('Sender', sql.NVarChar, msg.sender)
          .input('Timestamp', sql.DateTime, utcTimestamp)
          .input('ResponseCard', sql.NVarChar, msg.responseCard ? JSON.stringify(msg.responseCard) : null)
          .query(`
            INSERT INTO ChatMessage (
              ChatSessionId,
              Content,
              Sender,
              Timestamp,
              ResponseCard
            )
            VALUES (
              @ChatSessionId,
              @Content,
              @Sender,
              @Timestamp,
              @ResponseCard
            )
          `);
      }
    }

    // Commit the transaction
    await transaction.commit();
    

    return NextResponse.json({ 
      success: true, 
      chatSessionId,
      sessionId
    });
  } catch (error) {
    console.error('Error saving chat:', error);
    // Only attempt rollback if transaction exists and hasn't been committed
    if (transaction) {
      try {
        await transaction.rollback();
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
    }
    return NextResponse.json(
      { success: false, error: 'Failed to save chat' },
      { status: 500 }
    );
  }
} 