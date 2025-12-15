import React from 'react';
import { useQuery } from '@tanstack/react-query';

type GoogleRatingsCompactProps = {
  placeId: string;
  className?: string;
};

type RatingData = {
  rating: number;
  user_ratings_total: number;
  reviews: Array<{
    author_name: string;
    text: string;
    rating: number;
  }>;
};

/**
 * Google Ratings Compact Component (for search listings)
 * 
 * Displays a compact star rating and review count for search result cards.
 * Fetches from /api/google-ratings endpoint which implements 24h caching.
 * 
 * Features:
 * - Compact star rating display (smaller stars)
 * - Review count
 * - Graceful error handling (hides if ratings unavailable)
 * - Uses React Query caching to avoid duplicate requests
 * 
 * Maintenance: Low maintenance - Component handles errors gracefully, API route has caching
 */
const GoogleRatingsCompact: React.FC<GoogleRatingsCompactProps> = ({ placeId, className = '' }) => {
  const { data, isLoading, error } = useQuery<RatingData>({
    queryKey: ['google-ratings', placeId],
    queryFn: async () => {
      const url = `/api/google-ratings?placeId=${encodeURIComponent(placeId)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch ratings: ${response.status}`);
      }
      return response.json();
    },
    enabled: !!placeId,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour (API route has 24h cache)
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1, // Retry once on failure
  });

  // Don't render if no placeId, loading, error, or no data
  if (!placeId || isLoading || error || !data || data.user_ratings_total === 0) {
    return null;
  }

  const rating = data.rating || 0;
  const reviewCount = data.user_ratings_total || 0;

  // Render compact star rating (smaller stars for cards)
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-sm">★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span className="text-yellow-400 text-sm relative">
            <span className="text-gray-300">★</span>
            <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              ★
            </span>
          </span>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-sm">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {renderStars()}
      <div className="flex items-center gap-1">
        <span 
          className="text-sm font-sans-semibold text-gray-900" 
          style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
        >
          {rating.toFixed(1)}
        </span>
        <span 
          className="text-xs text-gray-600 font-sans" 
          style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
        >
          ({reviewCount.toLocaleString()})
        </span>
      </div>
    </div>
  );
};

export default GoogleRatingsCompact;

