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
import InfoCard from '@/components/ui/InfoCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


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
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

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
    const { toggleSidebar, state } = useSidebar();
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="mr-2 hover:text-white transition-colors"
            >
              <Menu className="h-5 w-5 " />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {state === 'expanded' ? 'Close sidebar' : 'Open sidebar'}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };
  return (
    <div className="space-y-3 ">
      <StickyHeader  >
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mt-4">
        {/* Left Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Sticky Address Section */}

          {/* Scrollable Map and Details Section */}
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-4 pb-12">
             
              {/* Information Card */}
              <Card className="p-4">
                <div className="space-y-6">
                <div className="h-[250px] w-full">
                  <Map
                    center={location}
                    buildingOutline={buildingOutline}
                  />
                </div>
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
        <div className="lg:col-span-7 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">What would you like to do?</h3>
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="planning">Planning </TabsTrigger>
                <TabsTrigger value="building">Building </TabsTrigger>
              </TabsList>
              <TabsContent value="planning">
                <InfoCard
                  icon={
                    <svg className="h-12 w-12 text-primary" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>
                      <path fill="currentColor" d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z"/>
                    </svg>
                  }
                  title="Planning assessment report"
                  description="Our instant tool shows whether your project in NSW is eligible for fast CDC approval. With a transparent audit trail, it shows max height and floor area, min lot area, and other building rules."
                  tip={<span className="text-xs text-blue-600 underline cursor-pointer hover:text-blue-800 ml-2 align-middle" onClick={() => router.push('/planning-assessment-report')}>Not sure what is this? click here to learn more</span>}
                  buttonLabel="View Report"
                  onButtonClick={undefined}
                  buttonDisabled={true}
                />
                <InfoCard
                  icon={
                    <svg className="h-12 w-12 text-primary" viewBox="0 0 24 24">
                      <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor" />
                      <rect x="7" y="8" width="10" height="2" rx="1" fill="#fff" />
                      <rect x="7" y="12" width="10" height="2" rx="1" fill="#fff" />
                    </svg>
                  }
                  title="Ai chat"
                  description="Ai chat is a tool that allows you to chat with the ai to get information about the property."
                  buttonLabel="Ask AI"
                  onButtonClick={() => router.push(`/chat?summary=${encodeURIComponent(displayAddress)}`)}
                />
              </TabsContent>
              <TabsContent value="building">
                <InfoCard
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h-12 w-12">
                      <path fill="#4c95bb" d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c25.6 0 46.6-20.1 47.9-45.3C327.5 441.9 288 385.6 288 320c0-11 1.1-21.7 3.2-32L272 288c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c4.8 0 9.1 2.1 12.1 5.5c16.9-24.5 40.4-44.1 67.9-56.2L384 48c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zM448 240.1a80 80 0 1 1 0 160 80 80 0 1 1 0-160zm0 208c26.7 0 51.4-8.2 71.9-22.1L599 505.1c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-79.1-79.1c14-20.5 22.1-45.3 22.1-71.9c0-70.7-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128z"/>
                    </svg>
                  }
                  title="Search for building"
                  description="Find out if you need a building permit and get started with your application."
                  buttonLabel="Building Permit"
                  onButtonClick={() => router.push('/under-construction')}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}
