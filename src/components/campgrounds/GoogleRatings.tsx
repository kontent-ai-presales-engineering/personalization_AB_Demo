import React from 'react';
import { useQuery } from '@tanstack/react-query';

type GoogleRatingsProps = {
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
 * Google Ratings Component
 * 
 * Displays Google Places API ratings and review count for a campground.
 * Fetches from /api/google-ratings endpoint which implements 24h caching.
 * 
 * Features:
 * - Star rating display
 * - Review count
 * - Loading state
 * - Graceful error handling (hides component if ratings unavailable)
 * 
 * Maintenance: Low maintenance - Component handles errors gracefully, API route has caching
 */
const GoogleRatings: React.FC<GoogleRatingsProps> = ({ placeId, className = '' }) => {
  const { data, isLoading, error } = useQuery<RatingData>({
    queryKey: ['google-ratings', placeId],
    queryFn: async () => {
      const url = `/api/google-ratings?placeId=${encodeURIComponent(placeId)}`;
      console.log('[GoogleRatings] Fetching from:', url);
      const response = await fetch(url);
      console.log('[GoogleRatings] Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleRatings] API error:', response.status, errorText);
        throw new Error(`Failed to fetch ratings: ${response.status}`);
      }
      const json = await response.json();
      console.log('[GoogleRatings] Received data:', json);
      return json;
    },
    enabled: !!placeId,
    staleTime: 1000 * 60 * 60, // Consider data fresh for 1 hour (API route has 24h cache)
    gcTime: 1000 * 60 * 60 * 24, // Keep in cache for 24 hours
    retry: 1, // Retry once on failure
  });

  // Debug logging
  React.useEffect(() => {
    if (!placeId) {
      console.warn('[GoogleRatings] No placeId provided');
    }
    if (error) {
      console.error('[GoogleRatings] Error:', error);
    }
    if (data) {
      console.log('[GoogleRatings] Data received:', data);
      if (data.user_ratings_total === 0) {
        console.warn('[GoogleRatings] No reviews found (user_ratings_total is 0)');
      }
    }
  }, [placeId, error, data]);

  // Don't render if no placeId
  if (!placeId) {
    return null;
  }

  // Show loading state (optional - can remove if you want it hidden)
  if (isLoading) {
    return null; // Hide during loading
  }

  // Show error state for debugging (optional - can remove if you want it hidden)
  if (error) {
    console.error('[GoogleRatings] Error rendering:', error);
    return null; // Hide on error
  }

  // Don't render if no data or no reviews
  if (!data || data.user_ratings_total === 0) {
    return null;
  }

  const rating = data.rating || 0;
  const reviewCount = data.user_ratings_total || 0;

  // Render star rating
  const renderStars = () => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={`full-${i}`} className="text-yellow-400 text-lg">★</span>
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <span className="text-yellow-400 text-lg relative">
            <span className="text-gray-300">★</span>
            <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              ★
            </span>
          </span>
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={`empty-${i}`} className="text-gray-300 text-lg">★</span>
        ))}
      </div>
    );
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {renderStars()}
      <div className="flex flex-col">
        <span className="text-lg font-sans-semibold text-gray-900" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          {reviewCount.toLocaleString()} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>
    </div>
  );
};

export default GoogleRatings;
