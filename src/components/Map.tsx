/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState, useCallback } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type GoogleWindow = Window & typeof globalThis & {
  google: any;
  initMap: () => void;
  googleMapsLoaded: boolean;
};

interface Location {
  lat: number;
  lng: number;
}

interface BuildingMeasurement {
  start: Location;
  end: Location;
  length: string;
}

interface BuildingOutline {
  coordinates: Location[];
  measurements: BuildingMeasurement[];
  area: string;
}

interface MapProps {
  center: Location;
  buildingOutline: BuildingOutline; // Made required since we're removing static data
  onBuildingSelect?: (building: BuildingOutline) => void;
}

const Map = ({ center, buildingOutline, onBuildingSelect }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const polygonRef = useRef<google.maps.Polygon | null>(null);
  const measurementLabelsRef = useRef<google.maps.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Google Maps script with necessary libraries
  const loadGoogleMapsScript = useCallback(() => {
    if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,drawing&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    (window as any).initMap = () => {
      (window as GoogleWindow).googleMapsLoaded = true;
    };
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (measurementLabelsRef.current) {
      measurementLabelsRef.current.forEach(label => {
        if (label) {
          google.maps.event.clearInstanceListeners(label);
          label.setMap(null);
        }
      });
      measurementLabelsRef.current = [];
    }

    if (polygonRef.current) {
      google.maps.event.clearInstanceListeners(polygonRef.current);
      polygonRef.current.setMap(null);
      polygonRef.current = null;
    }

    if (mapInstanceRef.current) {
      google.maps.event.clearInstanceListeners(mapInstanceRef.current);
      mapInstanceRef.current = null;
    }
  }, []);

  const initializeMap = useCallback(async () => {
    try {
      if (!mapRef.current) return;

      const mapInstance = new google.maps.Map(mapRef.current, {
        center,
        zoom: 19,
        tilt: 45,
        heading: 45,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: true,
        mapTypeControlOptions: {
          position: google.maps.ControlPosition.TOP_RIGHT,
          style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
          mapTypeIds: [
            google.maps.MapTypeId.ROADMAP,
            google.maps.MapTypeId.SATELLITE,
            google.maps.MapTypeId.HYBRID
          ]
        },
        zoomControl: true,
        zoomControlOptions: {
          position: google.maps.ControlPosition.RIGHT_CENTER,
        },
        streetViewControl: true,
        streetViewControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        fullscreenControl: true,
        fullscreenControlOptions: {
          position: google.maps.ControlPosition.RIGHT_TOP,
        },
        mapId: "8e0a97af9386fef",
        styles: [
          {
            featureType: "all",
            elementType: "labels.text.fill",
            stylers: [{ color: "#000000" }]
          },
          {
            featureType: "all",
            elementType: "labels.text.stroke",
            stylers: [{ color: "#ffffff" }, { weight: 2 }]
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#ffffff" }]
          },
          {
            featureType: "road",
            elementType: "labels.text.fill",
            stylers: [{ color: "#666666" }]
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#e9e9e9" }]
          },
          {
            featureType: "landscape",
            elementType: "geometry",
            stylers: [{ color: "#f5f5f5" }]
          },
          {
            featureType: "poi",
            elementType: "geometry",
            stylers: [{ color: "#eeeeee" }]
          },
          {
            featureType: "transit",
            elementType: "geometry",
            stylers: [{ color: "#f2f2f2" }]
          },
          {
            featureType: "building",
            elementType: "geometry",
            stylers: [
              { color: "#ffffff" },
              { lightness: 10 }
            ]
          },
          {
            featureType: "building",
            elementType: "geometry.fill",
            stylers: [
              { color: "#ffffff" },
              { lightness: 10 }
            ]
          },
          {
            featureType: "building",
            elementType: "geometry.stroke",
            stylers: [
              { color: "#dddddd" },
              { lightness: 5 },
              { weight: 1 }
            ]
          }
        ]
      });

      mapInstanceRef.current = mapInstance;

      const polygon = new google.maps.Polygon({
        paths: buildingOutline.coordinates,
        strokeColor: "#4285F4",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#4285F4",
        fillOpacity: 0.15,
        clickable: true,
        zIndex: 1
      });

      polygon.setMap(mapInstance);
      polygonRef.current = polygon;

      buildingOutline.measurements.forEach((measurement) => {
        new google.maps.Polyline({
          path: [measurement.start, measurement.end],
          geodesic: true,
          strokeColor: "#4285F4",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          map: mapInstance,
          zIndex: 2
        });

        const midpoint = {
          lat: (measurement.start.lat + measurement.end.lat) / 2,
          lng: (measurement.start.lng + measurement.end.lng) / 2,
        };

        const label = new google.maps.Marker({
          position: midpoint,
          map: mapInstance,
          label: {
            text: measurement.length,
            color: "#FFFFFF",
            fontSize: "12px",
            fontWeight: "bold",
            className: "map-measurement-label",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
          },
          clickable: false,
          zIndex: 3
        });

        measurementLabelsRef.current.push(label);
      });

      if (buildingOutline.area) {
        const bounds = new google.maps.LatLngBounds();
        buildingOutline.coordinates.forEach((coord) => bounds.extend(coord));
        const center = bounds.getCenter();

        const areaLabel = new google.maps.Marker({
          position: center,
          map: mapInstance,
          label: {
            text: buildingOutline.area,
            color: "#4285F4",
            fontSize: "14px",
            fontWeight: "500",
          },
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 0,
          },
          clickable: false,
          zIndex: 4
        });

        measurementLabelsRef.current.push(areaLabel);
      }

      if (onBuildingSelect) {
        polygon.addListener("click", () => {
          onBuildingSelect(buildingOutline);
        });
      }

      const bounds = new google.maps.LatLngBounds();
      buildingOutline.coordinates.forEach((coord) => bounds.extend(coord));
      mapInstance.fitBounds(bounds, {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      });

      setTimeout(() => {
        mapInstance.setTilt(45);
        mapInstance.setHeading(45);
      }, 500);

      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error initializing map:", err);
      setError(err instanceof Error ? err.message : "Failed to load map");
      setIsLoading(false);
    }
  }, [center, buildingOutline, onBuildingSelect]);

  useEffect(() => {
    const init = async () => {
      try {
        cleanup();
        await new Promise<void>((resolve, reject) => {
          if ((window as GoogleWindow).google?.maps) {
            resolve();
            return;
          }
          loadGoogleMapsScript();
          const checkGoogleMaps = () => {
            if ((window as GoogleWindow).google?.maps) {
              resolve();
            } else {
              setTimeout(checkGoogleMaps, 100);
            }
          };
          checkGoogleMaps();
          setTimeout(() => reject(new Error("Google Maps loading timeout")), 10000);
        });
        await initializeMap();
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError(err instanceof Error ? err.message : "Failed to load Google Maps");
        setIsLoading(false);
      }
    };

    init();
    return cleanup;
  }, [initializeMap, cleanup, loadGoogleMapsScript]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      <div ref={mapRef} className="absolute inset-0" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 text-center p-6 max-w-sm">
            <AlertCircle className="h-10 w-10 text-destructive" />
            <p className="text-sm font-medium text-muted-foreground">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsLoading(true);
                setError(null);
                initializeMap();
              }}
              className="mt-2"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map; 