import React, { useEffect, useCallback } from "react";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import { Campground, LanguageCodenames } from "../model";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { defaultPortableRichTextResolvers } from "../utils/richtext";
import PageSection from "../components/PageSection";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useNavigationContext } from "../context/NavigationContext";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import VimeoEmbed from "../components/campgrounds/VimeoEmbed";
import GoogleRatings from "../components/campgrounds/GoogleRatings";

const CampgroundDetailPage: React.FC = () => {
  const location = useLocation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");
  const { environmentId, apiKey } = useAppContext();
  const queryClient = useQueryClient();
  const { setNavigationItems } = useNavigationContext();

  // Try to get campground from location state first (internal navigation)
  const stateCampground = location.state?.campground as Campground | undefined;

  // Fetch campground from API if not in state (direct URL access, like Kontent.ai preview)
  const { data: fetchedCampground, refetch } = useQuery({
    queryKey: ["campground-detail", slug, lang, isPreview],
    queryFn: async () => {
      if (!slug) return null;
      
      try {
        // Normalize slug - remove any "campgrounds/" prefix if present
        const normalizedSlug = slug.replace(/^campgrounds\//, '');
        
        // Fetch campground by URL field
        const response = await createClient(environmentId, apiKey, isPreview)
          .items<Campground>()
          .type("campground")
          .languageParameter((lang ?? "default") as LanguageCodenames)
          .depthParameter(3)
          .toPromise();

        // Find campground matching the slug (check both url value and codename)
        const campground = response.data.items.find(c => {
          const urlValue = c.elements.url?.value || '';
          const normalizedUrl = urlValue.startsWith('/') ? urlValue.slice(1) : urlValue;
          const cleanUrl = normalizedUrl.replace(/^campgrounds\//, '');
          return cleanUrl === normalizedSlug || c.system.codename === normalizedSlug;
        });

        return campground ?? null;
      } catch (err) {
        if (err instanceof DeliveryError) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!slug && !stateCampground, // Only fetch if slug exists and no state campground
  });

  // Use state campground if available, otherwise use fetched campground
  const campground = stateCampground || fetchedCampground || null;

  // Handle live preview updates
  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (campground) {
      applyUpdateOnItemAndLoadLinkedItems(
        campground,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          queryClient.setQueryData(["campground-detail", slug, lang, isPreview], updatedItem);
        }
      });
    }
  }, [campground, environmentId, apiKey, isPreview, slug, lang, queryClient]);

  useLivePreview(handleLiveUpdate);

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        refetch();
      }
    },
    [refetch],
  );

  useCustomRefresh(onRefresh);

  // Set navigation items from campground menu when component mounts
  useEffect(() => {
    if (campground?.elements.menu?.linkedItems) {
      const menuItems = campground.elements.menu.linkedItems.map(page => ({
        name: page.elements.headline?.value || "",
        link: page.elements.url?.value || "",
      }));
      setNavigationItems(menuItems);
    }

    // Clear navigation items when component unmounts (navigating away)
    return () => {
      setNavigationItems(null);
    };
  }, [campground, setNavigationItems]);

  if (!campground) {
    return (
      <div className="flex-grow flex items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Campground Not Found</h2>
          <p className="text-gray-600">
            The campground you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Extract Vimeo video ID if present
  const extractVimeoVideoId = (input: string): string | null => {
    if (!input) return null;
    
    // If it's already just a number/ID, return it
    if (/^\d+$/.test(input.trim())) {
      return input.trim();
    }
    
    // Extract from URL patterns:
    // https://vimeo.com/183941852
    // https://player.vimeo.com/video/183941852
    // https://vimeo.com/channels/staffpicks/183941852
    const urlPatterns = [
      /vimeo\.com\/(?:channels\/[^\/]+\/|groups\/[^\/]+\/videos\/|album\/\d+\/video\/|video\/|)(\d+)/i,
      /player\.vimeo\.com\/video\/(\d+)/i,
    ];
    
    for (const pattern of urlPatterns) {
      const match = input.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    return null;
  };

  const vimeoVideoId = campground.elements.vimeo_video?.value 
    ? extractVimeoVideoId(campground.elements.vimeo_video.value)
    : null;
  
  const heroImageUrl = campground.elements.banner_image?.value?.[0]?.url;
  const isVideo = campground.elements.banner_image?.value?.[0]?.type?.startsWith('video');
  const hasVimeoBackground = vimeoVideoId !== null;

  return (
    <div className="flex-grow">
      {/* Hero Section - Full Width */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background - Vimeo Video (priority) or Banner Image/Video */}
        {hasVimeoBackground ? (
          <div className="absolute inset-0 z-0 w-full h-full">
            <iframe
              src={`https://player.vimeo.com/video/${vimeoVideoId}?autoplay=1&loop=1&muted=1&background=1&controls=0&title=0&byline=0&portrait=0`}
              className="absolute inset-0 w-full h-full object-cover"
              style={{ border: 0 }}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              {...createItemSmartLink(campground.system.id)}
              {...createElementSmartLink("vimeo_video")}
            />
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ) : heroImageUrl ? (
          <div className="absolute inset-0 z-0 w-full h-full">
            {isVideo ? (
              <video
                src={heroImageUrl}
                autoPlay={true}
                loop={true}
                muted={true}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                className="w-full h-full object-cover"
                src={`${heroImageUrl}?auto=format&w=1920`}
                alt={campground.elements.banner_image?.value[0]?.description ?? campground.elements.name?.value ?? "Campground hero"}
                {...createItemSmartLink(campground.system.id)}
                {...createElementSmartLink("banner_image")}
              />
            )}
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ) : null}

        {/* Headline and Content - Suspended Over Hero */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h1
            className="text-white text-4xl md:text-5xl lg:text-6xl font-sans-semibold mb-4 leading-tight"
            style={{
              fontFamily: '"Gibson SemiBold", Arial, sans-serif',
              textShadow: '0 0 14px #000'
            }}
            {...createItemSmartLink(campground.system.id)}
            {...createElementSmartLink("name")}
          >
            {campground.elements.name?.value || "Campground"}
          </h1>
          {campground.elements.banner_header?.value && (
            <p
              className="text-white text-lg md:text-xl lg:text-2xl mb-6 max-w-3xl mx-auto font-sans"
              style={{
                fontFamily: '"Gibson Regular", Arial, sans-serif',
                textShadow: '0 0 14px #000'
              }}
              {...createItemSmartLink(campground.system.id)}
              {...createElementSmartLink("banner_header")}
            >
              {campground.elements.banner_header.value}
            </p>
          )}
        </div>
      </div>

      {/* Content Section */}
      <PageSection color="bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          {campground.elements.banner_body?.value && (
            <div
              className="prose prose-lg max-w-none font-sans"
              style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
              {...createItemSmartLink(campground.system.id)}
              {...createElementSmartLink("banner_body")}
            >
              <PortableText
                value={transformToPortableText(
                  campground.elements.banner_body.value
                )}
                components={defaultPortableRichTextResolvers}
              />
            </div>
          )}

          {/* Vimeo Video Embed */}
          {campground.elements.vimeo_video?.value && (
            <div
              {...createItemSmartLink(campground.system.id)}
              {...createElementSmartLink("vimeo_video")}
            >
              <VimeoEmbed
                videoId={campground.elements.vimeo_video.value}
                title={`${campground.elements.name?.value || 'Campground'} Video`}
              />
            </div>
          )}

          {/* Amenities */}
          {campground.elements.amenities?.value && campground.elements.amenities.value.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2
                className="text-2xl font-sans-semibold text-gray-900 mb-4"
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Amenities
              </h2>
              <div
                className="flex flex-wrap gap-2 font-sans"
                style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                {...createItemSmartLink(campground.system.id)}
                {...createElementSmartLink("amenities")}
              >
                {campground.elements.amenities.value.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-black px-3 py-1 rounded"
                  >
                    {amenity.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Ways to Stay */}
          {campground.elements.ways_to_stay?.value && campground.elements.ways_to_stay.value.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2
                className="text-2xl font-sans-semibold text-gray-900 mb-4"
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Ways to Stay
              </h2>
              <div
                className="flex flex-wrap gap-2 font-sans"
                style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
                {...createItemSmartLink(campground.system.id)}
                {...createElementSmartLink("ways_to_stay")}
              >
                {campground.elements.ways_to_stay.value.map((way, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-black px-3 py-1 rounded"
                  >
                    {way.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Contact Information */}
          {(campground.elements.address?.value ||
            campground.elements.phone_number?.value ||
            campground.elements.email_address?.value) && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2
                className="text-2xl font-sans-semibold text-gray-900 mb-4"
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Contact Information
              </h2>
              <div
                className="space-y-2 text-gray-700 font-sans"
                style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}
              >
                {campground.elements.address?.value && (
                  <p
                    {...createItemSmartLink(campground.system.id)}
                    {...createElementSmartLink("address")}
                  >
                    <span className="font-semibold">Address:</span>{" "}
                    {campground.elements.address.value}
                  </p>
                )}
                {campground.elements.phone_number?.value && (
                  <p
                    {...createItemSmartLink(campground.system.id)}
                    {...createElementSmartLink("phone_number")}
                  >
                    <span className="font-semibold">Phone:</span>{" "}
                    {campground.elements.phone_number.value}
                  </p>
                )}
                {campground.elements.email_address?.value && (
                  <p
                    {...createItemSmartLink(campground.system.id)}
                    {...createElementSmartLink("email_address")}
                  >
                    <span className="font-semibold">Email:</span>{" "}
                    <a
                      href={`mailto:${campground.elements.email_address.value}`}
                      className="text-koaGreen hover:text-koaYellowDark"
                    >
                      {campground.elements.email_address.value}
                    </a>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Google Ratings */}
          {campground.elements.google_place_id?.value && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2
                className="text-2xl font-sans-semibold text-gray-900 mb-4"
                style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
              >
                Google Reviews
              </h2>
              <div
                {...createItemSmartLink(campground.system.id)}
                {...createElementSmartLink("google_place_id")}
              >
                <GoogleRatings placeId={campground.elements.google_place_id.value} />
              </div>
            </div>
          )}

        </div>
      </PageSection>
    </div>
  );
};

export default CampgroundDetailPage;

