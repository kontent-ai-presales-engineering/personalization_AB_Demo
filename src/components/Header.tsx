import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Logo from "./Logo";
import Navigation from "./Navigation";

const Header: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-black sticky top-0 z-50">
      {/* Main Navigation Bar - KOA Style */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between" style={{ paddingTop: '6px', paddingBottom: '6px', minHeight: '52px' }}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center flex-1 justify-center">
            <Navigation />
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Login Button - Mobile */}
            <Link
              to="/?preview=true"
              className="lg:hidden px-4 py-2 text-sm text-white hover:text-koaYellow transition-colors font-sans-semibold"
            >
              Login
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-white hover:text-koaYellow transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 py-4">
            <Navigation variant="header" />
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
