import React from 'react';
import { useQuery } from '@tanstack/react-query';

type AvailabilityCheckerProps = {
  campgroundId: string;
  className?: string;
};

type SiteType = {
  name: string;
  price: number;
  available: boolean;
};

type AvailabilityData = {
  available: boolean;
  siteTypes: SiteType[];
  checkIn: string;
  checkOut: string;
};

/**
 * Availability Checker Component
 * 
 * Automatically fetches and displays campground availability.
 * Fetches from /api/availability endpoint which simulates K2 PMS API.
 * 
 * Features:
 * - Automatically fetches availability on mount
 * - Display site types with pricing
 * - Availability status badges
 * - Disclaimer about simulated data
 * - Loading and error states
 * 
 * Maintenance: Bounded maintenance - Component ready for real API swap
 */
const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({ 
  campgroundId, 
  className = '' 
}) => {
  // Use default dates (today + tomorrow) for automatic fetch
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data, isLoading, error } = useQuery<AvailabilityData>({
    queryKey: ['availability', campgroundId, today, tomorrow],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('campgroundId', campgroundId);
      params.append('checkIn', today);
      params.append('checkOut', tomorrow);
      const url = `/api/availability?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to fetch availability: ${response.status} ${errorText}`);
      }
      
      return response.json();
    },
    enabled: !!campgroundId,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1,
  });


  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={className}>
      <h2
        className="text-2xl font-sans-semibold text-gray-900 mb-4"
        style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
      >
        Availability
      </h2>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-koaGreen"></div>
          <p className="mt-2 text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            Loading availability...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            Unable to load availability at this time. Please try again later.
          </p>
        </div>
      )}

      {/* Results */}
      {data && !isLoading && (
        <div className="space-y-4">
          {/* Overall Availability Status */}
          <div className={`p-4 rounded-md mb-4 ${data.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-sans-semibold ${data.available ? 'text-green-800' : 'text-red-800'}`} style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
              {data.available ? '✓ Availability Found' : '✗ No Availability'}
            </p>
            <p className="text-sm text-gray-600 mt-1 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              Next available: {new Date(data.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - {new Date(data.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Site Types */}
          {data.siteTypes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-sans-semibold text-gray-900" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                Available Sites
              </h3>
              {data.siteTypes.map((site, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-sans-semibold text-gray-900" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                      {site.name}
                    </p>
                    <p className="text-lg font-sans-semibold text-koaGreen mt-1" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                      {formatCurrency(site.price)}/night
                    </p>
                  </div>
                  <div>
                    {site.available ? (
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-sans-semibold" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                        Available
                      </span>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-sans-semibold" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                        Unavailable
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              <strong>Note:</strong> This is simulated data. K2 PMS integration is pending.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailabilityChecker;

