'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import StickyHeader from '@/components/layout/StickyHeader';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PropertyDetails from '@/components/PropertyDetails';
import { PropertyData } from '@/interface/property.interface';
import { decodeIds } from '@/lib/hash';
import { Loading } from '@/components/ui/loading';

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
        // Get property number and hash from URL
        const propertyNo = searchParams?.get('p');
        const hash = searchParams?.get('h');
        
        if (!propertyNo || !hash) {
          throw new Error('No property data available');
        }

        // Decode the hashed IDs
        const { searchId, propertyId } = decodeIds(hash);
        
        // Fetch property details
        const propertyResponse = await fetch(`/api/property-details?assessmentNumber=${propertyNo}`);
        if (!propertyResponse.ok) {
          throw new Error('Failed to fetch property details');
        }
        const propertyDetails = await propertyResponse.json();

        // Set SearchId and PropertyDetailId
        propertyDetails.hash = hash;
        propertyDetails.SearchId = searchId;
        propertyDetails.PropertyDetailId = propertyId;

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader showBackButton />
        <Loading text="Loading property details..." />
      </div>
    );
  }

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
        <Loading text="Initializing property view..." />
      </div>
    );
  }

  return (
    <div>
      <PropertyDetails propertyData={propertyData} />
    </div>
  );
}
