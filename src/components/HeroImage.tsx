import { Elements } from "@kontent-ai/delivery-sdk";
import { FC } from "react";
import ButtonLink from "./ButtonLink";
import { createElementSmartLink, createItemSmartLink } from "../utils/smartlink";

type HeroImageProps = Readonly<{
  data: {
    headline?: Elements.TextElement;
    subheadline?: Elements.TextElement;
    heroImage?: Elements.AssetsElement;
    itemId?: string;
  };
  buttonLink?: string;

}>;

const HeroImage: FC<HeroImageProps> = ({ data, buttonLink }) => {
  const heroImageUrl = data.heroImage?.value[0]?.url;
  const isVideo = data.heroImage?.value[0]?.type?.startsWith('video');

  return (
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
            />
          ) : (
            <img
              className="w-full h-full object-cover"
              src={`${heroImageUrl}?auto=format&w=1920`}
              alt={data.heroImage?.value[0]?.description ?? "hero image"}
              {...createItemSmartLink(data.itemId)}
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
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("headline")}
        >
          {data.headline?.value}
        </h1>
        {data.subheadline?.value && (
          <p 
            className="text-white text-lg md:text-xl lg:text-2xl mb-6 max-w-3xl mx-auto font-sans"
            style={{ 
              fontFamily: '"Gibson Regular", Arial, sans-serif',
              textShadow: '0 0 14px #000'
            }}
            {...createItemSmartLink(data.itemId)}
            {...createElementSmartLink("subheadline")}
          >
            {data.subheadline.value}
          </p>
        )}
        {buttonLink != "nolink" && (
          <div className="mt-6">
            <ButtonLink href={buttonLink ?? "personal-taste"} style="yellow">
              <p>Find your taste</p>
            </ButtonLink>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroImage;