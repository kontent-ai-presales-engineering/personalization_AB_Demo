// Location utilities for storing and retrieving user location

export type UserLocation = {
  latitude: number;
  longitude: number;
};

const COOKIE_NAME = 'user_location';
const COOKIE_EXPIRY_DAYS = 365; // 1 year

/**
 * Get user location from cookie
 */
export function getUserLocation(): UserLocation | null {
  if (typeof document === 'undefined') return null;
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${COOKIE_NAME}=`));
    
  if (!cookie) return null;
  
  try {
    const cookieParts = cookie.split('=');
    if (cookieParts.length < 2 || !cookieParts[1]) return null;
    const value = decodeURIComponent(cookieParts[1]);
    const parsed = JSON.parse(value) as UserLocation;
    
    // Validate coordinates
    if (
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      parsed.latitude >= -90 &&
      parsed.latitude <= 90 &&
      parsed.longitude >= -180 &&
      parsed.longitude <= 180
    ) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse user location cookie:', error);
    return null;
  }
}

/**
 * Save user location to cookie
 */
export function saveUserLocation(location: UserLocation): void {
  if (typeof document === 'undefined') return;
  
  // Validate coordinates
  if (
    typeof location.latitude !== 'number' ||
    typeof location.longitude !== 'number' ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    location.longitude < -180 ||
    location.longitude > 180
  ) {
    console.error('Invalid location coordinates:', location);
    return;
  }
  
  try {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + COOKIE_EXPIRY_DAYS);
    
    const value = JSON.stringify(location);
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(value)}; expires=${expiry.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    console.error('Failed to save user location:', error);
  }
}

/**
 * Clear user location cookie
 */
export function clearUserLocation(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

/**
 * Get user location using browser geolocation API
 * Returns a promise that resolves with the location or null if denied/error
 */
export function getCurrentLocation(): Promise<UserLocation | null> {
  return new Promise((resolve) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      console.warn('Geolocation is not supported by this browser');
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        resolve(location);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  });
}



