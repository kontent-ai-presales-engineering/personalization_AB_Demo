import { useEffect, useState } from 'react';

/**
 * Hook to load and check if Google Maps JavaScript API is available
 * 
 * Dynamically loads the Google Maps script if not already loaded.
 * Returns loading state and error state.
 * 
 * Usage:
 * ```tsx
 * const { isLoaded, loadError } = useGoogleMaps();
 * if (loadError) return <div>Error loading maps</div>;
 * if (!isLoaded) return <div>Loading maps...</div>;
 * return <MapComponent />;
 * ```
 */
export const useGoogleMaps = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('[useGoogleMaps] Hook initialized');
    
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      console.log('[useGoogleMaps] Google Maps already loaded');
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      console.log('[useGoogleMaps] Script already exists, waiting for load');
      // Wait for script to load
      existingScript.addEventListener('load', () => {
        console.log('[useGoogleMaps] Existing script loaded');
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        } else {
          setLoadError(new Error('Script loaded but google.maps not available'));
        }
      });
      return;
    }

    // Get API key from environment variable
    // Note: This key will be exposed in the client-side bundle (this is expected and normal for Maps JavaScript API)
    // Security comes from HTTP referrer restrictions and API restrictions in Google Cloud Console
    // Try VITE_GOOGLE_MAPS_API_KEY first, fallback to VITE_GOOGLE_PLACES_API_KEY (same key can be used for both)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    console.log('[useGoogleMaps] API key check:', {
      hasVITE_GOOGLE_MAPS_API_KEY: !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      hasVITE_GOOGLE_PLACES_API_KEY: !!import.meta.env.VITE_GOOGLE_PLACES_API_KEY,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey?.length || 0,
    });

    if (!apiKey) {
      const error = new Error(
        'Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY or VITE_GOOGLE_PLACES_API_KEY in your .env file.'
      );
      console.error('[useGoogleMaps]', error.message);
      setLoadError(error);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.src = scriptUrl;
    script.async = true;
    script.defer = true;

    console.log('[useGoogleMaps] Creating script tag:', scriptUrl.replace(apiKey, 'REDACTED'));

    // Handle successful load
    script.onload = () => {
      console.log('[useGoogleMaps] Script loaded successfully');
      if (window.google && window.google.maps) {
        console.log('[useGoogleMaps] google.maps is available');
        setIsLoaded(true);
      } else {
        const error = new Error('Google Maps API loaded but google.maps is not available');
        console.error('[useGoogleMaps]', error.message);
        setLoadError(error);
      }
    };

    // Handle load error
    script.onerror = (error) => {
      const errorMsg = 'Failed to load Google Maps JavaScript API';
      console.error('[useGoogleMaps]', errorMsg, error);
      setLoadError(new Error(errorMsg));
    };

    // Append script to document
    console.log('[useGoogleMaps] Appending script to document.head');
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove script on unmount - it might be used by other components
      // The script will remain in the DOM for reuse
    };
  }, []);

  return { isLoaded, loadError };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: {
      maps: typeof google.maps;
    };
  }
}

