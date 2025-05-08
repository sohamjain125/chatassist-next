export interface Location {
    lat: number;
    lng: number;
  }
  
  
  
  
  export interface MapProps {
    center?: {
      lat: number;
      lng: number;
    };
    zoom?: number;
    onLocationSelect?: (location: { lat: number; lng: number }) => void;
    onAddressSelect?: (address: string) => void;
    showSearch?: boolean;
    showControls?: boolean;
    className?: string;
    height?: string;
    initialAddress?: string;
    readOnly?: boolean;
    buildingOutline?: {
      coordinates: Array<{lat: number; lng: number}>;
      measurements: Array<{
        start: {lat: number; lng: number};
        end: {lat: number; lng: number};
        length: string;
      }>;
      area: string;
    };
    propertyPfi?: string;
    tilt?: number;
  }
  
  