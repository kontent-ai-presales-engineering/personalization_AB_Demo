import { DeliveryError } from "@kontent-ai/delivery-sdk";

import HeroImage from "../components/HeroImage";
import PageContent from "../components/PageContent";
import PageSection from "../components/PageSection";
import "../index.css";
import { LanguageCodenames, type Page } from "../model";
import { createClient } from "../utils/client";
import { FC, useCallback, useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { Replace } from "../utils/types";
import { useParams, useSearchParams } from "react-router-dom";
import { useCustomRefresh, useLivePreview } from "../context/SmartLinkContext";
import { IRefreshMessageData, IRefreshMessageMetadata, IUpdateMessageData, applyUpdateOnItemAndLoadLinkedItems } from "@kontent-ai/smart-link";
import { useSuspenseQueries } from "@tanstack/react-query";
import { CollectionCodenames } from "../model";

const usePage = (isPreview: boolean, lang: string | null, slug: string | null) => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [page, setPage] = useState<Replace<Page, { elements: Partial<Page["elements"]> }> | null>(null);

  const handleLiveUpdate = useCallback((data: IUpdateMessageData) => {
    if (page) {
      // Use applyUpdateOnItemAndLoadLinkedItems to ensure all linked content is updated
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
          setPage(updatedItem as Replace<Page, { elements: Partial<Page["elements"]> }>);
        }
      });
    }
  }, [page, environmentId, apiKey, isPreview]);

  useEffect(() => {
    if (!slug) {
      setPage(null);
      return;
    }

    // Normalize slug: remove leading slash if present
    const normalizedSlug = slug.startsWith('/') ? slug.slice(1) : slug;
    const slugWithSlash = `/${normalizedSlug}`;

    createClient(environmentId, apiKey, isPreview)
      .items<Page>()
      .type("page")
      .limitParameter(50) // Get more items to search through
      .collections([(collection ?? 'default') as CollectionCodenames])
      .languageParameter((lang ?? "default") as LanguageCodenames)
      .toPromise()
      .then(res => {
        // Try to find page by URL field (matching both with and without leading slash)
        const item = res.data.items.find((page: Page) => {
          const pageUrl = page.elements.url?.value || "";
          // UrlSlugElement typically stores without leading slash, but check both formats
          const normalizedPageUrl = pageUrl.startsWith('/') ? pageUrl.slice(1) : pageUrl;
          return normalizedPageUrl === normalizedSlug || 
                 pageUrl === slugWithSlash || 
                 pageUrl === slug ||
                 pageUrl === normalizedSlug;
        }) as Replace<Page, { elements: Partial<Page["elements"]> }> | undefined;
        
        if (item) {
          setPage(item);
        } else {
          console.warn(`Page not found for slug: ${slug}. Searched ${res.data.items.length} pages.`);
          setPage(null);
        }
      })
      .catch((err) => {
        if (err instanceof DeliveryError) {
          console.error(`Error fetching page for slug ${slug}:`, err);
          setPage(null);
        } else {
          throw err;
        }
      });
  }, [environmentId, apiKey, isPreview, lang, slug, collection]);

  useLivePreview(handleLiveUpdate);

  return page;
};

const Page: FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const { slug } = useParams();
  const lang = searchParams.get("lang");

  const page = usePage(isPreview, lang, slug ?? null);

  const [pageData] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["page", slug, lang, isPreview],
        queryFn: () => {
          if (!slug) return null;
          
          // Normalize slug: remove leading slash if present
          const normalizedSlug = slug.startsWith('/') ? slug.slice(1) : slug;
          const slugWithSlash = `/${normalizedSlug}`;

          return createClient(environmentId, apiKey, isPreview)
            .items<Page>()
            .type("page")
            .limitParameter(50) // Get more items to search through
            .collections([(collection ?? 'default') as CollectionCodenames])
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .toPromise()
            .then(res => {
              // Try to find page by URL field (matching both with and without leading slash)
              const item = res.data.items.find((page: Page) => {
                const pageUrl = page.elements.url?.value || "";
                // UrlSlugElement typically stores without leading slash, but check both formats
                const normalizedPageUrl = pageUrl.startsWith('/') ? pageUrl.slice(1) : pageUrl;
                return normalizedPageUrl === normalizedSlug || 
                       pageUrl === slugWithSlash || 
                       pageUrl === slug ||
                       pageUrl === normalizedSlug;
              }) as Replace<Page, { elements: Partial<Page["elements"]> }> | undefined;
              
              if (!item) {
                console.warn(`Page not found for slug: ${slug}. Available URLs:`, res.data.items.map((p: Page) => p.elements.url?.value));
              }
              
              return item ?? null;
            })
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return null;
              }
              throw err;
            });
        },
      },
    ],
  });

  const onRefresh = useCallback(
    (_: IRefreshMessageData, metadata: IRefreshMessageMetadata, originalRefresh: () => void) => {
      if (metadata.manualRefresh) {
        originalRefresh();
      } else {
        pageData.refetch();
      }
    },
    [page],
  );

  useCustomRefresh(onRefresh);

  if (!page || !Object.entries(page.elements).length) {
    return <div className="flex-grow">Empty page</div>;
  }

  return (
    <div className="flex-grow">
      {
        page.elements.headline?.value && (
          <HeroImage
            data={{
              headline: page.elements.headline,
              subheadline: page.elements.subheadline,
              heroImage: page.elements.hero_image,
              itemId: page.system.id
            }}
            buttonLink="nolink"
          />
        )
      }
      <PageSection color="bg-white">
        <PageContent body={page.elements.body!} itemId={page.system.id} elementName="body" isPreview={isPreview} />
      </PageSection>
    </div>
  );
};

export default Page;
