import { NextResponse } from 'next/server';
import { sql, getConnection } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
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

    const pool = await getConnection();
    const { recordset: searches } = await pool.request()
      .input('UserId', sql.Int, user.UserId)
      .query(`
        SELECT 
          s.SearchId,
          s.Address,
          s.CreatedAt,
          pd.PropertyDetailId,
          pd.PropertyNo
        FROM Search s
        LEFT JOIN PropertyDetail pd ON s.SearchId = pd.SearchId
        WHERE s.UserId = @UserId
        ORDER BY s.CreatedAt DESC
      `);

    return NextResponse.json({ 
      success: true, 
      searches: searches.map(search => ({
        ...search,
        PropertyNo: search.PropertyNo || search.PropertyDetailId
      }))
    });
  } catch (error) {
    console.error('Error fetching search history:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch search history' },
      { status: 500 }
    );
  }
} 