/**
 * TypeScript types for Algolia search index structure
 * 
 * These types match the structure of campground records in the Algolia index.
 * The index is pre-populated by Netlify cloud functions triggered by Kontent.ai webhooks.
 */

/**
 * Algolia campground search result
 * 
 * Fields available in Algolia index:
 * - objectID: string (Kontent.ai codename)
 * - slug: string (URL slug from campground.url element)
 * - campground_name: string
 * - city: string
 * - state: string
 * - zip: string
 * - description: string
 * - latitude: number
 * - longitude: number
 * - amenities: string[] (array of amenity names)
 * - ways_to_stay: string[] (array of ways to stay names)
 * - region: string
 * - google_place_id: string (optional)
 */
export interface AlgoliaCampground {
  objectID: string;
  slug?: string; // URL slug from campground.url element
  campground_name: string;
  city: string;
  state: string;
  zip?: string;
  description?: string;
  latitude: number;
  longitude: number;
  amenities: string[];
  ways_to_stay: string[];
  region: string;
  google_place_id?: string;
  // Index signature to satisfy BaseHit constraint
  [key: string]: any;
}

/**
 * Algolia search response metadata
 */
export interface AlgoliaSearchMetadata {
  query: string;
  processingTimeMS: number;
  nbHits: number;
  nbPages: number;
  page: number;
  hitsPerPage: number;
}

/**
 * Facet value for filtering
 */
export interface AlgoliaFacet {
  value: string;
  count: number;
  highlighted?: string;
}

/**
 * Search state for URL synchronization
 */
export interface SearchState {
  query?: string;
  state?: string[];
  city?: string[];
  amenities?: string[];
  ways_to_stay?: string[];
  region?: string[];
  page?: number;
}
