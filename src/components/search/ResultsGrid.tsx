import React from 'react';
import { useHits } from 'react-instantsearch-hooks-web';
import CampgroundResultCard from './CampgroundResultCard';
import { AlgoliaCampground } from '../../types/algolia';
import { useSearchParams } from 'react-router-dom';

const ResultsGrid: React.FC = () => {
  const { hits, results } = useHits<AlgoliaCampground>();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  if (!results) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-koaBlue mx-auto mb-4"></div>
          <p className="text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            Loading results...
          </p>
        </div>
      </div>
    );
  }

  if (hits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <svg
          className="w-16 h-16 text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-xl font-sans-semibold mb-2" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
          No results found
        </h3>
        <p className="text-gray-600 font-sans text-center max-w-md" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          Try adjusting your search or filters to find more campgrounds.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Results count */}
      <div className="mb-6">
        <p className="text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          Found <strong>{results.nbHits}</strong> {results.nbHits === 1 ? 'campground' : 'campgrounds'}
          {results.query && ` for "${results.query}"`}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {hits.map((hit) => (
          <CampgroundResultCard key={hit.objectID} hit={hit} isPreview={isPreview} />
        ))}
      </div>
    </div>
  );
};

export default ResultsGrid;
