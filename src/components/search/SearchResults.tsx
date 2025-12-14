import React from 'react';
import { useHits } from 'react-instantsearch-hooks-web';
import { AlgoliaCampground } from '../../types/algolia';
import ResultsGrid from './ResultsGrid';
import MapView from './MapView';

type SearchResultsProps = {
  viewMode: 'list' | 'map';
  isPreview?: boolean;
};

/**
 * Search Results Component
 * 
 * Wrapper component that provides hits data to both ResultsGrid and MapView.
 * Uses useHits hook to get Algolia search results.
 */
const SearchResults: React.FC<SearchResultsProps> = ({ viewMode, isPreview = false }) => {
  const { hits } = useHits<AlgoliaCampground>();

  if (viewMode === 'map') {
    return <MapView hits={hits} isPreview={isPreview} />;
  }

  return <ResultsGrid />;
};

export default SearchResults;
