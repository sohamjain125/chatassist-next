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
    const assessmentNumber = searchParams.get('assessmentNumber');

    if (!assessmentNumber) {
      return NextResponse.json(
        { error: 'Assessment number is required' },
        { status: 400 }
      );
    }

    const token = await getAuthToken();

    if (!BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    if (!token) {
      throw new Error('API token is not configured');
    }

    const response = await fetch(`${BASE_URL}/api/Zone/${assessmentNumber}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const zones: Zone[] = await response.json();
    return NextResponse.json(zones);
  } catch (error) {
    console.error('Error fetching zone information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch zone information' },
      { status: 500 }
    );
  }
}
