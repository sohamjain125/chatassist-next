import { NextResponse } from 'next/server';

const BASE_URL = process.env.API_URL;
const USERNAME = process.env.SURF_COAST_USERNAME;
const PASSWORD = process.env.SURF_COAST_PASSWORD ;
let authToken: string | null = null;

async function getAuthToken() {
  // Check if we have a valid token
  if (authToken ) {
    return authToken;
  }

  try {
    const response = await fetch(`${BASE_URL}/Auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        username: USERNAME,
        password: PASSWORD
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get authentication token');
    }

    const data = await response.json();
    authToken = data.token;
    
    
    return authToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Get authentication token
    const token = await getAuthToken();

    // Make the property list request with the token
    const response = await fetch(`${BASE_URL}/PropertyList/${query}`, {
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
    console.error('Error fetching property suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property suggestions' },
      { status: 500 }
    );
  }
}
