import { NextResponse } from 'next/server';

interface Zone {
  SchemeCode: string;
  LGA: string;
  ZoneNum: number;
  ZoneCode: string;
  ZoneDescription: string;
  GazetteDate: string | null;
  SourceType: string;
}

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
      const errorText = await response.text();
      console.error('Auth response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to get authentication token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    authToken = data.token;
    // Set token expiry to 1 hour from now
    tokenExpiry = Date.now() + 3600000;
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
      return NextResponse.json(
        { error: 'Assessment number is required' },
        { status: 400 }
      );
    }

    const token = await getAuthToken();

    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    console.log('Fetching zones for assessment number:', assessmentNumber);
    const response = await fetch(`${BASE_URL}/Zone/${assessmentNumber}`, {
        headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Zone API response error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: `${BASE_URL}/Zone/${assessmentNumber}`
      });
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }

    const zones: Zone[] = await response.json();
    
    // Validate response format
    if (!Array.isArray(zones)) {
      console.error('Invalid response format:', zones);
      throw new Error('Invalid response format: expected an array of zones');
    }

    // Log successful response
    console.log('Successfully fetched zones:', {
      count: zones.length,
      assessmentNumber
    });

    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching zone information:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch zone information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
