import { useRef, useState, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapComponentProps {
  address?: string;
  markers?: Array<{
    lat: number;
    lng: number;
    description?: string;
  }>;
}

export default function MapComponent({ address, markers = [] }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [showTokenInput, setShowTokenInput] = useState(true);
  
  // Default location (San Francisco)
  const [lng] = useState(-122.4194);
  const [lat] = useState(37.7749);
  const [zoom] = useState(12);

  useEffect(() => {
    const storedToken = localStorage.getItem('mapboxToken');
    if (storedToken) {
      setMapboxToken(storedToken);
      setShowTokenInput(false);
    }
  }, []);
  
  useEffect(() => {
    if (!mapboxToken || !mapContainer.current || map.current) return;
    
    // Initialize map
    mapboxgl.accessToken = mapboxToken;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    // Add navigation controls (zoom in/out buttons)
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [lng, lat, zoom, mapboxToken]);

  // Handle markers
  useEffect(() => {
    if (!map.current || !mapLoaded || markers.length === 0) return;
    
    // Clear existing markers
    const existingMarkers = document.querySelectorAll('.mapboxgl-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Add markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/marker.png)';
      el.style.backgroundSize = 'cover';
      
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(marker.description || 'Location');
      
      if (map.current) {
        new mapboxgl.Marker(el)
          .setLngLat([marker.lng, marker.lat])
          .setPopup(popup)
          .addTo(map.current);
      }
    });
    
    // Center map on first marker
    if (markers.length > 0) {
      map.current.flyTo({
        center: [markers[0].lng, markers[0].lat],
        zoom: 14,
        essential: true
      });
    }
  }, [markers, mapLoaded]);
  
  // Save token to localStorage
  const handleSaveToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken) {
      localStorage.setItem('mapboxToken', mapboxToken);
      setShowTokenInput(false);
    }
  };

  if (showTokenInput) {
    return (
      <div className="rounded-lg bg-muted/20 p-6 flex flex-col items-center justify-center min-h-[400px] border border-dashed">
        <div className="max-w-md w-full">
          <div className="mb-6 text-center">
            <h3 className="text-lg font-semibold">Mapbox API Token Required</h3>
            <p className="text-sm text-muted-foreground mt-1">
              To display maps, please enter your Mapbox public token
            </p>
          </div>
          <form onSubmit={handleSaveToken} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter your Mapbox token"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Get your free token at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">mapbox.com</a>
              </p>
            </div>
            <Button type="submit" className="w-full">
              Save Token & Load Map
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-lg border h-[500px]">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

// Required to import Input and Button components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
