import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getConnection } from '@/lib/db';
import bcrypt from 'bcryptjs';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split(' ')[1];
    
    // Verify the token and get user info
    const user = await verifyToken(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get the request body
    const body = await request.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    // Get the user's current password from the database
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, user.id)
      .query('SELECT password FROM Users WHERE id = @id');

    const dbUser = result.recordset[0];
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify current password
    const match = await bcrypt.compare(currentPassword, dbUser.password);
    if (!match) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the password in the database
    await pool.request()
      .input('id', sql.Int, user.id)
      .input('password', sql.NVarChar, hashedPassword)
      .query('UPDATE Users SET password = @password WHERE id = @id');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
} 