/**
 * Synchronous PMS data generator
 * Simulates K2 PMS availability data based on campground ID
 * 
 * POC Pattern: This demonstrates how PMS data can be merged with CMS data at runtime.
 * 
 * In production: Replace this function with actual K2 PMS API call
 * Example:
 *   async function getPMSAvailability(campgroundId: string) {
 *     const response = await fetch(`https://k2pms-api.com/availability/${campgroundId}`);
 *     return response.json();
 *   }
 */

export type SiteType = {
  name: string;
  price: number;
  available: boolean;
};

export type PMSAvailabilityData = {
  available: boolean;
  siteTypes: SiteType[];
  checkIn: string;
  checkOut: string;
};

/**
 * Generate PMS availability data synchronously
 * 
 * POC Pattern: Demonstrates runtime merge of CMS data (ways_to_stay) with PMS data generation.
 * - Uses campground ID as seed for deterministic pricing/availability
 * - Uses ways_to_stay from CMS to determine which site types to show
 * 
 * In production: Replace this function with actual K2 PMS API call
 */
export function generatePMSAvailability(
  campgroundId: string,
  waysToStay: Array<{ name: string }> = []
): PMSAvailabilityData {
  // Deterministic seed for consistent results per campground
  const seed = campgroundId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Simple deterministic random function
  const random = (min: number, max: number, seedOffset: number = 0) => {
    const r = Math.sin(seed + seedOffset) * 10000;
    return Math.floor((r - Math.floor(r)) * (max - min + 1)) + min;
  };

  // Generate dates (today and tomorrow)
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Format dates as ISO strings (YYYY-MM-DD)
  const checkIn: string = today.toISOString().split('T')[0] || '';
  const checkOut: string = tomorrow.toISOString().split('T')[0] || '';

  // Use CMS ways_to_stay if available, otherwise fallback to defaults
  const siteTypeNames = waysToStay.length > 0
    ? waysToStay.map(way => way.name)  // Use CMS data - demonstrates merge pattern!
    : [  // Fallback if no ways_to_stay defined in CMS
        'RV Site (Full Hookup)',
        'RV Site (Water & Electric)',
        'Tent Site',
        'Cabin',
        'Glamping Tent',
      ];

  // Generate availability for each way_to_stay from CMS
  // Each site type gets deterministic pricing/availability based on campground ID + index
  const selectedSites: SiteType[] = siteTypeNames.map((siteName, index) => {
    // Use index as seed offset to ensure different pricing per site type
    const price = random(40, 150, index * 100);
    const available = random(0, 100, index * 200) > 30; // 70% chance available
    
    return {
      name: siteName,  // From CMS ways_to_stay!
      price,
      available,
    };
  });

  return {
    available: selectedSites.some(s => s.available),
    siteTypes: selectedSites,
    checkIn,
    checkOut,
  };
}
