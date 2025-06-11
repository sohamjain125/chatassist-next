'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StickyHeader from '@/components/layout/StickyHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyDetails from '@/components/PropertyDetails';
import { PropertyData } from '@/interface/property.interface';


export default function PropertyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get assessment number from URL data
        const data = searchParams?.get('data');
        if (!data) {
          throw new Error('No property data available');
        }

        const parsedData = JSON.parse(data) as { PropertyNo: string; SearchId: number };
        const PropertyNo = parsedData.PropertyNo;
        const searchId = parsedData.SearchId;

        // Fetch property details
        const propertyResponse = await fetch(`/api/property-details?assessmentNumber=${PropertyNo}`);
        if (!propertyResponse.ok) {
          throw new Error('Failed to fetch property details');
        }
        const propertyDetails = await propertyResponse.json();

        // Set SearchId
        propertyDetails.SearchId = searchId;

        setPropertyData(propertyDetails);
      } catch (err) {
        console.error('Error loading property data:', err);
        setError('Error loading property data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader showBackButton />
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
        <StickyHeader showBackButton />
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
    <div>
      <PropertyDetails propertyData={propertyData} />
    </div>
  );
}
