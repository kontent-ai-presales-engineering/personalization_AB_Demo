/**
 * Algolia Configuration Test Component
 * 
 * This component can be temporarily added to test Algolia connectivity.
 * Remove this file after testing is complete.
 */

import React, { useState, useEffect } from 'react';
import { testAlgoliaConnection, testAlgoliaSearch } from '../../config/algolia.test';
import { isAlgoliaConfigured } from '../../config/algolia';

const AlgoliaTest: React.FC = () => {
  const [testResult, setTestResult] = useState<{
    configured: boolean;
    connected: boolean;
    indexName: string;
    sampleResults?: number;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);

  useEffect(() => {
    // Run connection test on mount
    handleConnectionTest();
  }, []);

  const handleConnectionTest = async () => {
    setLoading(true);
    const result = await testAlgoliaConnection();
    setTestResult(result);
    setLoading(false);
  };

  const handleSearchTest = async () => {
    if (!isAlgoliaConfigured()) {
      alert('Algolia is not configured. Please set environment variables.');
      return;
    }

    setLoading(true);
    const result = await testAlgoliaSearch(searchQuery);
    setSearchResults(result);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Algolia Configuration Test</h2>

      {/* Connection Test */}
      <div className="mb-8 p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Connection Test</h3>
        <button
          onClick={handleConnectionTest}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Testing...' : 'Test Connection'}
        </button>

        {testResult && (
          <div className="mt-4">
            <div className={`p-4 rounded ${testResult.connected ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className="font-semibold">Configuration Status:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configured: {testResult.configured ? '✅ Yes' : '❌ No'}</li>
                <li>Connected: {testResult.connected ? '✅ Yes' : '❌ No'}</li>
                <li>Index Name: {testResult.indexName}</li>
                {testResult.sampleResults !== undefined && (
                  <li>Total Results in Index: {testResult.sampleResults}</li>
                )}
                {testResult.error && (
                  <li className="text-red-600">Error: {testResult.error}</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Search Test */}
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Search Test</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter search query..."
            className="flex-1 px-4 py-2 border rounded"
          />
          <button
            onClick={handleSearchTest}
            disabled={loading || !isAlgoliaConfigured()}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Test Search
          </button>
        </div>

        {searchResults && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <p className="font-semibold mb-2">Search Results:</p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Query: "{searchResults.query || searchQuery || '(empty)'}"</li>
              <li>Hits Returned: {searchResults.hits?.length || 0}</li>
              <li>Total Hits: {searchResults.nbHits || 0}</li>
              <li>Processing Time: {searchResults.processingTimeMS || 0}ms</li>
            </ul>
            {searchResults.hits && searchResults.hits.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold mb-2">Sample Result:</p>
                <pre className="bg-white p-3 rounded text-xs overflow-auto">
                  {JSON.stringify(searchResults.hits[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Environment Variables Check */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Environment Variables</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>
            VITE_ALGOLIA_APP_ID: {import.meta.env.VITE_ALGOLIA_APP_ID ? '✅ Set' : '❌ Not Set'}
          </li>
          <li>
            VITE_ALGOLIA_SEARCH_KEY: {import.meta.env.VITE_ALGOLIA_SEARCH_KEY ? '✅ Set' : '❌ Not Set'}
          </li>
          <li>
            VITE_ALGOLIA_INDEX_NAME: {import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'campgrounds (default)'}
          </li>
        </ul>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Testing Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Ensure environment variables are set in your .env file</li>
          <li>Click "Test Connection" to verify Algolia connectivity</li>
          <li>Enter a search query and click "Test Search" to verify search functionality</li>
          <li>Check the console for detailed logs (F12 → Console)</li>
          <li>You can also test in browser console: <code>window.testAlgolia.connection()</code></li>
        </ol>
      </div>
    </div>
  );
};

export default AlgoliaTest;

