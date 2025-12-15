import React, { useState } from 'react';
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
 * Allows users to check campground availability for specific dates.
 * Fetches from /api/availability endpoint which simulates K2 PMS API.
 * 
 * Features:
 * - Date inputs for check-in and check-out
 * - "Check Availability" button
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
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [shouldFetch, setShouldFetch] = useState(false);

  const { data, isLoading, error, refetch } = useQuery<AvailabilityData>({
    queryKey: ['availability', campgroundId, checkIn, checkOut],
    queryFn: async () => {
      console.log('[AvailabilityChecker] Fetching availability:', { campgroundId, checkIn, checkOut });
      const params = new URLSearchParams();
      params.append('campgroundId', campgroundId);
      if (checkIn) params.append('checkIn', checkIn);
      if (checkOut) params.append('checkOut', checkOut);
      const url = `/api/availability?${params.toString()}`;
      console.log('[AvailabilityChecker] Request URL:', url);
      
      try {
        const response = await fetch(url);
        console.log('[AvailabilityChecker] Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[AvailabilityChecker] Response error:', errorText);
          throw new Error(`Failed to fetch availability: ${response.status} ${errorText}`);
        }
        
        const json = await response.json();
        console.log('[AvailabilityChecker] Response data:', json);
        return json;
      } catch (fetchError) {
        console.error('[AvailabilityChecker] Fetch error:', fetchError);
        throw fetchError;
      }
    },
    enabled: shouldFetch && !!campgroundId && !!checkIn && !!checkOut,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    retry: 1,
  });

  const handleCheckAvailability = () => {
    console.log('[AvailabilityChecker] Button clicked');
    console.log('[AvailabilityChecker] Current state:', { 
      campgroundId, 
      checkIn, 
      checkOut, 
      shouldFetch,
      isLoading,
      hasError: !!error 
    });
    
    // Validate dates
    if (!checkIn || !checkOut) {
      console.warn('[AvailabilityChecker] Missing dates:', { checkIn, checkOut });
      return;
    }
    
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      console.warn('[AvailabilityChecker] Invalid date range:', { checkIn, checkOut });
      alert('Check-out date must be after check-in date');
      return;
    }

    console.log('[AvailabilityChecker] Setting shouldFetch to true');
    setShouldFetch(true);
    
    // React Query will automatically run the query when enabled changes from false to true
    // No need to call refetch() - React Query handles this automatically
  };

  // Debug logging for query state
  React.useEffect(() => {
    console.log('[AvailabilityChecker] Query state:', {
      shouldFetch,
      campgroundId,
      checkIn,
      checkOut,
      isLoading,
      hasData: !!data,
      hasError: !!error,
      enabled: shouldFetch && !!campgroundId && !!checkIn && !!checkOut,
    });
  }, [shouldFetch, campgroundId, checkIn, checkOut, isLoading, data, error]);

  // Ensure query runs when shouldFetch becomes true
  React.useEffect(() => {
    if (shouldFetch && !!campgroundId && !!checkIn && !!checkOut && !isLoading && !data && !error) {
      console.log('[AvailabilityChecker] Query should be enabled but not running, triggering refetch');
      refetch();
    }
  }, [shouldFetch, campgroundId, checkIn, checkOut, isLoading, data, error, refetch]);

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
        Check Availability
      </h2>

      {/* Date Inputs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <label
            htmlFor="check-in"
            className="block text-sm font-sans-semibold text-gray-700 mb-2"
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            Check-In Date
          </label>
          <input
            id="check-in"
            type="date"
            value={checkIn}
            onChange={(e) => {
              setCheckIn(e.target.value);
              setShouldFetch(false);
            }}
            min={today}
            className="w-full px-4 py-2 border border-gray-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-koaGreen"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="check-out"
            className="block text-sm font-sans-semibold text-gray-700 mb-2"
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
          >
            Check-Out Date
          </label>
          <input
            id="check-out"
            type="date"
            value={checkOut}
            onChange={(e) => {
              setCheckOut(e.target.value);
              setShouldFetch(false);
            }}
            min={checkIn || today}
            className="w-full px-4 py-2 border border-gray-300 rounded-md font-sans focus:outline-none focus:ring-2 focus:ring-koaGreen"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
          />
        </div>
      </div>

      {/* Check Availability Button */}
      <button
        onClick={handleCheckAvailability}
        disabled={isLoading}
        className="w-full sm:w-auto px-6 py-3 bg-koaGreen text-white font-sans-semibold rounded-md hover:bg-koaYellowDark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-6"
        style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
      >
        {isLoading ? 'Checking...' : 'Check Availability'}
      </button>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-koaGreen"></div>
          <p className="mt-2 text-gray-600 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            Checking availability...
          </p>
        </div>
      )}

      {/* Error State */}
      {error && shouldFetch && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800 font-sans mb-2" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            Unable to check availability at this time. Please try again later.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-red-600 text-xs font-mono">
              Error: {error instanceof Error ? error.message : String(error)}
            </p>
          )}
        </div>
      )}

      {/* Results */}
      {data && shouldFetch && !isLoading && (
        <div className="space-y-4">
          {/* Overall Availability Status */}
          <div className={`p-4 rounded-md ${data.available ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <p className={`font-sans-semibold ${data.available ? 'text-green-800' : 'text-red-800'}`} style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
              {data.available ? '✓ Availability Found' : '✗ No Availability'}
            </p>
            <p className="text-sm text-gray-600 mt-1 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              {data.checkIn} to {data.checkOut}
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

