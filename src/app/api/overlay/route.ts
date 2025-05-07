import { NextResponse } from 'next/server';

interface Overlay {
  SchemeCode: string;
  LGA: string;
  OverlayNum: number;
  OverlayCode: string;
  OverlayDescription: string;
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

    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    if (!BASE_URL) {
      throw new Error('API base URL is not configured');
    }

    const response = await fetch(`${BASE_URL}/api/Overlay/${assessmentNumber}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const overlays: Overlay[] = await response.json();
    return NextResponse.json(overlays);
  } catch (error) {
    console.error('Error fetching overlay information:', error);
    return NextResponse.json(
      { error: 'Failed to fetch overlay information' },
      { status: 500 }
    );
  }
}