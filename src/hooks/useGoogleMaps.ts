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
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    );
    if (existingScript) {
      // Wait for script to load
      existingScript.addEventListener('load', () => {
        if (window.google && window.google.maps) {
          setIsLoaded(true);
        }
      });
      return;
    }

    // Get API key from environment variable
    // Try VITE_GOOGLE_MAPS_API_KEY first, fallback to VITE_GOOGLE_PLACES_API_KEY (same key can be used for both)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      setLoadError(
        new Error(
          'Google Maps API key not found. Please set VITE_GOOGLE_MAPS_API_KEY or VITE_GOOGLE_PLACES_API_KEY in your .env file.'
        )
      );
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    // Handle successful load
    script.onload = () => {
      if (window.google && window.google.maps) {
        setIsLoaded(true);
      } else {
        setLoadError(new Error('Google Maps API loaded but google.maps is not available'));
      }
    };

    // Handle load error
    script.onerror = () => {
      setLoadError(new Error('Failed to load Google Maps JavaScript API'));
    };

    // Append script to document
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
