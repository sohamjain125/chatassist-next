import { NextResponse } from 'next/server';
import { getConnection, sql } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getConnection();
    
    // Check if user already exists
    const existingUser = await db
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user
    const result = await db
      .request()
      .input('username', sql.VarChar, username)
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .query(
        'INSERT INTO Users (username, email, password) VALUES (@username, @email, @password); SELECT SCOPE_IDENTITY() AS id;'
      );

    return NextResponse.json(
      { message: 'User registered successfully', userId: result.recordset[0].id },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 