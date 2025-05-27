import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getConnection } from './db';
import sql from 'mssql';

export async function registerUser(firstName: string, lastName: string, email: string, password: string) {
  try {
    const pool = await getConnection();
    // Check if user exists
    const existing = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT UserId FROM Users WHERE email = @email');
    
    if (existing.recordset.length > 0) {
      return { error: 'Email already registered' };
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.request()
      .input('firstName', sql.NVarChar, firstName)
      .input('lastName', sql.NVarChar, lastName)
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, hashed)
      .query('INSERT INTO Users (firstName, lastName, email, password) VALUES (@firstName, @lastName, @email, @password)');
    
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM Users WHERE email = @email');

    const user = result.recordset[0];
    if (!user) {
      return { error: 'Invalid credentials' };
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return { error: 'Invalid credentials' };
    }

    const token = jwt.sign(
      { UserId: user.UserId, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1d' }
    );

    return {
      token,
      user: {
        UserId: user.UserId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { UserId: number, email: string };
    
    const pool = await getConnection();
    const result = await pool.request()
      .input('UserId', sql.Int, decoded.UserId)
      .query('SELECT UserId, firstName, lastName, email FROM Users WHERE UserId = @UserId');

    const user = result.recordset[0];
    if (!user) {
      return null;
    }

    return {
      UserId: user.UserId,
      firstname: user.firstName,
      lastname: user.lastName,
      email: user.email
    };
  } catch (err) {
    return null;
  }
}

export interface User {
  firstname: string;
  lastname: string;
  email: string;
  UserId: number;
}

export function saveUserToLocalStorage(user: User) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUserFromLocalStorage(): User | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function clearUserFromLocalStorage() {
  localStorage.removeItem('user');
}   