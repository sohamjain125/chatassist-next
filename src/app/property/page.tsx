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
  // const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
      const fetchData = async () => {
       setLoading(true);
        setError(null);

        // Get assessment number from URL data
        const data = searchParams?.get('data');
        if (!data) {
          throw new Error('No property data available');
        }

        const parsedData = JSON.parse(data) as { assessmentNumber: string };
        const assessmentNumber = parsedData.assessmentNumber;
        const propertyResponse = await fetch(`/api/property-details?assessmentNumber=${assessmentNumber}`);
        const propertyData = await propertyResponse.json();
        setPropertyData(propertyData);

        if (!assessmentNumber) {
          throw new Error('No assessment number available');
        }
      }
      fetchData();
  }, [searchParams]);


  useEffect(() => {
    if (!searchParams) {
      console.log('No search parameters available');
      setError('No search parameters available');
      return;
    }

    const data = searchParams.get('data');
    if (!data) {
      console.log('No property data provided');
      setError('No property data provided');
      return;
    }

    try {
      const parsedData = JSON.parse(data);
      setPropertyData(parsedData);
    } catch (err) {
      console.error('Error parsing property data:', err);
      setError('Error loading property data');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StickyHeader  showBackButton />
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
        <StickyHeader  showBackButton />
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
      <div className="container mx-auto pl-0 pr-0 ">
        <PropertyDetails 
         propertyData={propertyData}
        />
      </div>
    </div>
  );
}
