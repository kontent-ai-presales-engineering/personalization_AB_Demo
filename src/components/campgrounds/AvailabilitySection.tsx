import React from 'react';
import { PMSAvailabilityData } from '../../utils/pmsMock';

type AvailabilitySectionProps = {
  data: PMSAvailabilityData;
  className?: string;
};

/**
 * Availability Section Component
 * 
 * Displays PMS availability data merged with CMS campground data.
 * 
 * POC Pattern: This demonstrates runtime merge of:
 * - CMS data (campground info from Kontent.ai)
 * - PMS data (availability from K2 PMS)
 * 
 * Production: Replace generatePMSAvailability() with real K2 PMS API call
 */
const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({ 
  data, 
  className = '' 
}) => {
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

      {/* Overall Status */}
      <div className={`p-4 rounded-md mb-4 ${
        data.available 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <p className={`font-sans-semibold ${
          data.available ? 'text-green-800' : 'text-red-800'
        }`} style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
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

      {/* POC Disclaimer */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          <strong>POC Note:</strong> Availability data is simulated. In production, this would fetch from K2 PMS API using campground ID from CMS.
        </p>
      </div>
    </div>
  );
};

export default AvailabilitySection;
