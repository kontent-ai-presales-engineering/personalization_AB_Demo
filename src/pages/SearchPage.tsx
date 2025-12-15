import React, { useState } from 'react';
import { InstantSearch } from 'react-instantsearch-hooks-web';
import { useSearchParams } from 'react-router-dom';
import { searchClient, indexName, isAlgoliaConfigured } from '../config/algolia';
import SearchBox from '../components/search/SearchBox';
import FacetFilters from '../components/search/FacetFilters';
import SearchResults from '../components/search/SearchResults';
import PageSection from '../components/PageSection';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  
  // View mode state: 'list' or 'map'
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Check if Algolia is configured
  if (!isAlgoliaConfigured() || !searchClient) {
    return (
      <PageSection color="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-sans-semibold mb-4" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
              Search Unavailable
            </h1>
            <p className="text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              Algolia search is not configured. Please set VITE_ALGOLIA_APP_ID and VITE_ALGOLIA_SEARCH_KEY environment variables.
            </p>
          </div>
        </div>
      </PageSection>
    );
  }

  return (
    <PageSection color="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 
            className="text-4xl font-sans-semibold mb-4" 
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            Find Your Perfect Campground
          </h1>
          <p 
            className="text-lg text-gray-600 font-sans" 
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          >
            Search by location, amenities, or ways to stay
          </p>
        </div>

        {/* InstantSearch Provider */}
        <InstantSearch searchClient={searchClient} indexName={indexName}>
          {/* Search Box */}
          <div className="mb-8">
            <SearchBox />
          </div>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar - Hidden in map view */}
            {viewMode === 'list' && (
              <aside className="lg:w-64 flex-shrink-0">
                <div className="sticky top-8">
                  <FacetFilters />
                </div>
              </aside>
            )}

            {/* Results Area */}
            <main className="flex-1 min-w-0">
              {/* View Toggle */}
              <div className="flex justify-end mb-4">
                <div className="inline-flex rounded-md shadow-sm" role="group">
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 text-sm font-sans-semibold border ${
                      viewMode === 'list'
                        ? 'bg-koaBlue text-white border-koaBlue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } rounded-l-lg transition-colors`}
                    style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
                  >
                    <span className="mr-2">📋</span>
                    List View
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('map')}
                    className={`px-4 py-2 text-sm font-sans-semibold border ${
                      viewMode === 'map'
                        ? 'bg-koaBlue text-white border-koaBlue'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    } rounded-r-lg transition-colors`}
                    style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
                  >
                    <span className="mr-2">🗺️</span>
                    Map View
                  </button>
                </div>
              </div>

              {/* Results or Map */}
              <SearchResults viewMode={viewMode} isPreview={isPreview} />
            </main>
          </div>
        </InstantSearch>
      </div>
    </PageSection>
  );
};

export default SearchPage;

