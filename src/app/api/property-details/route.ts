import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

const BASE_URL = process.env.API_URL;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const PropertyNo = searchParams.get('assessmentNumber');

    if (!PropertyNo) {
      return NextResponse.json({ error: 'Assessment number is required' }, { status: 400 });
    }

    // Get authentication token using centralized management
    const token = await getAuthToken();

    // Make the property details request with the token
    const response = await fetch(`${BASE_URL}/Property/${PropertyNo}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Property not found' },
          { status: 404 }
        );
      }
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching property details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property details' },
      { status: 500 }
    );
  }
}
