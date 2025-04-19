import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface MapProps {
  latitude?: string;
  longitude?: string;
  selectable?: boolean;
  onLocationSelect?: (lat: string, lng: string) => void;
  markers?: Array<{ lat: string, lng: string, color?: string }>;
  height?: string;
}

// Using Leaflet for maps
export function Map({ 
  latitude = "40.7128", 
  longitude = "-74.0060", 
  selectable = false,
  onLocationSelect,
  markers = [],
  height = "300px"
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState<any>(null);
  
  // Load Leaflet scripts
  useEffect(() => {
    // Only load if they're not already loaded
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => setIsLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsLoaded(true);
    }
    
    return () => {
      if (mapInstance) {
        mapInstance.remove();
      }
    };
  }, []);
  
  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (isLoaded && mapRef.current && !mapInstance) {
      const L = window.L;
      const map = L.map(mapRef.current).setView([parseFloat(latitude), parseFloat(longitude)], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      // Add main marker
      const mainMarker = L.marker([parseFloat(latitude), parseFloat(longitude)], {
        draggable: selectable
      }).addTo(map);
      
      // Handle selectable map
      if (selectable && onLocationSelect) {
        mainMarker.on('dragend', function(e) {
          const position = mainMarker.getLatLng();
          onLocationSelect(position.lat.toString(), position.lng.toString());
        });
        
        map.on('click', function(e) {
          const clickPosition = e.latlng;
          mainMarker.setLatLng(clickPosition);
          onLocationSelect(clickPosition.lat.toString(), clickPosition.lng.toString());
        });
      }
      
      // Add additional markers
      markers.forEach(marker => {
        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div style="background-color: ${marker.color || '#3B82F6'}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        
        L.marker([parseFloat(marker.lat), parseFloat(marker.lng)], { icon }).addTo(map);
      });
      
      setMapInstance(map);
    }
  }, [isLoaded, latitude, longitude, selectable, onLocationSelect, markers]);
  
  return (
    <div className="relative w-full rounded-lg overflow-hidden" style={{ height }}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
      <div ref={mapRef} className="h-full w-full"></div>
    </div>
  );
}

// Need to extend the window type to include Leaflet
declare global {
  interface Window { 
    L: any;
  }
}
