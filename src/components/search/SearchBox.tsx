import React from 'react';
import { useSearchBox } from 'react-instantsearch-hooks-web';

const SearchBox: React.FC = () => {
  const { query, refine } = useSearchBox();

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => refine(e.target.value)}
          placeholder="Search campgrounds by name, location, or amenities..."
          className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-koaBlue focus:border-transparent font-sans text-lg"
          style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          aria-label="Search campgrounds"
        />
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <svg
            className="w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        {query && (
          <button
            onClick={() => refine('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBox;

