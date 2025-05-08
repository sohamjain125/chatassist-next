'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, MessageSquare, Menu, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Map from '@/components/Map';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter, useSearchParams } from 'next/navigation';
import StickyHeader from './layout/StickyHeader';
import { useSidebar } from './ui/sidebar';
import InfoCard from '@/components/ui/InfoCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Overlay, PropertyData, Zone } from '@/interface/property.interface';




interface PropertyDetailsProps {
  propertyData: PropertyData;
}

export default function PropertyDetails({ propertyData }: PropertyDetailsProps) {
  const [zones, setZones] = useState<Zone[]>([]);
  const [overlays, setOverlays] = useState<Overlay[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [propertyDetails, setPropertyDetails] = useState<PropertyData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMounted = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isMounted.current) return;
      isMounted.current = true;

      try {
        setLoading(true);
        setError(null);

        // Get assessment number from URL data
        const data = searchParams?.get('data');
        if (!data) {
          throw new Error('No property data available');
        }

        const parsedData = JSON.parse(data) as { assessmentNumber: string };
        const assessmentNumber = parsedData.assessmentNumber;
        
        // Fetch all data in parallel
        const [propertyResponse, zonesResponse, overlaysResponse] = await Promise.all([
          fetch(`/api/property-details?assessmentNumber=${assessmentNumber}`),
          fetch(`/api/zone?assessmentNumber=${assessmentNumber}`),
          fetch(`/api/overlay?assessmentNumber=${assessmentNumber}`)
        ]);

        if (!propertyResponse.ok) throw new Error('Failed to fetch property details');
        if (!zonesResponse.ok) throw new Error('Failed to fetch zones');
        if (!overlaysResponse.ok) throw new Error('Failed to fetch overlays');

        const [propertyData, zonesData, overlaysData] = await Promise.all([
          propertyResponse.json(),
          zonesResponse.json(),
          overlaysResponse.json()
        ]);

        setPropertyDetails(propertyData);
        setZones(zonesData);
        setOverlays(overlaysData);

      } catch (err) {
        console.error('Error fetching property details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted.current = false;
    };
  }, [searchParams]);

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
              <Menu className="h-5 w-5" />
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

  const handleAiClick = () => {
    setIsAiLoading(true);
    router.push(`/chat?summary=${encodeURIComponent(propertyData.Address)}`);
  };

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

  return (
    <div className="space-y-3 relative">
      {(loading || isAiLoading) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading property details..." : "Loading AI chat..."}
            </p>
          </div>
        </div>
      )}
      <StickyHeader>
        <SidebarToggle />
      </StickyHeader>
      <div className="top-[72px] z-10 bg-background">
        <Card className="p-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-gray-500 mt-1" />
            <div>
              <h2 className="text-lg font-semibold">{propertyData.Address}</h2>
              <p className="text-sm text-gray-600">
                {propertyData.Suburb}, {propertyData.State} {propertyData.Postcode}
              </p>
            </div>
          </div>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 mt-4">
        {/* Left Section */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="max-h-[80vh] overflow-y-auto">
            <div className="space-y-4 pb-12">
              <Card className="p-4">
                <div className="space-y-6">
                  <div className="h-[250px] ">
                  <Map
                      center={{
                        lat: propertyDetails?.Latitude || 0,
                        lng: propertyDetails?.Longitude || 0
                      }}
                      propertyPfi={propertyDetails?.Property_ID}
                      zoom={20}
                      height="200px"
                      buildingOutline={propertyDetails?.buildingOutline}
                      tilt={90}
                    />
                  </div>

                  {/* Lot Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lot Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Title ID</dt>
                        <dd className="font-medium text-xs">{propertyData.PlanNo}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Lot Area</dt>
                        <dd className="font-medium text-xs">{propertyData.AllotmentArea}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">LGA</dt>
                        <dd className="font-medium text-xs">{zones[0]?.LGA || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Is multi-lot?</dt>
                        <dd className="font-medium text-xs">
                          <Badge variant={propertyData.LotType === 'Yes' ? 'default' : 'secondary'}>
                            {propertyData.LotType}
                          </Badge>
                        </dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Property ID</dt>
                        <dd className="font-medium text-xs">{propertyData.Property_ID}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Zone Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Zones</h3>
                    <dl className="space-y-2">
                      {zones.map((zone, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                          <dt className="text-gray-600">{zone.ZoneCode}</dt>
                          <dd className="font-medium text-xs">{zone.ZoneDescription}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>

                  {/* Overlays Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Overlays</h3>
                    <dl className="space-y-2">
                      {overlays.map((overlay, index) => (
                        <div key={index} className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                          <dt className="text-gray-600">{overlay.OverlayCode}</dt>
                          <dd className="font-medium text-xs">{overlay.OverlayDescription}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Section */}
        {/* <div className="lg:col-span-7 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">What would you like to do?</h3>
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="building">Building</TabsTrigger>
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
                  onButtonClick={handleAiClick}
                  buttonDisabled={isAiLoading}
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
        </div> */}
                <div className="lg:col-span-7 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-lg font-semibold mb-2">What would you like to do?</h3>
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="planning">Planning</TabsTrigger>
                <TabsTrigger value="building">Building</TabsTrigger>
              </TabsList>
              <TabsContent value="planning">
                <InfoCard
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h-12 w-12">
                      <path fill="#0369a0" d="M96 0C43 0 0 43 0 96L0 416c0 53 43 96 96 96l288 0 32 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l0-64c17.7 0 32-14.3 32-32l0-320c0-17.7-14.3-32-32-32L384 0 96 0zm0 384l256 0 0 64L96 448c-17.7 0-32-14.3-32-32s14.3-32 32-32zm32-240c0-8.8 7.2-16 16-16l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16zm16 48l192 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-192 0c-8.8 0-16-7.2-16-16s7.2-16 16-16z"/>
 
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h-12 w-12">
                   <path fill="#0369a0" d="M248 106.6c18.9-9 32-28.3 32-50.6c0-30.9-25.1-56-56-56s-56 25.1-56 56c0 22.3 13.1 41.6 32 50.6l0 98.8c-2.8 1.3-5.5 2.9-8 4.7l-80.1-45.8c1.6-20.8-8.6-41.6-27.9-52.8C57.2 96 23 105.2 7.5 132S1.2 193 28 208.5c1.3 .8 2.6 1.5 4 2.1l0 90.8c-1.3 .6-2.7 1.3-4 2.1C1.2 319-8 353.2 7.5 380S57.2 416 84 400.5c19.3-11.1 29.4-32 27.8-52.8l50.5-28.9c-11.5-11.2-19.9-25.6-23.8-41.7L88 306.1c-2.6-1.8-5.2-3.3-8-4.7l0-90.8c2.8-1.3 5.5-2.9 8-4.7l80.1 45.8c-.1 1.4-.2 2.8-.2 4.3c0 22.3 13.1 41.6 32 50.6l0 98.8c-18.9 9-32 28.3-32 50.6c0 30.9 25.1 56 56 56s56-25.1 56-56c0-22.3-13.1-41.6-32-50.6l0-98.8c2.8-1.3 5.5-2.9 8-4.7l80.1 45.8c-1.6 20.8 8.6 41.6 27.8 52.8c26.8 15.5 61 6.3 76.5-20.5s6.3-61-20.5-76.5c-1.3-.8-2.7-1.5-4-2.1l0-90.8c1.4-.6 2.7-1.3 4-2.1c26.8-15.5 36-49.7 20.5-76.5S390.8 96 364 111.5c-19.3 11.1-29.4 32-27.8 52.8l-50.6 28.9c11.5 11.2 19.9 25.6 23.8 41.7L360 205.9c2.6 1.8 5.2 3.3 8 4.7l0 90.8c-2.8 1.3-5.5 2.9-8 4.6l-80.1-45.8c.1-1.4 .2-2.8 .2-4.3c0-22.3-13.1-41.6-32-50.6l0-98.8z"/>
 
                </svg>
                  }
                  title="Ai chat"
                  description="Ai chat is a tool that allows you to chat with the ai to get information about the property."
                  buttonLabel="Ask AI"
                  onButtonClick={handleAiClick}
                  buttonDisabled={isAiLoading}
                />
              </TabsContent>
              <TabsContent value="building">
                <InfoCard
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="h-12 w-12">
                      <path fill="#0369a0" d="M48 0C21.5 0 0 21.5 0 48L0 464c0 26.5 21.5 48 48 48l96 0 0-80c0-26.5 21.5-48 48-48s48 21.5 48 48l0 80 96 0c25.6 0 46.6-20.1 47.9-45.3C327.5 441.9 288 385.6 288 320c0-11 1.1-21.7 3.2-32L272 288c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16l32 0c4.8 0 9.1 2.1 12.1 5.5c16.9-24.5 40.4-44.1 67.9-56.2L384 48c0-26.5-21.5-48-48-48L48 0zM64 240c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zm112-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zM80 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zm80 16c0-8.8 7.2-16 16-16l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32zM272 96l32 0c8.8 0 16 7.2 16 16l0 32c0 8.8-7.2 16-16 16l-32 0c-8.8 0-16-7.2-16-16l0-32c0-8.8 7.2-16 16-16zM448 240.1a80 80 0 1 1 0 160 80 80 0 1 1 0-160zm0 208c26.7 0 51.4-8.2 71.9-22.1L599 505.1c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-79.1-79.1c14-20.5 22.1-45.3 22.1-71.9c0-70.7-57.3-128-128-128s-128 57.3-128 128s57.3 128 128 128z"/>
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
