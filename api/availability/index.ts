import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Mock K2 PMS Availability API Route
 * 
 * Simulates a K2 PMS API endpoint for checking campground availability.
 * Returns mock availability data with realistic site types and pricing.
 * 
 * Query Parameters:
 * - campgroundId: Kontent.ai codename or ID (required)
 * - checkIn: ISO date string (required) - Check-in date
 * - checkOut: ISO date string (optional) - Check-out date (defaults to checkIn + 1 day)
 * 
 * Returns:
 * {
 *   available: boolean,
 *   siteTypes: Array<{
 *     name: string,
 *     price: number,
 *     available: boolean
 *   }>,
 *   checkIn: string,
 *   checkOut: string
 * }
 * 
 * TODO: Replace with real K2 API when credentials available
 * Expected K2 API endpoint: [TBD]
 * Expected request format: [TBD]
 * Expected response format: [TBD]
 * 
 * Maintenance: Bounded maintenance - Partner swaps mock for real API when ready
 */

type SiteType = {
  name: string;
  price: number;
  available: boolean;
};

type AvailabilityResponse = {
  available: boolean;
  siteTypes: SiteType[];
  checkIn: string;
  checkOut: string;
};

/**
 * Simulate API latency (200ms)
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate mock site types with realistic data
 */
function generateMockSiteTypes(campgroundId: string): SiteType[] {
  // Use campgroundId as seed for consistent mock data
  const seed = campgroundId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const r = Math.sin(seed) * 10000;
    return Math.floor((r - Math.floor(r)) * (max - min + 1)) + min;
  };

  const siteTypeTemplates = [
    'RV Site (Full Hookup)',
    'RV Site (Water & Electric)',
    'Tent Site',
    'Cabin',
    'Glamping Tent',
    'RV Site (Electric Only)',
    'Primitive Camping',
  ];

  // Select 3-5 random site types
  const numSites = random(3, 5);
  const selectedTypes: SiteType[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < numSites; i++) {
    let index;
    do {
      index = random(0, siteTypeTemplates.length - 1);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    
    const basePrice = random(30, 150);
    const available = Math.random() > 0.3; // 70% chance available
    
    selectedTypes.push({
      name: siteTypeTemplates[index],
      price: basePrice,
      available,
    });
  }

  return selectedTypes;
}

/**
 * Validate date string
 */
function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow GET requests
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { campgroundId, checkIn, checkOut } = request.query;

  // Validate campgroundId
  if (!campgroundId || Array.isArray(campgroundId)) {
    return response.status(400).json({
      error: 'Missing or invalid campgroundId parameter',
      message: 'Please provide a valid campground ID as a query parameter: ?campgroundId=...',
    });
  }

  // Validate checkIn date
  if (!checkIn || Array.isArray(checkIn)) {
    return response.status(400).json({
      error: 'Missing or invalid checkIn parameter',
      message: 'Please provide a valid check-in date as ISO string: ?checkIn=2024-01-15',
    });
  }

  if (!isValidDate(checkIn as string)) {
    return response.status(400).json({
      error: 'Invalid checkIn date format',
      message: 'Please provide checkIn as ISO date string (e.g., 2024-01-15)',
    });
  }

  // Parse dates
  const checkInDate = new Date(checkIn as string);
  const checkOutDate = checkOut && !Array.isArray(checkOut) && isValidDate(checkOut)
    ? new Date(checkOut as string)
    : new Date(checkInDate.getTime() + 24 * 60 * 60 * 1000); // Default: checkIn + 1 day

  // Validate check-out is after check-in
  if (checkOutDate <= checkInDate) {
    return response.status(400).json({
      error: 'Invalid date range',
      message: 'Check-out date must be after check-in date',
    });
  }

  // Simulate 200ms API latency
  await delay(200);

  // Generate mock site types
  const siteTypes = generateMockSiteTypes(campgroundId);

  // Determine overall availability (true if at least one site type is available)
  const available = siteTypes.some(site => site.available);

  const mockResponse: AvailabilityResponse = {
    available,
    siteTypes,
    checkIn: checkInDate.toISOString().split('T')[0], // Return as YYYY-MM-DD
    checkOut: checkOutDate.toISOString().split('T')[0],
  };

  return response.status(200).json(mockResponse);
}
