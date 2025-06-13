import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth';

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

    // Fetch all property data in parallel
    const [propertyResponse, zonesResponse, overlaysResponse] = await Promise.all([
      fetch(`${BASE_URL}/Property/${PropertyNo}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }),
      fetch(`${BASE_URL}/Zone/${PropertyNo}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      }),
      fetch(`${BASE_URL}/Overlay/${PropertyNo}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
    ]);

    // Handle property details response
    if (!propertyResponse.ok) {
      if (propertyResponse.status === 404) {
        return NextResponse.json(
          { success: false, error: 'Property not found' },
          { status: 404 }
        );
      }
      throw new Error(`Property API responded with status: ${propertyResponse.status}`);
    }

    // Handle zones response
    if (!zonesResponse.ok && zonesResponse.status !== 404) {
      throw new Error(`Zones API responded with status: ${zonesResponse.status}`);
    }

    // Handle overlays response
    if (!overlaysResponse.ok && overlaysResponse.status !== 404) {
      throw new Error(`Overlays API responded with status: ${overlaysResponse.status}`);
    }

    // Parse all responses
    const [propertyData, zonesData, overlaysData] = await Promise.all([
      propertyResponse.json(),
      zonesResponse.ok ? zonesResponse.json() : [],
      overlaysResponse.ok ? overlaysResponse.json() : []
    ]);

    // Validate response formats
    if (!Array.isArray(zonesData)) {
      console.error('Invalid zones response format:', zonesData);
      throw new Error('Invalid zones response format: expected an array');
    }

    if (!Array.isArray(overlaysData)) {
      console.error('Invalid overlays response format:', overlaysData);
      throw new Error('Invalid overlays response format: expected an array');
    }

    // Return combined data
    return NextResponse.json({
      success: true,
      property: propertyData,
      zones: zonesData,
      overlays: overlaysData
    });
  } catch (error) {
    console.error('Error fetching property data:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch property data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 