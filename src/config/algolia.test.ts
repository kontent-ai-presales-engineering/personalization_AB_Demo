/**
 * Test utility for Algolia configuration
 * 
 * This file can be imported and used to test Algolia connectivity.
 * Usage: Import and call testAlgoliaConnection() in a component or console.
 */

import { liteClient } from 'algoliasearch/lite';
import { searchClient, indexName, isAlgoliaConfigured, defaultSearchParams } from './algolia';

// Get credentials for direct client testing
const algoliaAppId = import.meta.env.VITE_ALGOLIA_APP_ID;
const algoliaSearchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;
const testIndexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'campgrounds';

/**
 * Test Algolia connection and configuration
 * 
 * Returns a promise that resolves with test results.
 * Can be called from browser console or a test component.
 */
export async function testAlgoliaConnection(): Promise<{
  configured: boolean;
  connected: boolean;
  indexName: string;
  sampleResults?: number;
  error?: string;
}> {
  // Check if Algolia is configured
  if (!isAlgoliaConfigured()) {
    return {
      configured: false,
      connected: false,
      indexName: indexName,
      error: 'Algolia is not configured. Please set VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_KEY environment variables.',
    };
  }

  if (!searchClient) {
    return {
      configured: false,
      connected: false,
      indexName: indexName,
      error: 'Search client is null. Check environment variables.',
    };
  }

  try {
    // Create a direct client for testing (bypass adapter)
    if (!algoliaAppId || !algoliaSearchKey) {
      throw new Error('Missing credentials');
    }
    
    const directClient = liteClient(algoliaAppId, algoliaSearchKey);
    
    // Perform a simple search to test connection (v5 API)
    const result = await directClient.searchForHits({
      requests: [{
        indexName: testIndexName,
        query: '',
        hitsPerPage: 1,
      }],
    });

    return {
      configured: true,
      connected: true,
      indexName: testIndexName,
      sampleResults: result.results[0]?.nbHits || 0,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      indexName: indexName,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Test Algolia search with a query
 * 
 * Useful for testing search functionality during development.
 */
export async function testAlgoliaSearch(query: string = '') {
  if (!isAlgoliaConfigured() || !searchClient) {
    console.error('Algolia is not configured');
    return null;
  }

  try {
    // Create a direct client for testing (bypass adapter)
    if (!algoliaAppId || !algoliaSearchKey) {
      throw new Error('Missing credentials');
    }
    
    const directClient = liteClient(algoliaAppId, algoliaSearchKey);
    
    // Use v5 API: searchForHits
    // Extract hitsPerPage from defaultSearchParams to avoid duplication
    const { hitsPerPage, ...otherParams } = defaultSearchParams;
    const result = await directClient.searchForHits({
      requests: [{
        indexName: testIndexName,
        query,
        ...otherParams,
        hitsPerPage: 5, // Use fewer results for testing
      }],
    });

    const searchResult = result.results[0];
    
    console.log('Algolia Search Test Results:', {
      query,
      hits: searchResult?.hits?.length || 0,
      totalHits: searchResult?.nbHits || 0,
      processingTime: searchResult?.processingTimeMS || 0,
      sampleHit: searchResult?.hits?.[0],
    });

    return searchResult;
  } catch (error) {
    console.error('Algolia search test failed:', error);
    return null;
  }
}

// Make functions available globally for easy testing in browser console
if (typeof window !== 'undefined') {
  (window as any).testAlgolia = {
    connection: testAlgoliaConnection,
    search: testAlgoliaSearch,
  };
}
