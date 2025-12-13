import React from 'react';
import { InstantSearch } from 'react-instantsearch-hooks-web';
import { searchClient, indexName, isAlgoliaConfigured } from '../config/algolia';
import SearchBox from '../components/search/SearchBox';
import FacetFilters from '../components/search/FacetFilters';
import ResultsGrid from '../components/search/ResultsGrid';
import PageSection from '../components/PageSection';

const SearchPage: React.FC = () => {
  // Note: isPreview could be used for preview mode features if needed

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
            {/* Filters Sidebar */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-8">
                <FacetFilters />
              </div>
            </aside>

            {/* Results Area */}
            <main className="flex-1 min-w-0">
              <ResultsGrid />
            </main>
          </div>
        </InstantSearch>
      </div>
    </PageSection>
  );
};

export default SearchPage;
