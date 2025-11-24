import { FC, useState } from "react";
import { NavLink, useSearchParams } from "react-router-dom";
import { createPreviewLink } from "../utils/link";

const KOANavigation: FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/articles?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const toggleDropdown = (label: string) => {
    setActiveDropdown(activeDropdown === label ? null : label);
  };

  // Find a Campground Dropdown
  const FindCampgroundDropdown = () => (
    <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t-4 border-koaRed mt-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column - Links */}
          <div className="md:col-span-3">
            <div className="text-koaRed font-bold text-lg mb-4 hidden md:block" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Find, Plan, and Save
            </div>
            <div className="space-y-2">
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOAs in the US</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOAs in Canada</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>Find by Region</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>Find by State/Province</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>All Campgrounds</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>Trip Planner</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>Hot Deals</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
            </div>
          </div>

          {/* Middle Column - Search */}
          <div className="md:col-span-4">
            <div className="text-koaRed font-bold text-lg mb-4 hidden md:block text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Where do you want to go?
            </div>
            <form onSubmit={handleSearch} className="flex gap-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Destination, city, or KOA campground"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-koaRed"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              />
              <button
                type="submit"
                className="bg-koaRed hover:bg-red-800 text-white px-6 py-3 rounded-r-lg font-semibold transition-colors"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              >
                Find
              </button>
            </form>
          </div>

          {/* Right Column - Nearby KOAs */}
          <div className="md:col-span-5 hidden md:block">
            <div className="text-koaRed font-bold text-lg mb-4 text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Nearby KOAs
            </div>
            <p className="text-sm text-gray-600 mb-4 text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              Houston, TX, USA (<a href="#" className="text-koaRed hover:underline">Change location</a>)
            </p>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    <a href="/articles" className="text-gray-700 hover:text-koaRed text-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                      Houston / Med Center KOA Holiday
                    </a>
                  </div>
                  <a href="/articles" className="text-koaRed hover:underline text-sm font-semibold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    Reserve
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Camping at KOA Dropdown
  const CampingAtKOADropdown = () => (
    <div className="absolute top-full left-0 w-full bg-white shadow-2xl border-t-4 border-koaRed mt-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <div className="space-y-2">
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>The KOA Difference</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOA Journey Campgrounds</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOA Holiday Campgrounds</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOA Resort Campgrounds</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KampK9®</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
              <a href="/articles" className="block py-2 text-gray-700 hover:text-koaRed transition-colors flex items-center justify-between group" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                <span>KOA Rewards</span>
                <i className="fas fa-caret-right text-koaRed opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </a>
            </div>
          </div>
          <div className="md:col-span-9 hidden md:grid grid-cols-4 gap-4">
            {[
              { title: "KOA Journey", subtitle: "Gateway to Adventure" },
              { title: "KOA Holiday", subtitle: "Basecamp for the Great Outdoors" },
              { title: "KOA Resort", subtitle: "The Destination for Recreation" },
              { title: "Great Weekends", subtitle: "2 Great Weekends to Save at KOA" },
            ].map((item, i) => (
              <a key={i} href="/articles" className="text-center">
                <div className="bg-gray-200 h-32 rounded mb-2"></div>
                <p className="text-sm text-gray-700" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{item.title}</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{item.subtitle}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const navItems = [
    { label: "Find a Campground", href: "/", hasDropdown: true, dropdown: <FindCampgroundDropdown /> },
    { label: "Camping at KOA", href: "/articles", hasDropdown: true, dropdown: <CampingAtKOADropdown /> },
    { label: "Ways To Stay", href: "/articles", hasDropdown: true },
    { label: "Rewards Program", href: "/articles", hasDropdown: false },
    { label: "Deals", href: "/articles", hasDropdown: true },
    { label: "Resources", href: "/articles", hasDropdown: true },
    { label: "Connect", href: "/articles", hasDropdown: true },
  ];

  return (
    <nav className="relative">
      <ul className="flex flex-col lg:flex-row gap-0 items-start lg:items-center list-none">
        {navItems.map((item) => (
          <li
            key={item.label}
            className="relative group"
            onMouseEnter={() => item.hasDropdown && setActiveDropdown(item.label)}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <NavLink
              to={createPreviewLink(item.href, isPreview)}
              className={({ isActive }) =>
                `px-4 py-3 text-sm md:text-base font-medium text-gray-700 hover:text-koaRed transition-colors flex items-center gap-1 ${
                  isActive ? "text-koaRed" : ""
                }`
              }
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}
              onClick={() => item.hasDropdown && toggleDropdown(item.label)}
            >
              {item.label}
              {item.hasDropdown && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              )}
            </NavLink>
            {item.hasDropdown && activeDropdown === item.label && item.dropdown}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default KOANavigation;

