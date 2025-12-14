import React, { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '../../hooks/useGoogleMaps';
import { AlgoliaCampground } from '../../types/algolia';
import { createPreviewLink } from '../../utils/link';

type MapViewProps = {
  hits: AlgoliaCampground[];
  isPreview?: boolean;
};

/**
 * Map View Component
 * 
 * Displays Google Maps with markers for each campground search result.
 * Features:
 * - Creates markers from Algolia lat/long coordinates
 * - Info windows with campground preview on marker click
 * - Auto-fits bounds to show all markers
 * - Handles missing coordinates gracefully
 * 
 * Maintenance: Low maintenance - Google Maps handles rendering, markers update with search results
 */
const MapView: React.FC<MapViewProps> = ({ hits, isPreview = false }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowsRef = useRef<google.maps.InfoWindow[]>([]);
  const { isLoaded, loadError } = useGoogleMaps();
  const [mapError, setMapError] = useState<string | null>(null);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google?.maps) {
      return;
    }

    try {
      // Filter hits with valid coordinates
      const validHits = hits.filter(
        (hit) =>
          hit.latitude != null &&
          hit.longitude != null &&
          !isNaN(hit.latitude) &&
          !isNaN(hit.longitude)
      );

      if (validHits.length === 0) {
        setMapError('No campgrounds with valid coordinates to display');
        return;
      }

      // Initialize map
      if (!mapInstanceRef.current) {
        // Calculate center point from all markers
        const avgLat =
          validHits.reduce((sum, hit) => sum + hit.latitude, 0) / validHits.length;
        const avgLng =
          validHits.reduce((sum, hit) => sum + hit.longitude, 0) / validHits.length;

        mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
          center: { lat: avgLat, lng: avgLng },
          zoom: 6,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        });
      }

      const map = mapInstanceRef.current;

      // Clear existing markers and info windows
      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.forEach((infoWindow) => infoWindow.close());
      markersRef.current = [];
      infoWindowsRef.current = [];

      // Create markers and info windows for each campground
      const bounds = new window.google.maps.LatLngBounds();

      validHits.forEach((hit) => {
        const position = {
          lat: hit.latitude,
          lng: hit.longitude,
        };

        // Create marker
        const marker = new window.google.maps.Marker({
          position,
          map,
          title: hit.campground_name,
        });

        // Construct campground URL
        let campgroundSlug: string;
        if (hit.slug) {
          let normalized = hit.slug.startsWith('/') ? hit.slug.slice(1) : hit.slug;
          normalized = normalized.replace(/^campgrounds\//, '');
          campgroundSlug = normalized;
        } else {
          campgroundSlug = hit.objectID;
        }
        const campgroundPath = `/campgrounds/${campgroundSlug}`;
        const detailUrl = createPreviewLink(campgroundPath, isPreview);

        // Create info window content
        const infoContent = `
          <div style="padding: 8px; min-width: 200px; font-family: 'Gibson Regular', Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; font-family: 'Gibson SemiBold', Arial, sans-serif;">
              ${hit.campground_name}
            </h3>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">
              ${hit.city && hit.state ? `${hit.city}, ${hit.state}` : 'Location not available'}
            </p>
            <a 
              href="${detailUrl}" 
              style="color: #0066cc; text-decoration: none; font-size: 14px; font-weight: 600;"
              onmouseover="this.style.textDecoration='underline'"
              onmouseout="this.style.textDecoration='none'"
            >
              View Details →
            </a>
          </div>
        `;

        const infoWindow = new window.google.maps.InfoWindow({
          content: infoContent,
        });

        // Add click listener to marker
        marker.addListener('click', () => {
          // Close all other info windows
          infoWindowsRef.current.forEach((iw) => iw.close());
          // Open this info window
          infoWindow.open(map, marker);
        });

        markersRef.current.push(marker);
        infoWindowsRef.current.push(infoWindow);
        bounds.extend(position);
      });

      // Fit map to show all markers
      if (validHits.length > 1) {
        map.fitBounds(bounds);
        // Add padding to bounds
        const padding = 50;
        map.fitBounds(bounds, { padding });
      } else if (validHits.length === 1) {
        // If only one marker, center on it with a reasonable zoom
        map.setCenter({
          lat: validHits[0].latitude,
          lng: validHits[0].longitude,
        });
        map.setZoom(12);
      }

      setMapError(null);
    } catch (error) {
      console.error('[MapView] Error initializing map:', error);
      setMapError(
        error instanceof Error ? error.message : 'Failed to initialize map'
      );
    }
  }, [isLoaded, hits, isPreview]);

  // Loading state
  if (!isLoaded) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-koaBlue mx-auto mb-4"></div>
          <p
            className="text-gray-600 font-sans"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          >
            Loading map...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError || mapError) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center bg-gray-100 border-2 border-gray-300">
        <div className="text-center p-6">
          <p
            className="text-red-600 font-sans mb-2"
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            {loadError ? 'Failed to load Google Maps' : 'Map Error'}
          </p>
          <p
            className="text-gray-600 font-sans text-sm"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          >
            {loadError?.message || mapError || 'Unable to display map'}
          </p>
          {loadError?.message.includes('API key') && (
            <p
              className="text-gray-500 font-sans text-xs mt-2"
              style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
            >
              Please add VITE_GOOGLE_MAPS_API_KEY or VITE_GOOGLE_PLACES_API_KEY to your environment variables.
            </p>
          )}
        </div>
      </div>
    );
  }

  // Map container
  return (
    <div className="w-full h-[600px] border-2 border-gray-300">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default MapView;
