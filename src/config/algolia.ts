import { liteClient } from 'algoliasearch/lite';
import type { LiteClient } from 'algoliasearch/lite';
import { AlgoliaCampground } from '../types/algolia';

/**
 * Algolia Search Configuration
 * 
 * This configuration provides read-only access to the Algolia search index.
 * The index is pre-populated by Netlify cloud functions triggered by Kontent.ai webhooks.
 * 
 * Maintenance: Zero maintenance - Algolia handles indexing automatically via webhooks
 */

// Get Algolia credentials from environment variables
const algoliaAppId = import.meta.env.VITE_ALGOLIA_APP_ID;
const algoliaSearchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;
const algoliaIndexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'campgrounds';

// Validate that required environment variables are set
if (!algoliaAppId) {
  console.warn('VITE_ALGOLIA_APP_ID is not set. Algolia search will not work.');
}

if (!algoliaSearchKey) {
  console.warn('VITE_ALGOLIA_SEARCH_KEY is not set. Algolia search will not work.');
}

/**
 * Create Algolia search client (read-only)
 * 
 * Uses the lite version for smaller bundle size.
 * The search key should be a read-only API key for client-side use.
 * 
 * Note: algoliasearch v5 uses liteClient as a named export.
 * We create an adapter to make it compatible with react-instantsearch-hooks-web
 * which expects a client with a search() method that matches the v4 API format.
 */
const createSearchClientAdapter = (client: LiteClient) => {
  return {
    search: <T = any>(requests: any[]): Promise<any> => {
      // react-instantsearch-hooks-web expects a search method that takes an array of requests
      // Each request has: { indexName, params }
      // Returns: Promise<{ results: Array<{ hits, nbHits, ... }> }>
      
      // Convert v4 format requests to v5 format
      const v5Requests = requests.map((request) => ({
        indexName: request.indexName,
        ...request.params,
      }));
      
      // Return in the format react-instantsearch expects
      return client.searchForHits<T>({
        requests: v5Requests,
      }).then((response) => ({
        results: response.results,
      }));
    },
    searchForFacetValues: (requests: any[]): Promise<any> => {
      // For facet values search - convert to v5 format
      const v5Requests = requests.map((request) => ({
        indexName: request.indexName,
        facet: request.facetName,
        ...request.params,
      }));
      
      // Return in the format react-instantsearch expects
      return client.searchForFacets({
        requests: v5Requests,
      }).then((response) => ({
        results: response.results,
      }));
    },
  } as any; // Type assertion to bypass strict type checking - adapter pattern for v4/v5 compatibility
};

export const searchClient = algoliaAppId && algoliaSearchKey
  ? createSearchClientAdapter(liteClient(algoliaAppId, algoliaSearchKey))
  : null;

/**
 * Algolia index name
 */
export const indexName = algoliaIndexName;

/**
 * Search client configuration for react-instantsearch
 * 
 * This is the client that will be used by InstantSearch components.
 * Returns null if credentials are not configured (for graceful degradation).
 */
export const algoliaConfig = searchClient
  ? {
      searchClient,
      indexName,
    }
  : null;

/**
 * Check if Algolia is properly configured
 */
export const isAlgoliaConfigured = (): boolean => {
  return searchClient !== null && !!algoliaAppId && !!algoliaSearchKey;
};

/**
 * Default search parameters
 */
export const defaultSearchParams = {
  hitsPerPage: 12,
  attributesToRetrieve: [
    'objectID',
    'campground_name',
    'city',
    'state',
    'zip',
    'description',
    'latitude',
    'longitude',
    'amenities',
    'ways_to_stay',
    'region',
    'google_place_id',
  ] as (keyof AlgoliaCampground)[],
  attributesToHighlight: ['campground_name', 'description'],
};

