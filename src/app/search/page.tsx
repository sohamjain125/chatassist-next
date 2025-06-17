'use client';

import { useState, useRef, useEffect } from 'react';
import { Search as SearchIcon, AlertCircle, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Map from '@/components/Map';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { PropertyDetails, PropertySuggestion } from '@/interface/property.interface';

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PropertySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isContinueLoading, setIsContinueLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetails | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Handle clicks outside suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length > 0) {
      try {
        const response = await fetch(`/api/property-list?query=${encodeURIComponent(value)}`);
        if (response.status === 404) {
          setError('Property not found');
          setSuggestions([]);
          setShowSuggestions(false);
          return;
        }
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter an address to search');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First get property suggestions
      const suggestionsResponse = await fetch(`/api/property-list?query=${encodeURIComponent(searchQuery)}`);
     
      const suggestions = await suggestionsResponse.json();
      
      if (suggestions.length === 0 || suggestions.message) {
        setError('No properties found for this address');
        return;
      }

      // Get details for the first suggestion
      const propertyResponse = await fetch(`/api/property-details?assessmentNumber=${suggestions[0].PropertyNo}`);
      if (!propertyResponse.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyDetails = await propertyResponse.json();
      setSelectedProperty(propertyDetails);
      setSearchQuery(suggestions[0].Address);
    } catch (error) {
      console.error('Error searching property:', error);
      setError('Failed to search property');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: PropertySuggestion) => {
    setSearchQuery(suggestion.Address);
    setShowSuggestions(false);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/property-details?assessmentNumber=${suggestion.PropertyNo}`);
      if (!response.ok) {
        throw new Error('Failed to fetch property details');
      }
      const propertyDetails = await response.json();
      setSelectedProperty(propertyDetails);
    } catch (error) {
      console.error('Error fetching property details:', error);
      setError('Failed to load property details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!selectedProperty) return;
    setIsContinueLoading(true);

    try {
      // Fetch zones and overlays data
      const [zonesResponse, overlaysResponse] = await Promise.all([
        fetch(`/api/zone?assessmentNumber=${selectedProperty.PropertyNo}`),
        fetch(`/api/overlay?assessmentNumber=${selectedProperty.PropertyNo}`)
      ]);

      if (!zonesResponse.ok || !overlaysResponse.ok) {
        throw new Error('Failed to fetch property details');
      }

      const [zones, overlays] = await Promise.all([
        zonesResponse.json(),
        overlaysResponse.json()
      ]);

      // Ensure overlays and zones are always arrays
      const safeZones = Array.isArray(zones) ? zones : [];
      const safeOverlays = Array.isArray(overlays) ? overlays : [];

      const propertyData = {
        Description: selectedProperty.Description,
        PropertyNo: selectedProperty.PropertyNo,
        Property_ID: selectedProperty.Property_ID,
        StreetNumber: selectedProperty.StreetNumber,
        StreetName: selectedProperty.StreetName,
        Suburb: selectedProperty.Suburb,
        State: selectedProperty.State,
        Postcode: selectedProperty.Postcode,
        PropertyType: selectedProperty.PropertyType,
        Address: selectedProperty.Address,
        LandOwnershipType: selectedProperty.LandOwnershipType,
        CrownAllotmentNo: selectedProperty.CrownAllotmentNo,
        SectionNo: selectedProperty.SectionNo,
        ParishName: selectedProperty.ParishName,
        MunicipalDistrict: selectedProperty.MunicipalDistrict,
        LP_PS: selectedProperty.LP_PS,
        PlanNo: selectedProperty.PlanNo,
        Volume: selectedProperty.Volume,
        Folio: selectedProperty.Folio,
        AreaOfNewBuildingWork: selectedProperty.AreaOfNewBuildingWork,
        Termites: selectedProperty.Termites,
        FloodProne: selectedProperty.FloodProne,
        BushfireProne: selectedProperty.BushfireProne,
        DesignatedLand: selectedProperty.DesignatedLand,
        AlpineArea: selectedProperty.AlpineArea,
        DeclaredRoad: selectedProperty.DeclaredRoad,
        Country: selectedProperty.Country,
        AllotmentArea: selectedProperty.AllotmentArea,
        LotNo: selectedProperty.LotNo,
        PlanningPermitNo: selectedProperty.PlanningPermitNo,
        PlanningPermitDate: selectedProperty.PlanningPermitDate,
        MelwayRef: selectedProperty.MelwayRef,
        BushfireAttackLevel: selectedProperty.BushfireAttackLevel,
        Locality: selectedProperty.Locality,
        County: selectedProperty.County,
        Zonning: selectedProperty.Zonning,
        SmallLot: selectedProperty.SmallLot,
        SiteSlope: selectedProperty.SiteSlope,
        Precinct: selectedProperty.Precinct,
        GFA: selectedProperty.GFA,
        SiteCover: selectedProperty.SiteCover,
        SiteDimensionLength: selectedProperty.SiteDimensionLength,
        Ward: selectedProperty.Ward,
        Storeys: selectedProperty.Storeys,
        SiteDimensionWidth: selectedProperty.SiteDimensionWidth,
        NeighbourhoodPlan: selectedProperty.NeighbourhoodPlan,
        ReferralTriggers: selectedProperty.ReferralTriggers,
        SnowFall: selectedProperty.SnowFall,
        SeweredArea: selectedProperty.SeweredArea,
        StormwaterDischargePoint: selectedProperty.StormwaterDischargePoint,
        UncontrolledOverlandDrainage: selectedProperty.UncontrolledOverlandDrainage,
        Proposed: selectedProperty.Proposed,
        ExistingDwelling: selectedProperty.ExistingDwelling,
        UnitNumber: selectedProperty.UnitNumber,
        DetachedStatus: selectedProperty.DetachedStatus,
        StandardParcelIdentifier: selectedProperty.StandardParcelIdentifier,
        ShopNo: selectedProperty.ShopNo,
        Longitude: selectedProperty.Longitude,
        Latitude: selectedProperty.Latitude,
        ExistingUse: selectedProperty.ExistingUse,
        PropertyCode: selectedProperty.PropertyCode,
        StreetNumber2: selectedProperty.StreetNumber2,
        StreetType: selectedProperty.StreetType,
        ComplexUnitType: selectedProperty.ComplexUnitType,
        ComplexLevelType: selectedProperty.ComplexLevelType,
        ComplexLevelNumber: selectedProperty.ComplexLevelNumber,
        ComplexUnitIdentifier: selectedProperty.ComplexUnitIdentifier,
        WKID: selectedProperty.WKID,
        CadastralID: selectedProperty.CadastralID,
        LotType: selectedProperty.LotType,
        StreetSuffix: selectedProperty.StreetSuffix,
        GurasID: selectedProperty.GurasID,
        PropertySize: selectedProperty.PropertySize
      };

      // Save the search (cookies will be automatically sent)
      const response = await fetch('/api/search/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyData,
          zones: safeZones,
          overlays: safeOverlays
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to continue');
          setIsContinueLoading(false);
          return;
        }
        throw new Error('Failed to save search');
      }

      const { hash } = await response.json();

      // Navigate to property page with only the hashed IDs and property number
      router.push(`/property?p=${selectedProperty.PropertyNo}&h=${hash}`);
    } catch (error) {
      console.error('Error saving search:', error);
      setError('Failed to save search');
      setIsContinueLoading(false);
    }
  };

  return (
    <div className="min-h-screen  bg-gray-50 relative">
      {(isLoading || isContinueLoading) && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {isLoading ? "Searching properties..." : "Loading property details..."}
            </p>
          </div>
        </div>
      )}
      <div className=" mx-auto px-4 py-4">
        <div className="mx-auto">
          <h1 className="text-3xl font-bold mb-4">Find answers for your property</h1>
          <p className="text-gray-600 mb-4">
            Adress Hub's technology is taking the property industry forward with instant analysis for critical planning questions. Try it for free by entering an address below.
          </p>

          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="relative">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Search a property or click one on the map"
                  value={searchQuery}
                  onChange={handleInputChange}
                  className="pr-24 h-12"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                {/* daskdfa */}
                {searchQuery && (
                  <button
                    onClick={() => { 
                      setSearchQuery(''); 
                      setSuggestions([]); 
                      setShowSuggestions(false);
                      setSelectedProperty(null);
                    }}
                    className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                </Button>
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 mt-1 bg-white border rounded shadow z-50 max-h-60 overflow-y-auto"
                  >
                    {suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion.Address}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <Alert variant="destructive" className="mb-8">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {selectedProperty && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="h-[400px] mb-8">
                  <Map
                    center={{ lat: selectedProperty.Latitude, lng: selectedProperty.Longitude }}
                    propertyPfi={selectedProperty.Property_ID}
                    zoom={20}
                    showSearch={false}
                   
                    height="400px"
                    tilt={30}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Property Details</h3>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                    <div>
                      <div className="text-sm text-gray-500">Assessment Number</div>
                      <div className="font-medium">{selectedProperty.PropertyNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Lot Number</div>
                      <div className="font-medium">{selectedProperty.LotNo}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-500">Address</div>
                      <div className="font-medium">{selectedProperty.Address}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Plan Number</div>
                      <div className="font-medium">{selectedProperty.PlanNo}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Area</div>
                      <div className="font-medium">{selectedProperty.AllotmentArea} m²</div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Button 
                      className="w-full" 
                      onClick={handleContinue}
                      disabled={isContinueLoading}
                    >
                      {isContinueLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Continue with Address"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
