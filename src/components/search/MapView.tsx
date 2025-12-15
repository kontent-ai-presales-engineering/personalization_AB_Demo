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

  // Debug logging
  useEffect(() => {
    console.log('[MapView] Component mounted/updated:', {
      hitsCount: hits.length,
      isLoaded,
      loadError: loadError?.message,
      hasMapRef: !!mapRef.current,
      hasGoogleMaps: !!window.google?.maps,
    });
  }, [hits.length, isLoaded, loadError]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    console.log('[MapView] useEffect triggered:', {
      isLoaded,
      hasMapRef: !!mapRef.current,
      hasGoogleMaps: !!window.google?.maps,
      hitsCount: hits.length,
    });

    if (!isLoaded) {
      console.log('[MapView] Maps not loaded yet, waiting...');
      return;
    }

    if (!mapRef.current) {
      console.warn('[MapView] Map container ref is null');
      return;
    }

    if (!window.google?.maps) {
      console.error('[MapView] window.google.maps is not available');
      setMapError('Google Maps API is not available');
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
        console.log('[MapView] Creating new map instance');
        // Calculate center point from all markers
        const avgLat =
          validHits.reduce((sum, hit) => sum + hit.latitude, 0) / validHits.length;
        const avgLng =
          validHits.reduce((sum, hit) => sum + hit.longitude, 0) / validHits.length;

        console.log('[MapView] Map center:', { lat: avgLat, lng: avgLng });

        try {
          if (!mapRef.current) {
            console.error('[MapView] mapRef.current is null when trying to create map');
            setMapError('Map container element not found');
            return;
          }

          console.log('[MapView] Creating map with container:', {
            element: mapRef.current,
            hasParent: !!mapRef.current.parentElement,
            width: mapRef.current.offsetWidth,
            height: mapRef.current.offsetHeight,
          });

          mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: avgLat, lng: avgLng },
            zoom: 6,
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          });
          
          console.log('[MapView] Map instance created successfully:', {
            center: mapInstanceRef.current.getCenter()?.toJSON(),
            zoom: mapInstanceRef.current.getZoom(),
          });
        } catch (mapInitError) {
          console.error('[MapView] Error creating map instance:', mapInitError);
          if (mapInitError instanceof Error) {
            console.error('[MapView] Error stack:', mapInitError.stack);
          }
          setMapError(`Failed to initialize map: ${mapInitError instanceof Error ? mapInitError.message : 'Unknown error'}`);
          return;
        }
      } else {
        console.log('[MapView] Reusing existing map instance');
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

      console.log('[MapView] Created', markersRef.current.length, 'markers');

      // Fit map to show all markers
      if (validHits.length > 1) {
        console.log('[MapView] Fitting bounds for', validHits.length, 'markers');
        // Add padding to bounds (50px on all sides)
        map.fitBounds(bounds, 50);
      } else if (validHits.length === 1) {
        console.log('[MapView] Centering on single marker');
        // If only one marker, center on it with a reasonable zoom
        const singleHit = validHits[0];
        if (singleHit) {
          map.setCenter({
            lat: singleHit.latitude,
            lng: singleHit.longitude,
          });
          map.setZoom(12);
        }
      }

      console.log('[MapView] Map initialization complete');
      setMapError(null);
    } catch (error) {
      console.error('[MapView] Error initializing map:', error);
      if (error instanceof Error) {
        console.error('[MapView] Error details:', error.message, error.stack);
      }
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
    console.log('[MapView] Rendering error state:', { loadError: loadError?.message, mapError });
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
          <div className="mt-4 text-xs text-gray-500">
            <p>Debug info:</p>
            <p>Hits received: {hits.length}</p>
            <p>Maps loaded: {isLoaded ? 'Yes' : 'No'}</p>
            <p>Has map ref: {mapRef.current ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  // Map container
  console.log('[MapView] Rendering map container');
  const validHitsCount = hits.filter(
    (hit) =>
      hit.latitude != null &&
      hit.longitude != null &&
      !isNaN(hit.latitude) &&
      !isNaN(hit.longitude)
  ).length;

  return (
    <div className="w-full h-[600px] border-2 border-gray-300 relative">
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '600px' }} />
      {/* Debug overlay (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-75 text-white text-xs p-2 rounded z-10">
          <div>Hits: {hits.length}</div>
          <div>Valid coords: {validHitsCount}</div>
          <div>Maps loaded: {isLoaded ? 'Yes' : 'No'}</div>
          <div>Has ref: {mapRef.current ? 'Yes' : 'No'}</div>
        </div>
      )}
      {hits.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
          <p className="text-gray-600">No campgrounds to display on map</p>
        </div>
      )}
    </div>
  );
};

export default MapView;

