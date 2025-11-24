import { FC } from "react";
import { NavLink, useSearchParams } from "react-router";
import { createClient } from "../utils/client";
import { CollectionCodenames, LandingPage, LanguageCodenames } from "../model";
import { DeliveryError } from "@kontent-ai/delivery-sdk";
import { useSuspenseQueries } from "@tanstack/react-query";
import { useAppContext } from "../context/AppContext";
import { createPreviewLink } from "../utils/link";

type NavigationProps = {
  variant?: "header" | "footer";
};

const Navigation: FC<NavigationProps> = ({ variant = "header" }) => {
  const { environmentId, apiKey, collection } = useAppContext();
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  const lang = searchParams.get("lang");
  const collectionParam = searchParams.get("collection")
  const collectionFilter = collectionParam ?? collection ?? "default";

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

  const navigationItems = navigation.data || [];

  // Default KOA navigation items if CMS doesn't provide them
  const defaultNavItems = [
    { name: "Find a Campground", link: "/articles" },
    { name: "Camping at KOA", link: "/articles" },
    { name: "Ways To Stay", link: "/articles" },
    { name: "Rewards Program", link: "/articles" },
    { name: "Deals", link: "/articles" },
    { name: "Resources", link: "/articles" },
    { name: "Connect", link: "/articles" },
  ];

  const displayItems = navigationItems.length > 0 ? navigationItems : defaultNavItems;

  const isFooter = variant === "footer";
  
  // Header styling - KOA style: black bar with white text, active links in yellow
  const headerBaseClasses = "text-white font-sans-semibold text-lg px-4 py-1 relative";
  const headerActiveClasses = "text-koaYellow";
  const headerHoverClasses = "hover:text-koaYellow";
  
  // Footer styling
  const footerBaseClasses = "text-white font-sans-semibold text-sm px-4 py-1 relative";
  const footerActiveClasses = "text-koaYellow";
  const footerHoverClasses = "hover:text-koaYellow";
  
  const baseClasses = isFooter ? footerBaseClasses : headerBaseClasses;
  const activeClasses = isFooter ? footerActiveClasses : headerActiveClasses;
  const hoverClasses = isFooter ? footerHoverClasses : headerHoverClasses;

  const createMenuLink = (name: string, link: string) => (
    <NavLink
      key={name}
      to={createPreviewLink(link, isPreview)}
      className={({ isActive }) =>
        `${baseClasses} ${hoverClasses} transition-colors ${
          isActive ? activeClasses : ""
        }`
      }
      style={{ 
        fontFamily: '"Gibson SemiBold", Arial, sans-serif',
        fontSize: isFooter ? '0.9em' : '1.1rem',
        paddingTop: '0.3rem',
        paddingBottom: '0.3rem',
      }}
    >
      {name}
    </NavLink>
  );

  return (
    <ul className="flex flex-col lg:flex-row gap-0 items-start lg:items-center list-none" style={{ margin: 0, padding: 0 }}>
      {displayItems.map(({ name, link }) => (
        <li key={name} className="list-none" style={{ paddingLeft: isFooter ? '0' : '15px' }}>
          {createMenuLink(name, link)}
        </li>
      ))}
    </ul>
  );
};

export default Navigation;
