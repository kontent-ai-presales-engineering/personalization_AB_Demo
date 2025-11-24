import React, { useCallback, useState, useEffect } from "react";
import PageSection from "../components/PageSection";
import { useAppContext } from "../context/AppContext";
import { createClient } from "../utils/client";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { Page, Campground, LanguageCodenames } from "../model";
import { useSearchParams } from "react-router-dom";
import { defaultPortableRichTextResolvers, isEmptyRichText } from "../utils/richtext";
import { PortableText } from "@portabletext/react";
import { transformToPortableText } from "@kontent-ai/rich-text-resolver";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";
import { useSuspenseQueries } from "@tanstack/react-query";
import { Replace } from "../utils/types";
import { DEFAULT_COLLECTION_CODENAME } from "../utils/constants";
import { CollectionCodenames } from "../model";
import CampgroundList from "../components/campgrounds/CampgroundList";

const useCampgroundsListingPage = (isPreview: boolean, lang: string | null) => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [page, setPage] = useState<Page | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      applyUpdateOnItemAndLoadLinkedItems(
        page,
        data,
        (codenamesToFetch) => createClient(environmentId, apiKey, isPreview)
          .items()
          .inFilter("system.codename", [...codenamesToFetch])
          .toPromise()
          .then(res => res.data.items)
      ).then((updatedItem) => {
        if (updatedItem) {
          setPage(updatedItem as Page);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    createClient(environmentId, apiKey, isPreview)
      .item<Page>("campgrounds")
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        setPage(res.data.item);
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          setPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang]);

  useLivePreview(handleLiveUpdate);

  return page;
};


const CampgroundsListingPage: React.FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const lang = searchParams.get("lang");

  const campgroundsListingPage = useCampgroundsListingPage(isPreview, lang);

  const [landingPageData, campgroundsData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["campgrounds_listing_page", environmentId, lang, isPreview],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .item<Page>("campgrounds")
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toPromise()
            .then(res =>
              res.data.item as Replace<Page, { elements: Partial<Page["elements"]> }> ?? null
            )
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            }),
      },
      {
        queryKey: ["campgrounds", environmentId, collection, lang, isPreview],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<Campground>()
            .type("campground")
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .orderByAscending("elements.name")
            .notEqualsFilter("system.collection", "campground_template")
            .toPromise()
            .then(res => {
              console.log('🔍 Fetched campgrounds:', res.data.items.length, res.data.items.map(c => c.elements.name?.value));
              return res.data.items;
            })
            .catch((err) => {
              console.error('❌ Error fetching campgrounds:', err);
              if (err instanceof DeliveryError) {
                return [];
              }
              throw err;
            }),
      },
    ],
  });

  const campgrounds = campgroundsData.data || [];

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        landingPageData.refetch();
        campgroundsData.refetch();
      }
    },
    [campgroundsListingPage],
  );

  useCustomRefresh(onRefresh);

  if (!campgroundsListingPage) {
    return <div className="flex-grow" />;
  }

  console.log('🔍 CampgroundsListingPage render - campgrounds count:', campgrounds.length);

  const heroImageUrl = campgroundsListingPage.elements.hero_image?.value?.[0]?.url;
  const isVideo = campgroundsListingPage.elements.hero_image?.value?.[0]?.type?.startsWith('video');

  return (
    <div className="flex flex-col">
      {/* Full-Width Hero with Overlaid Headline */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Image/Video - Full Width */}
        {heroImageUrl && (
          <div className="absolute inset-0 z-0 w-full h-full">
            {isVideo ? (
              <video
                src={heroImageUrl}
                autoPlay={true}
                loop={true}
                muted={true}
                className="w-full h-full object-cover"
                {...createItemSmartLink(campgroundsListingPage.system.id)}
                {...createElementSmartLink("hero_image")}
              />
            ) : (
              <img
                className="w-full h-full object-cover"
                src={`${heroImageUrl}?auto=format&w=1920`}
                alt={campgroundsListingPage.elements.hero_image?.value?.[0]?.description ?? "Campgrounds hero image"}
                {...createItemSmartLink(campgroundsListingPage.system.id)}
                {...createElementSmartLink("hero_image")}
              />
            )}
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        )}

        {/* Headline and Content - Suspended Over Hero */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h1 
            className="text-white text-4xl md:text-5xl lg:text-6xl font-sans-semibold mb-4 leading-tight"
            style={{ 
              fontFamily: '"Gibson SemiBold", Arial, sans-serif',
              textShadow: '0 0 14px #000'
            }}
            {...createItemSmartLink(campgroundsListingPage.system.id)}
            {...createElementSmartLink("headline")}
          >
            {campgroundsListingPage.elements.headline?.value || "Find a Campground"}
          </h1>
          {campgroundsListingPage.elements.subheadline?.value && (
            <p 
              className="text-white text-lg md:text-xl lg:text-2xl mb-6 max-w-3xl mx-auto font-sans"
              style={{ 
                fontFamily: '"Gibson Regular", Arial, sans-serif',
                textShadow: '0 0 14px #000'
              }}
              {...createItemSmartLink(campgroundsListingPage.system.id)}
              {...createElementSmartLink("subheadline")}
            >
              {campgroundsListingPage.elements.subheadline.value || "Discover your perfect camping destination"}
            </p>
          )}
        </div>
      </div>

      {campgroundsListingPage.elements.body && !isEmptyRichText(campgroundsListingPage.elements.body.value) && (
        <PageSection color="bg-white">
          <div className="flex flex-col pt-10 mx-auto gap-6"
            {...createItemSmartLink(campgroundsListingPage.system.id)}
            {...createElementSmartLink("body")}
          >
            <PortableText
              value={transformToPortableText(campgroundsListingPage.elements.body.value)}
              components={defaultPortableRichTextResolvers}
            />
          </div>
        </PageSection>
      )}

      <PageSection color="bg-white">
        <div className="flex flex-col gap-8 pt-[104px] pb-[160px]">
          <CampgroundList campgrounds={campgrounds} />
        </div>
      </PageSection>
    </div>
  );
};

export default CampgroundsListingPage;

