import { Elements } from "@kontent-ai/delivery-sdk";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createElementSmartLink, createItemSmartLink } from "../../utils/smartlink";

type KOAHeroProps = Readonly<{
  data: {
    headline?: Elements.TextElement;
    subheadline?: Elements.TextElement;
    heroImage?: Elements.AssetsElement;
    itemId?: string;
  };
}>;

const KOAHero: FC<KOAHeroProps> = ({ data }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to articles page with search query
      navigate(`/articles?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const heroImageUrl = data.heroImage?.value[0]?.url;

  return (
    <div className="relative w-full h-[500px] lg:h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-b from-koaGreen to-darkGreen">
      {/* Background Image */}
      {heroImageUrl && (
        <div className="absolute inset-0 z-0">
          <img
            src={`${heroImageUrl}?auto=format&w=1920`}
            alt={data.heroImage?.value[0]?.description ?? "Camping background"}
            className="w-full h-full object-cover"
          />
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-black/60"></div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 lg:px-8 text-center">
        <h1
          className="text-white text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-sans-semibold mb-3 md:mb-4 leading-tight"
          style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif', textShadow: '0 0 14px #000' }}
          {...createItemSmartLink(data.itemId)}
          {...createElementSmartLink("headline")}
        >
          {data.headline?.value || "Explore More This Fall at KOA"}
        </h1>
        
        {data.subheadline?.value && (
          <p
            className="text-white text-base md:text-lg lg:text-xl mb-8 md:mb-10 max-w-2xl mx-auto font-sans"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif', textShadow: '0 0 14px #000' }}
            {...createItemSmartLink(data.itemId)}
            {...createElementSmartLink("subheadline")}
          >
            {data.subheadline.value}
          </p>
        )}

        {/* Search Bar - KOA Style */}
        <form onSubmit={handleSearch} className="bg-white shadow-2xl p-2 flex flex-col md:flex-row gap-2 max-w-3xl mx-auto mb-6" style={{ borderRadius: 0 }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Where do you want to go?"
            className="flex-1 px-4 py-3 text-gray-900 border-none outline-none text-base"
            style={{ fontFamily: '"Gibson Regular", Arial, sans-serif', borderRadius: 0 }}
          />
          <button
            type="submit"
            className="bg-koaYellow hover:bg-koaYellowDark text-black font-sans-semibold px-8 py-3 transition-all duration-200 uppercase text-sm"
            style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif', borderRadius: 0 }}
          >
            Find a KOA
          </button>
        </form>

        {/* Quick Links */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 text-white text-sm md:text-base font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          <a href="/articles" className="hover:text-koaYellow transition-colors">
            Find by Region
          </a>
          <span className="text-white/50">|</span>
          <a href="/articles" className="hover:text-koaYellow transition-colors">
            Find by State
          </a>
          <span className="text-white/50">|</span>
          <a href="/articles" className="hover:text-koaYellow transition-colors">
            All Campgrounds
          </a>
        </div>
      </div>
    </div>
  );
};

export default KOAHero;

