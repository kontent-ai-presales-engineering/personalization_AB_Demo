import { FC } from "react";

const KOACampgroundTypes: FC = () => {
  const campgroundTypes = [
    {
      title: "KOA Journey",
      subtitle: "Gateway to Adventure",
      description: "Perfect for quick stops on your road trip",
      color: "bg-koaYellow",
      icon: "🛣️",
      link: "/articles?type=journey",
    },
    {
      title: "KOA Holiday",
      subtitle: "Basecamp for the Great Outdoors",
      description: "More amenities for longer stays",
      color: "bg-koaGreen",
      icon: "🏕️",
      link: "/articles?type=holiday",
    },
    {
      title: "KOA Resort",
      subtitle: "The Destination for Recreation",
      description: "Full-service destinations with premium amenities",
      color: "bg-blue-600",
      icon: "🏖️",
      link: "/articles?type=resort",
    },
  ];

  return (
    <div className="bg-gray-50 py-12 md:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-sans-semibold text-black mb-3 md:mb-4 leading-tight" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
            The KOA Family of Campgrounds
          </h2>
          <p className="text-base md:text-lg text-koaGray max-w-3xl mx-auto leading-relaxed font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
            As you plan your camping getaways, it's important to know what to expect from each of our 500+ KOA Campground locations. 
            The KOA Yellow Sign has always represented high quality, friendly service and fun.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {campgroundTypes.map((type, index) => (
            <div
              key={index}
              className="bg-white shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border-0 group"
              style={{ borderRadius: 0 }}
            >
              <div className={`${type.color} h-2`} style={{ borderRadius: 0 }}></div>
              <div className="p-6 md:p-8">
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-xl md:text-2xl font-sans-semibold text-black mb-2 leading-tight" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                  {type.title}
                </h3>
                <p className="text-koaGreen font-sans-semibold mb-3 text-base md:text-lg" style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}>
                  {type.subtitle}
                </p>
                <p className="text-koaGray mb-5 md:mb-6 text-sm md:text-base leading-relaxed font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
                  {type.description}
                </p>
                <a
                  href={type.link}
                  className="inline-flex items-center text-koaBlue hover:text-koaRed font-sans-semibold text-sm md:text-base transition-colors"
                  style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif' }}
                >
                  Find {type.title}
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KOACampgroundTypes;

