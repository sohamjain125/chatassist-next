import { NextResponse } from 'next/server';

const BASE_URL = 'https://surfcoastapi-test.greenlightopm.com/api';
let authToken: string | null = null;
let tokenExpiry: number | null = null;

async function getAuthToken() {
  // Check if we have a valid token
  if (authToken && tokenExpiry && Date.now() < tokenExpiry) {
    return authToken;
  }

  try {
    const response = await fetch(`${BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'greenlight_user',
        password: '$urfCo@$t_2025'
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get authentication token');
    }

    const data = await response.json();
    authToken = data.token;
    
    // Set token expiry to 23 hours from now (giving 1 hour buffer)
    // tokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
    
    return authToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assessmentNumber = searchParams.get('assessmentNumber');

    if (!assessmentNumber) {
      return NextResponse.json({ error: 'Assessment number is required' }, { status: 400 });
    }

    // Get authentication token
    const token = await getAuthToken();

    // Make the property details request with the token
    const response = await fetch(`${BASE_URL}/Property/${assessmentNumber}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
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
