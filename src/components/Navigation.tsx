import { FC } from "react";
import { NavLink, useSearchParams } from "react-router";
import { createClient } from "../utils/client";
import { CollectionCodenames, LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";
import { createPreviewLink } from "../utils/link";
import { DEFAULT_COLLECTION_CODENAME } from "../utils/constants";

const Navigation: FC = () => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const lang = searchParams.get("lang");
  const collectionParam = searchParams.get("collection")
  const collectionFilter = collectionParam ?? collection ?? DEFAULT_COLLECTION_CODENAME;

  const [navigation] = useSuspenseQueries({
    queries: [
      {
        queryKey: ["navigation", environmentId, collectionFilter, lang, isPreview],
        queryFn: () =>
          createClient(environmentId, apiKey, isPreview)
            .items<LandingPage>()
            .type("landing_page")
            .limitParameter(1)
            .languageParameter((lang ?? "default") as LanguageCodenames)
            .collections([collectionFilter as CollectionCodenames])
            .toPromise()
            .then(res => {
              const landingPage = res.data.items[0];
              if (!landingPage || !landingPage.elements.subpages?.linkedItems) {
                return [];
              }
              return landingPage.elements.subpages.linkedItems.map(subpage => ({
                name: subpage.elements.headline?.value || "",
                link: subpage.elements.url?.value || "",
              }));
            })
            .catch((err) => {
              if (err instanceof DeliveryError) {
                return [];
              }
              throw err;
            }),
      },
    ],
  });

  const createMenuLink = (name: string, link: string) => (
    <li key={name}>
      <NavLink to={createPreviewLink(link, isPreview)} className="text-base leading-5 text-white w-fit block hover:text-mintGreen uppercase font-lexend">{name}</NavLink>
    </li>
  );

  const navigationItems = navigation.data || [];

  return (
    <nav>
      <menu className="flex flex-col lg:flex-row gap-5 lg:gap-[60px] items-center list-none text-white">
        {navigationItems.map(({ name, link }) => createMenuLink(name, link))}
      </menu>
    </nav>
  );
};

export default Navigation;
