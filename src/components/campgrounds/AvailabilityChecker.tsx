import React, { useState, useEffect } from 'react';

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
 * Generate mock site types with realistic data
 * Simulates what K2 PMS API would return
 */
function generateMockSiteTypes(campgroundId: string): SiteType[] {
  // Use campgroundId as seed for consistent mock data
  const seed = campgroundId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const random = (min: number, max: number) => {
    const r = Math.sin(seed) * 10000;
    return Math.floor((r - Math.floor(r)) * (max - min + 1)) + min;
  };

  const siteTypeTemplates = [
    'RV Site (Full Hookup)',
    'RV Site (Water & Electric)',
    'Tent Site',
    'Cabin',
    'Glamping Tent',
    'RV Site (Electric Only)',
    'Primitive Camping',
  ];

  // Select 3-5 random site types
  const numSites = random(3, 5);
  const selectedTypes: SiteType[] = [];
  const usedIndices = new Set<number>();

  for (let i = 0; i < numSites; i++) {
    let index;
    do {
      index = random(0, siteTypeTemplates.length - 1);
    } while (usedIndices.has(index));
    
    usedIndices.add(index);
    
    const basePrice = random(30, 150);
    const available = Math.random() > 0.3; // 70% chance available
    
    selectedTypes.push({
      name: siteTypeTemplates[index]!,
      price: basePrice,
      available,
    });
  }

  return selectedTypes;
}

/**
 * Simulate API call with delay
 * TODO: Replace with real K2 PMS API call when credentials available
 */
async function fetchAvailability(campgroundId: string): Promise<AvailabilityData> {
  // Simulate 200ms API latency
  await new Promise(resolve => setTimeout(resolve, 200));
  
  const today: string = new Date().toISOString().split('T')[0] || '';
  const tomorrow: string = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] || '';
  
  if (!today || !tomorrow) {
    throw new Error('Failed to generate dates');
  }
  
  const siteTypes = generateMockSiteTypes(campgroundId);
  const available = siteTypes.some(site => site.available);
  
  return {
    available,
    siteTypes,
    checkIn: today,
    checkOut: tomorrow,
  };
}

/**
 * Availability Checker Component
 * 
 * Automatically fetches and displays campground availability.
 * Currently simulates K2 PMS API call - ready to swap for real API.
 * 
 * Features:
 * - Automatically fetches availability on mount
 * - Display site types with pricing
 * - Availability status badges
 * - Disclaimer about simulated data
 * - Loading and error states
 * 
 * Maintenance: Bounded maintenance - Swap fetchAvailability function for real API call
 */
const AvailabilityChecker: React.FC<AvailabilityCheckerProps> = ({ 
  campgroundId, 
  className = '' 
}) => {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!campgroundId) return;

    setIsLoading(true);
    setError(null);
    
    fetchAvailability(campgroundId)
      .then((result) => {
        setData(result);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error('Failed to fetch availability'));
        setIsLoading(false);
      });
  }, [campgroundId]);


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
              Next available: {data.checkIn ? new Date(data.checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'} - {data.checkOut ? new Date(data.checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
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

