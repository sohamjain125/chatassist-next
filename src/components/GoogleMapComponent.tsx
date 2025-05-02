import React, { useEffect, useRef } from "react";

interface GoogleMapComponentProps {
  markers?: Array<{
    lat: number;
    lng: number;
    description?: string;
  }>;
  height?: string;
}

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleMapComponent({ markers = [], height = "500px" }: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<any>(null);

  useEffect(() => {
    // Dynamically load Google Maps script if not loaded
    if (!window.google || !window.google.maps) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
      script.async = true;
      script.onload = () => {
        initializeMap();
      };
      document.body.appendChild(script);
    } else {
      initializeMap();
    }
    // eslint-disable-next-line
  }, [markers]);

  function initializeMap() {
    if (mapRef.current && window.google && window.google.maps) {
      const center = markers.length
        ? { lat: markers[0].lat, lng: markers[0].lng }
        : { lat: 37.7749, lng: -122.4194 }; // Default to SF

      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center,
        zoom: markers.length ? 15 : 12,
        disableDefaultUI: false,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        styles: [
          {
            featureType: "all",
            elementType: "geometry",
            stylers: [{ color: "#f3f2ff" }],
          },
          {
            featureType: "poi",
            elementType: "labels.text.fill",
            stylers: [{ color: "#9b87f5" }],
          },
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ color: "#e5deff" }],
          },
          {
            featureType: "water",
            elementType: "geometry",
            stylers: [{ color: "#d3e4fd" }],
          },
        ],
      });

      markers.forEach((marker) => {
        const gMarker = new window.google.maps.Marker({
          position: { lat: marker.lat, lng: marker.lng },
          map: mapInstance.current,
          animation: window.google.maps.Animation.DROP,
        });
        if (marker.description) {
          const infowindow = new window.google.maps.InfoWindow({
            content: `<div class="font-semibold">${marker.description}</div>`,
          });
          gMarker.addListener("click", () => {
            infowindow.open(mapInstance.current, gMarker);
          });
        }
      });
    }
  }

  return (
    <div
      className="rounded-xl overflow-hidden border shadow-xl bg-[linear-gradient(135deg,#f3f2ff_0%,#d3e4fd_100%)] p-1 transition-all"
      style={{ height }}
    >
      <div ref={mapRef} className="w-full" style={{ height: "100%", borderRadius: 14 }} />
    </div>
  );
}
