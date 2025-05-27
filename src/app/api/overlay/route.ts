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


let authToken: string | null = null;

const BASE_URL = process.env.API_URL;
const USERNAME = process.env.SURF_COAST_USERNAME;
const PASSWORD = process.env.SURF_COAST_PASSWORD;
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
    // tokenExpiry = Date.now() + 3600000;
    return authToken;
  } catch (error) {
    console.error('Error getting auth token:', error);
    throw error;
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const PropertyNo = searchParams.get('assessmentNumber');

    if (!PropertyNo) {
      return NextResponse.json(
        { error: 'Assessment number is required' },
        { status: 400 }
      );
    }

    const token = await getAuthToken();

    if (!token) {
      throw new Error('Failed to get authentication token');
    }

    console.log('Fetching overlays for assessment number:', PropertyNo);
    const response = await fetch(`${BASE_URL}/Overlay/${PropertyNo}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'No overlays found for this property' },
          { status: 404 }
        );
      }
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }

    const overlays: Overlay[] = await response.json();
    
    // Validate response format
    if (!Array.isArray(overlays)) {
      console.error('Invalid response format:', overlays);
      throw new Error('Invalid response format: expected an array of overlays');
    }

    // Log successful response
    console.log('Successfully fetched overlays:', {
      count: overlays.length,
      assessmentNumber: PropertyNo
    });

    return NextResponse.json(overlays);
  } catch (error) {
    console.error('Error fetching overlay information:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch overlay information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}