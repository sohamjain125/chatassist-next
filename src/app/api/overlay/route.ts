import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

interface Overlay {
  SchemeCode: string;
  LGA: string;
  OverlayNum: number;
  OverlayCode: string;
  OverlayDescription: string;
  GazetteDate: string | null;
  SourceType: string;
}

const BASE_URL = process.env.API_URL;

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

   
    const response = await fetch(`${BASE_URL}/Overlay/${PropertyNo}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Return an empty array for no overlays
        return NextResponse.json([], { status: 200 });
      }
      throw new Error(`API responded with status: ${response.status} - ${response.statusText}`);
    }

    const overlays: Overlay[] = await response.json();
    
    // Validate response format
    if (!Array.isArray(overlays)) {
      console.error('Invalid response format:', overlays);
      throw new Error('Invalid response format: expected an array of overlays');
    }

   

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