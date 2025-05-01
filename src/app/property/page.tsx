'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StickyHeader from '@/components/layout/StickyHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import PropertyDetails from '@/components/PropertyDetails';

interface PropertyData {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  titleId: string;
  lotArea: string;
  lga: string;
  isMultiLot: string;
  propertyId: string;
  location: {
    lat: number;
    lng: number;
  };
  buildingOutline: any;
  timestamp: string;
}

export default function PropertyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!searchParams) {
      console.log('No search parameters available');
      setError('No search parameters available');
      return;
    }

    const address = searchParams.get('address');
    if (!address) {
      console.log('No property address provided');
      setError('No property address provided');
      return;
    }

    try {
      const PROPERTY_DATA_KEY = 'current_property_data';
      const storedData = localStorage.getItem(PROPERTY_DATA_KEY);
      console.log('Stored data:', storedData);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log('Parsed data:', parsedData);
        console.log('Expected address:', decodeURIComponent(address));
        console.log('Actual address:', parsedData.address);
        
        if (parsedData.address === decodeURIComponent(address)) {
          setPropertyData(parsedData);
          // Only clear the data after we've successfully set it in state
          setTimeout(() => {
            localStorage.removeItem(PROPERTY_DATA_KEY);
          }, 1000);
        } else {
          console.log('Address mismatch');
          setError('Property data not found');
        }
      } else {
        console.log('No stored data found');
        setError('Property data not found');
      }
    } catch (err) {
      console.error('Error loading property data:', err);
      setError('Error loading property data');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader title="Property Details" showBackButton />
        <div className="container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => router.push('/search')}>
              Go Back to Search
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader title="Property Details" showBackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-4">
        <PropertyDetails 
          propertyData={propertyData} 
        />
      </div>
    </div>
  );
}
