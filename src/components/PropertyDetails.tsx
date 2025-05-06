'use client';

import { useState, useEffect } from 'react';
import { MapPin, MessageSquare, Menu } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Map from '@/components/Map';
import { Button } from '@/components/ui/button';
import { propertyApi, PropertyDetails as PropertyDetailsType } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import StickyHeader from './layout/StickyHeader';
import { useSidebar } from './ui/sidebar';

interface PropertyDetailsProps {
  propertyId?: string;
  address?: string;
  geometry?: {
    rings: number[][][];
    spatialReference: {
      wkid: number;
    };
  };
  propertyData?: {
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
    buildingOutline: {
      coordinates: Array<{lat: number; lng: number}>;
      measurements: Array<{
        start: {lat: number; lng: number};
        end: {lat: number; lng: number};
        length: string;
      }>;
      area: string;
    };
  };
}

export default function PropertyDetails({ 
  propertyId = 'PS826416', 
  address, 
  geometry,
  propertyData 
}: PropertyDetailsProps) {
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (propertyData) {
      setLoading(false);
      return;
    }
    const fetchPropertyDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        if (address && geometry) {
          const details = await propertyApi.getPropertyDetails(address, geometry);
          setPropertyDetails(details);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyDetails();
  }, [address, geometry, propertyData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => window.location.reload()} size="sm">Try Again</Button>
        </div>
      </div>
    );
  }

  const displayData = propertyData || propertyDetails;
  if (!displayData) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p>No property data available</p>
      </div>
    );
  }

  const location = propertyData ? 
    propertyData.location : 
    { lat: geometry!.rings[0][0][1], lng: geometry!.rings[0][0][0] };

  const buildingOutline = propertyData ? 
    propertyData.buildingOutline :
    {
      coordinates: geometry!.rings[0].map(([lng, lat]) => ({ lat, lng })),
      measurements: geometry!.rings[0].map((coords, i, arr) => {
        const nextCoords = arr[(i + 1) % arr.length];
        return {
          start: { lat: coords[1], lng: coords[0] },
          end: { lat: nextCoords[1], lng: nextCoords[0] },
          length: "calculated"
        };
      }),
      area: `${propertyDetails?.area}m²`
    };

  const displayAddress = propertyData?.address || displayData.address || "";
  const displaySuburb = propertyData?.suburb || "";
  const displayState = propertyData?.state || "";
  const displayPostcode = propertyData?.postcode || "";

  const SidebarToggle = () => {
    const { toggleSidebar } = useSidebar();
    return (
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={toggleSidebar}
        className="mr-2"
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>
    );
  };

  // Question buttons for the right section
  const questions = [
    {
      label: 'Do you want to apply for a planning permit?',
      message: `I want to apply for a planning permit for the property at ${displayAddress}.`,
    },
    {
      label: 'Do you want to apply for a building permit?',
      message: `I want to apply for a building permit for the property at ${displayAddress}.`,
    },
    {
      label: 'Do you want more info about this property?',
      message: `Can you provide more information about the property at ${displayAddress}?`,
    },
  ];

  return (
    <div className="space-y-3">
      <StickyHeader title="Property Details" >
        <SidebarToggle />
      </StickyHeader>
          <div className="top-[72px] z-10 bg-background">
            <Card className="p-4">
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-gray-500 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold">{displayAddress}</h2>
                  <p className="text-sm text-gray-600">
                    {displaySuburb}, {displayState} {displayPostcode}
                  </p>
                </div>
              </div>
            </Card>
          </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
        {/* Left Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Sticky Address Section */}

          {/* Scrollable Map and Details Section */}
          <div className="h-[calc(100vh-180px)] overflow-y-auto">
            <div className="space-y-4">
              {/* Map Card */}
              <Card className="overflow-hidden">
                <div className="h-[250px] w-full">
                  <Map
                    center={location}
                    buildingOutline={buildingOutline}
                  />
                </div>
              </Card>

              {/* Information Card */}
              <Card className="p-4">
                <div className="space-y-6">
                  {/* Lot Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lot Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Title ID</dt>
                        <dd className="font-medium">{propertyData?.titleId}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Lot Area</dt>
                        <dd className="font-medium">{propertyData?.lotArea}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">LGA</dt>
                        <dd className="font-medium">{propertyData?.lga}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Is multi-lot?</dt>
                        <dd className="font-medium">
                          <Badge variant={propertyData?.isMultiLot === 'Yes' ? 'default' : 'secondary'}>
                            {propertyData?.isMultiLot}
                          </Badge>
                        </dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Property ID</dt>
                        <dd className="font-medium">{propertyData?.propertyId}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Zone Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Zone</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">CCZ1</dt>
                        <dd className="font-medium">Capital City Zone</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Overlays Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Overlays</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">DDO1</dt>
                        <dd className="font-medium">Design and Development Overlay</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">HO1</dt>
                        <dd className="font-medium">Heritage Overlay</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">VPO1</dt>
                        <dd className="font-medium">Vegetation Protection Overlay</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
        {/* Right Section */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">What would you like to do?</h3>
            {questions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start text-left"
                onClick={() => router.push(`/chat?message=${encodeURIComponent(q.message)}`)}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                {q.label}
              </Button>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
