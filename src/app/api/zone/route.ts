import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

interface Zone {
  SchemeCode: string;
  LGA: string;
  ZoneNum: number;
  ZoneCode: string;
  ZoneDescription: string;
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

    console.log('Fetching zones for assessment number:', PropertyNo);
    const response = await fetch(`${BASE_URL}/Zone/${PropertyNo}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { success: false, error: 'No zones found for this property' },
          { status: 404 }
        );
      }
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
      assessmentNumber: PropertyNo
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
