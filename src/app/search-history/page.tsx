'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Menu, Loader2, ArrowLeft, Eye } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Map from '@/components/Map';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSidebar } from '@/components/ui/sidebar';
import StickyHeader from '@/components/layout/StickyHeader';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { encodeIds, decodeIds } from '@/lib/hash';

interface PropertyDetailsProps {
  SearchId: string;
  Address: string;
  PropertyDetailId: number;
  PropertyNo: string;
  CreatedAt: string;
  PlanNo: string;
  Suburb: string;
  State: string;
  Postcode: string;
  LotNo: string;
  SectionNo: string;
  Volume: string;
  Folio: string;
  AllotmentArea?: string;
  LotType?: string;
  Latitude?: number;
  Longitude?: number;
  Property_ID?: string;
  buildingOutline?: any;
  hash: string;
}


export default function HistoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const isMounted = useRef(true);
  const fetchTimeout = useRef<NodeJS.Timeout>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [propertyDetails, setPropertyDetails] = useState<PropertyDetailsProps | null>(null);
  const [zones, setZones] = useState<any[]>([]);
  const [overlays, setOverlays] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const fetchPropertyData = useCallback(async (PropertyNo: string) => {
    try {
      console.log('Fetching zones and overlays for property:', PropertyNo);
      const [propertyResponse, zonesResponse, overlaysResponse] = await Promise.all([
        fetch(`/api/property-details?assessmentNumber=${PropertyNo}`),
        fetch(`/api/zone?assessmentNumber=${PropertyNo}`),
        fetch(`/api/overlay?assessmentNumber=${PropertyNo}`)
      ]);

      if (!propertyResponse.ok || !zonesResponse.ok || !overlaysResponse.ok) {
        throw new Error('Failed to fetch property data');
      }

      const [propertyData, zonesData, overlaysData] = await Promise.all([
        propertyResponse.json(),
        zonesResponse.json(),
        overlaysResponse.json()
      ]);

      if (isMounted.current) {
        setZones(Array.isArray(zonesData) ? zonesData : []);
        setOverlays(Array.isArray(overlaysData) ? overlaysData : []);
        setPropertyDetails(prev => ({
          ...prev,
          ...propertyData,
          PropertyNo: PropertyNo
        }));
      }
    } catch (err) {
      console.error('Error fetching property data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch property data');
    }
  }, []);



  // Update fetchChatHistory to handle server-side storage
  const fetchChatHistory = async (hash: string) => {
    try {
      setIsLoadingChat(true);
      const response = await fetch(`/api/chat/history?h=${hash}`);
      const data = await response.json();
      
      if (data.success) {
        setChatHistory(data.sessions || []);
      } else {
        throw new Error(data.message || 'Failed to fetch chat history');
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Update fetchChatSession to handle server-side storage
  const fetchChatSession = async (sessionId: string) => {
    if (!propertyDetails?.SearchId) {
      console.error('Property details not found:', propertyDetails);
      toast({
        title: "Error",
        description: "Property details not found. Please try refreshing the page.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoadingChat(true);
      const response = await fetch(`/api/chat/history?searchId=${propertyDetails.SearchId}&sessionId=${sessionId}`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedChat(data.messages || []);
      } else {
        throw new Error(data.message || 'Failed to fetch chat session');
      }
    } catch (err) {
      console.error('Error fetching chat session:', err);
      toast({
        title: "Error",
        description: "Failed to load chat session",
        variant: "destructive",
      });
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Update initial data loading useEffect
  useEffect(() => {
    isMounted.current = true;
    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const propertyNo = searchParams?.get('p');
        const hash = searchParams?.get('h');
        
        if (!propertyNo || !hash) {
          throw new Error('No property data provided');
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
        propertyDetails.SearchId = searchId;
        propertyDetails.PropertyDetailId = propertyId;
  
        setPropertyDetails(propertyDetails);
        setLoading(false);
        
        // Clear any existing timeout
        if (fetchTimeout.current) {
          clearTimeout(fetchTimeout.current);
        }
  
        // Add a small delay to prevent rapid re-fetching
        fetchTimeout.current = setTimeout(() => {
          if (propertyNo) {
            fetchPropertyData(propertyNo);
          }
        }, 100);
  
      } catch (err) {
        console.error('Error setting property data:', err);
        setError(err instanceof Error ? err.message : 'Invalid property data format');
        setLoading(false);
      }
  
    }
    fetchData();
    return () => {
      isMounted.current = false;
      if (fetchTimeout.current) {
        clearTimeout(fetchTimeout.current);
      }
    };
  }, [searchParams, fetchPropertyData]);


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

  useEffect(() => {
    if (propertyDetails?.hash) {
      console.log('Fetching chat history for SearchId:', propertyDetails.hash);
      fetchChatHistory(propertyDetails.hash);
    }
  }, [propertyDetails?.hash]);

  useEffect(() => {
    console.log('Property details updated:', propertyDetails);
  }, [propertyDetails]);



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-red-500 mb-2">{error}</p>
          <Button onClick={() => router.push('/dashboard')} size="sm">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  if (!propertyDetails) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-2">No property details found</p>
          <Button onClick={() => router.push('/dashboard')} size="sm">Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {(isLoadingChat) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              Loading chat history...
            </p>
          </div>
        </div>
      )}
      <StickyHeader>
        <SidebarToggle />
      </StickyHeader>
      
     
      
      <div className="flex-1 pt-6 pb-8">
        <div className="top-[72px] z-10 bg-background">
          <Card className="p-4">
            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-gray-500 mt-1" />
              <div>
                <h2 className="text-lg font-semibold">{propertyDetails.Address}</h2>
                <p className="text-sm text-gray-600">
                  {propertyDetails.Suburb && `${propertyDetails.Suburb}, `}
                  {propertyDetails.State && `${propertyDetails.State} `}
                  {propertyDetails.Postcode}
                </p>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 p-4">
          {/* Left Section */}
          <div className="lg:col-span-5">
            <Card className="p-4 h-[calc(100vh-14rem)]">
              <div className="flex flex-col h-full">
                <div className="h-[300px] shrink-0">
                  <Map
                    center={{
                      lat: propertyDetails?.Latitude || 0,
                      lng: propertyDetails?.Longitude || 0
                    }}
                    propertyPfi={propertyDetails?.Property_ID}
                    zoom={20}
                    height="250px"
                    buildingOutline={propertyDetails?.buildingOutline}
                    tilt={90}
                  />
                </div>

                <div className="flex-1 overflow-y-auto mt-6">
                  {/* Lot Details Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Lot Details</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Title ID</dt>
                        <dd className="font-medium text-xs">{propertyDetails.PlanNo}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Lot Area</dt>
                        <dd className="font-medium text-xs">{propertyDetails.AllotmentArea}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">LGA</dt>
                        <dd className="font-medium text-xs">{zones[0]?.LGA || 'N/A'}</dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Is multi-lot?</dt>
                        <dd className="font-medium text-xs">
                          {/* <Badge variant={propertyData.LotType === 'Yes' ? 'default' : 'secondary'}>
                            {propertyData.LotType}
                          </Badge> */}
                          {propertyDetails.LotType === 'Yes' ? 'Yes' : 'No'}
                        </dd>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded bg-white border text-sm">
                        <dt className="text-gray-600">Property ID</dt>
                        <dd className="font-medium text-xs">{propertyDetails.PropertyNo}</dd>
                      </div>
                    </dl>
                  </div>

                  {/* Zone Section */}
                  <div style={{paddingTop: '10px'}}>
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
                  <div style={{paddingTop: '10px'}}>
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
              </div>
            </Card>
          </div>

          {/* Right Section */}
          
          <div className="lg:col-span-7 flex flex-col gap-4 h-[calc(100vh-14rem)] overflow-y-auto">
            <Card className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">Chat History</h3>
                
              </div>
              
              {isLoadingChat ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedChat ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedChat(null)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Sessions
                    </Button>
                  </div>
                  <div className="space-y-4">
                    {selectedChat.map((message: any, index: number) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.sender === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            message.sender === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          {message.sender === "bot" && (
                            <div className="flex items-start gap-3 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-secondary text-secondary-foreground">AI</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <div className="font-medium">Property Assistant</div>
                                <div className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                              </div>
                            </div>
                          )}
                          <div className="text-sm">{message.content}</div>
                          {message.sender === "user" && (
                            <div className="text-xs text-right mt-1 text-primary-foreground/70">
                              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No chat history found for this property
                    </div>
                  ) : (
                    chatHistory.map((session) => (
                      <div
                        key={session.LexSessionId}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => fetchChatSession(session.LexSessionId)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">
                              Chat from {new Date(session.CreatedAt).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {session.firstMessage} ... {session.lastMessage}
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
