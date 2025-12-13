import React from 'react';
import { Link } from 'react-router-dom';
import { AlgoliaCampground } from '../../types/algolia';
import { createPreviewLink } from '../../utils/link';

type CampgroundResultCardProps = {
  hit: AlgoliaCampground;
  isPreview?: boolean;
};

const CampgroundResultCard: React.FC<CampgroundResultCardProps> = ({ hit, isPreview = false }) => {
  // Construct campground URL - use objectID or campground_name as slug
  // Note: objectID should match the Kontent.ai codename or URL slug
  const campgroundSlug = hit.objectID;
  const campgroundPath = `/campgrounds/${campgroundSlug}`;

  // Truncate description if too long
  const truncatedDescription = hit.description 
    ? (hit.description.length > 150 ? hit.description.substring(0, 150) + '...' : hit.description)
    : '';

  return (
    <Link
      to={createPreviewLink(campgroundPath, isPreview)}
      className="block bg-white border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden h-full"
      style={{ borderRadius: 0 }}
    >
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="p-6 flex-grow flex flex-col">
          <h3 
            className="text-xl font-sans-semibold text-black mb-2" 
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            {hit.campground_name}
          </h3>
          
          {/* Location */}
          <p 
            className="text-koaGray text-sm mb-2 font-sans flex items-start" 
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          >
            <span className="mr-2">📍</span>
            <span>
              {hit.city && hit.state 
                ? `${hit.city}, ${hit.state}${hit.zip ? ` ${hit.zip}` : ''}`
                : hit.city || hit.state || 'Location not available'}
            </span>
          </p>
          
          {/* Description */}
          {truncatedDescription && (
            <p 
              className="text-koaGray text-sm mb-4 font-sans line-clamp-3 flex-grow" 
              style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
            >
              {truncatedDescription}
            </p>
          )}
          
          {/* Amenities */}
          {hit.amenities && hit.amenities.length > 0 && (
            <div className="mb-3">
              <p 
                className="text-xs font-sans-semibold text-koaGray uppercase mb-1" 
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Amenities
              </p>
              <div className="flex flex-wrap gap-1">
                {hit.amenities.slice(0, 3).map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-black text-xs px-2 py-1 font-sans"
                    style={{ borderRadius: 0, fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                  >
                    {amenity}
                  </span>
                ))}
                {hit.amenities.length > 3 && (
                  <span 
                    className="inline-block text-koaGray text-xs px-2 py-1 font-sans" 
                    style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                  >
                    +{hit.amenities.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Ways to Stay */}
          {hit.ways_to_stay && hit.ways_to_stay.length > 0 && (
            <div className="mb-4">
              <p 
                className="text-xs font-sans-semibold text-koaGray uppercase mb-1" 
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Ways to Stay
              </p>
              <div className="flex flex-wrap gap-1">
                {hit.ways_to_stay.map((way, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-black text-xs px-2 py-1 font-sans"
                    style={{ borderRadius: 0, fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                  >
                    {way}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* CTA */}
          <span 
            className="text-koaBlue font-sans-semibold text-sm uppercase hover:text-koaRed transition-colors inline-flex items-center mt-auto" 
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            Learn More →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default CampgroundResultCard;
