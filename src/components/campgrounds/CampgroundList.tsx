import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { createItemSmartLink } from "../../utils/smartlink";
import { Campground } from "../../model";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { createPreviewLink } from "../../utils/link";

type CampgroundListProps = Readonly<{
  campgrounds: ReadonlyArray<Campground>;
}>;

const CampgroundCard: React.FC<{ campground: Campground }> = ({ campground }) => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  // Extract text summary from rich text banner_body
  let summary = "";
  if (campground.elements.banner_body?.value) {
    const portableText = transformToPortableText(campground.elements.banner_body.value);
    const textBlocks = portableText
      .filter((node: any) => node._type === 'block' && node.children?.[0]?.text)
      .map((node: any) => node.children?.[0]?.text || "")
      .join(' ');
    summary = textBlocks.length > 150 ? textBlocks.substring(0, 150) + '...' : textBlocks;
  }

  // Get URL from campground element
  const campgroundUrl = campground.elements.url?.value || campground.system.codename;
  
  // Normalize URL: remove leading slash and any path prefix if present
  let normalizedUrl = campgroundUrl;
  if (typeof normalizedUrl === 'string') {
    normalizedUrl = normalizedUrl.startsWith('/') ? normalizedUrl.slice(1) : normalizedUrl;
    normalizedUrl = normalizedUrl.replace(/^campgrounds\//, '');
  }

  const campgroundPath = `/campgrounds/${normalizedUrl}`;

  return (
    <Link
      to={createPreviewLink(campgroundPath, isPreview)}
      state={{ campground }}
      className="block bg-white border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
      style={{ borderRadius: 0 }}
      {...createItemSmartLink(campground.system.id)}
    >
      {/* Banner Image */}
      {campground.elements.banner_image?.value?.[0]?.url && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={campground.elements.banner_image.value[0].url}
            alt={campground.elements.name?.value || ""}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="p-6">
        <h3 className="text-xl font-sans-semibold text-black mb-2" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
          {campground.elements.name?.value || ""}
        </h3>
        
        {/* Address */}
        {campground.elements.address?.value && (
          <p className="text-koaGray text-sm mb-2 font-sans flex items-start" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            <span className="mr-2">📍</span>
            <span>{campground.elements.address.value}</span>
          </p>
        )}
        
        {/* Contact Information */}
        <div className="space-y-1 mb-3">
          {campground.elements.phone_number?.value && (
            <p className="text-koaGray text-sm font-sans flex items-center" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              <span className="mr-2">📞</span>
              <a href={`tel:${campground.elements.phone_number.value}`} className="hover:text-koaBlue transition-colors" style={{ color: '#0059bb' }}>
                {campground.elements.phone_number.value}
              </a>
            </p>
          )}
          {campground.elements.email_address?.value && (
            <p className="text-koaGray text-sm font-sans flex items-center" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
              <span className="mr-2">✉️</span>
              <a href={`mailto:${campground.elements.email_address.value}`} className="hover:text-koaBlue transition-colors truncate" style={{ color: '#0059bb' }}>
                {campground.elements.email_address.value}
              </a>
            </p>
          )}
        </div>
        
        {/* Summary */}
        {summary && (
          <p className="text-koaGray text-sm mb-4 font-sans line-clamp-3" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            {summary}
          </p>
        )}
        
        {/* Amenities */}
        {campground.elements.amenities?.value && campground.elements.amenities.value.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-sans-semibold text-koaGray uppercase mb-1" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>Amenities</p>
            <div className="flex flex-wrap gap-1">
              {campground.elements.amenities.value.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-black text-xs px-2 py-1 font-sans"
                  style={{ borderRadius: 0, fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                >
                  {amenity.name}
                </span>
              ))}
              {campground.elements.amenities.value.length > 3 && (
                <span className="inline-block text-koaGray text-xs px-2 py-1 font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
                  +{campground.elements.amenities.value.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Ways to Stay */}
        {campground.elements.ways_to_stay?.value && campground.elements.ways_to_stay.value.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-sans-semibold text-koaGray uppercase mb-1" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>Ways to Stay</p>
            <div className="flex flex-wrap gap-1">
              {campground.elements.ways_to_stay.value.map((way, index) => (
                <span
                  key={index}
                  className="inline-block bg-gray-100 text-black text-xs px-2 py-1 font-sans"
                  style={{ borderRadius: 0, fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                >
                  {way.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <span className="text-koaBlue font-sans-semibold text-sm uppercase hover:text-koaRed transition-colors inline-flex items-center" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
          Learn More →
        </span>
      </div>
    </Link>
  );
};

const CampgroundList: React.FC<CampgroundListProps> = ({ campgrounds }) => {
  return (
    <div className="w-full">
      {campgrounds.length === 0 ? (
        <p className="text-center text-koaGray text-lg font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>No campgrounds available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {campgrounds.map((campground) => (
            <CampgroundCard key={campground.system.id} campground={campground} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampgroundList;

