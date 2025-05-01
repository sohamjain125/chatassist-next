import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, MapPin, Navigation } from "lucide-react";

interface AddressComponent {
  long_name: string;
  short_name: string;
  types: string[];
}

interface Geometry {
  location: {
    lat: number;
    lng: number;
  };
  location_type: string;
  viewport: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

interface NavigationPoint {
  location: {
    latitude: number;
    longitude: number;
  };
}

interface AddressResult {
  address_components: AddressComponent[];
  formatted_address: string;
  geometry: Geometry;
  navigation_points?: NavigationPoint[];
  place_id: string;
  plus_code?: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
}

interface AddressDetailsProps {
  result: AddressResult;
}

const AddressDetails = ({ result }: AddressDetailsProps) => {
  const getComponent = (type: string) => {
    return result.address_components.find(component => 
      component.types.includes(type)
    )?.long_name;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Property Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Address */}
          <div className="space-y-2">
            <h3 className="font-medium">Full Address</h3>
            <p className="text-sm text-muted-foreground">
              {result.formatted_address}
            </p>
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Location</h3>
              <div className="space-y-1">
                {getComponent('subpremise') && (
                  <p className="text-sm">Unit: {getComponent('subpremise')}</p>
                )}
                {getComponent('street_number') && (
                  <p className="text-sm">Street No: {getComponent('street_number')}</p>
                )}
                <p className="text-sm">Street: {getComponent('route')}</p>
                <p className="text-sm">Area: {getComponent('sublocality_level_1')}</p>
                <p className="text-sm">City: {getComponent('locality')}</p>
                <p className="text-sm">State: {getComponent('administrative_area_level_1')}</p>
                <p className="text-sm">Postal Code: {getComponent('postal_code')}</p>
              </div>
            </div>

            {/* Coordinates */}
            <div className="space-y-2">
              <h3 className="font-medium">Coordinates</h3>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    Lat: {result.geometry.location.lat.toFixed(6)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">
                    Long: {result.geometry.location.lng.toFixed(6)}
                  </p>
                </div>
                {result.plus_code && (
                  <div className="flex items-center gap-2">
                    <Navigation className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      Plus Code: {result.plus_code.compound_code}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddressDetails; 