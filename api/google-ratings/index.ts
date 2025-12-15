import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Google Ratings API Route
 * 
 * Fetches Google Places API Place Details to get ratings and reviews for a campground.
 * Implements 24-hour in-memory cache to minimize API calls and costs.
 * 
 * Query Parameters:
 * - placeId: Google Place ID (required)
 * 
 * Returns:
 * {
 *   rating: number,
 *   user_ratings_total: number,
 *   reviews: Array<{ author_name: string, text: string, rating: number }>
 * }
 * 
 * Maintenance: Low maintenance (~$3/mo) - 24h cache minimizes API calls, graceful degradation
 */

type RatingData = {
  rating: number;
  user_ratings_total: number;
  reviews: Array<{
    author_name: string;
    text: string;
    rating: number;
  }>;
};

type CacheEntry = {
  data: RatingData;
  timestamp: number;
};

// In-memory cache: Map<placeId, CacheEntry>
// Note: This cache is per serverless function instance, not shared across instances
// For production with many instances, consider using Redis or Vercel KV
const cache = new Map<string, CacheEntry>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Get cached rating data if still valid
 */
function getCachedRating(placeId: string): RatingData | null {
  const cached = cache.get(placeId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  // Remove expired entry
  if (cached) {
    cache.delete(placeId);
  }
  return null;
}

/**
 * Store rating data in cache
 */
function setCachedRating(placeId: string, data: RatingData): void {
  cache.set(placeId, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Fetch rating data from Google Places API
 */
async function fetchRatingFromGoogle(placeId: string): Promise<RatingData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  console.log('[Google Ratings API] Checking API key...', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length || 0,
    apiKeyPrefix: apiKey ? `${apiKey.substring(0, 10)}...` : 'none',
  });
  
  if (!apiKey) {
    console.error('[Google Ratings API] GOOGLE_PLACES_API_KEY environment variable is not set');
    console.error('[Google Ratings API] Available env vars:', Object.keys(process.env).filter(k => k.includes('GOOGLE')));
    return null;
  }

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
    url.searchParams.set('place_id', placeId);
    url.searchParams.set('fields', 'rating,user_ratings_total,reviews');
    url.searchParams.set('key', apiKey);

    console.log('[Google Ratings API] Fetching from Google Places API:', {
      url: url.toString().replace(apiKey, 'REDACTED'),
      placeId,
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('[Google Ratings API] Google API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Google Ratings API] Google Places API HTTP error: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('[Google Ratings API] Google API response:', {
      status: data.status,
      hasResult: !!data.result,
      error_message: data.error_message,
    });

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.error(`[Google Ratings API] Google Places API error status: ${data.status}`, data.error_message);
      return null;
    }

    if (!data.result) {
      console.warn('[Google Ratings API] No result in Google API response');
      return null;
    }

    const result = data.result;
    console.log('[Google Ratings API] Parsed result:', {
      rating: result.rating,
      user_ratings_total: result.user_ratings_total,
      reviewsCount: result.reviews?.length || 0,
    });

    return {
      rating: result.rating || 0,
      user_ratings_total: result.user_ratings_total || 0,
      reviews: (result.reviews || []).slice(0, 5).map((review: any) => ({
        author_name: review.author_name || 'Anonymous',
        text: review.text || '',
        rating: review.rating || 0,
      })),
    };
  } catch (error) {
    console.error('[Google Ratings API] Error fetching from Google Places API:', error);
    if (error instanceof Error) {
      console.error('[Google Ratings API] Error details:', error.message, error.stack);
    }
    return null;
  }
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
) {
  console.log('[Google Ratings API] Request received:', {
    method: request.method,
    url: request.url,
    query: request.query,
  });

  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Only allow GET requests
  if (request.method !== 'GET') {
    console.error('[Google Ratings API] Method not allowed:', request.method);
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { placeId } = request.query;
  console.log('[Google Ratings API] placeId:', placeId);

  // Validate placeId parameter
  if (!placeId || Array.isArray(placeId)) {
    console.error('[Google Ratings API] Invalid placeId:', placeId);
    return response.status(400).json({ 
      error: 'Missing or invalid placeId parameter',
      message: 'Please provide a valid Google Place ID as a query parameter: ?placeId=...'
    });
  }

  // Check cache first
  const cachedData = getCachedRating(placeId);
  if (cachedData) {
    console.log(`[Google Ratings API] Cache hit for placeId: ${placeId}`);
    return response.status(200).json(cachedData);
  }

  // Fetch from Google Places API
  console.log(`[Google Ratings API] Cache miss for placeId: ${placeId}, fetching from Google Places API`);
  const ratingData = await fetchRatingFromGoogle(placeId);

  // Graceful fallback: return null/empty if API fails
  if (!ratingData) {
    // Try to return cached data even if expired (better than nothing)
    const expiredCache = cache.get(placeId);
    if (expiredCache) {
      console.log(`[Google Ratings API] Returning expired cache for placeId: ${placeId}`);
      return response.status(200).json(expiredCache.data);
    }

    // Return empty data structure if no cache and API fails
    console.warn(`[Google Ratings API] No data available for placeId: ${placeId}, returning empty response`);
    return response.status(200).json({
      rating: 0,
      user_ratings_total: 0,
      reviews: [],
    });
  }

  // Store in cache
  setCachedRating(placeId, ratingData);

  return response.status(200).json(ratingData);
}

