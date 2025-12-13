import React, { useState } from 'react';
import { useRefinementList } from 'react-instantsearch-hooks-web';

type FacetFilterProps = {
  attribute: string;
  title: string;
  searchable?: boolean;
};

const FacetFilter: React.FC<FacetFilterProps> = ({ attribute, title, searchable = false }) => {
  const { items, refine, searchForItems } = useRefinementList({
    attribute,
    searchable,
  });
  const [isOpen, setIsOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (searchable) {
      searchForItems(value);
    }
  };

  // Filter items based on search query if not using searchable refinement
  const filteredItems = searchable
    ? items
    : items.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className="mb-6 border-b border-gray-200 pb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between mb-3 font-sans-semibold text-lg"
        style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
      >
        <span>{title}</span>
        <svg
          className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Search input for filterable facets */}
          {(searchable || items.length > 10) && (
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder={`Search ${title.toLowerCase()}...`}
              className="w-full px-3 py-2 mb-3 border border-gray-300 rounded text-sm font-sans"
              style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
            />
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredItems.length === 0 ? (
              <p className="text-sm text-gray-500 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
                No options available
              </p>
            ) : (
              filteredItems.map((item) => (
                <label
                  key={item.label}
                  className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => refine(item.value)}
                    className="mr-2 w-4 h-4 text-koaBlue focus:ring-koaBlue border-gray-300 rounded"
                  />
                  <span className="text-sm font-sans flex-1" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
                    {item.label}
                  </span>
                  <span className="text-xs text-gray-500 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
                    ({item.count})
                  </span>
                </label>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};

const FacetFilters: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-sans-semibold mb-6" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
        Filter Results
      </h2>
      
      <FacetFilter attribute="state" title="State" searchable={true} />
      <FacetFilter attribute="city" title="City" searchable={true} />
      <FacetFilter attribute="amenities" title="Amenities" />
      <FacetFilter attribute="ways_to_stay" title="Ways to Stay" />
      <FacetFilter attribute="region" title="Region" />
    </div>
  );
};

export default FacetFilters;
