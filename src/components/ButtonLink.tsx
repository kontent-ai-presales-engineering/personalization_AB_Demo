import React from "react";
import { NavLink, useSearchParams } from "react-router";
import { createPreviewLink } from "../utils/link";

interface ButtonLinkProps {
  href: string;
  children: React.ReactNode;
  style?: "yellow" | "red" | "blue" | "yellow-border" | "transparent";
  className?: string;
}

const ButtonLink: React.FC<ButtonLinkProps> = ({ href, children, style = "yellow", className = "" }) => {
  const [searchParams] = useSearchParams();
  const isPreview = searchParams.get("preview") === "true";

  // KOA Button Styles
  const getButtonClasses = () => {
    const baseClasses = "inline-block px-8 py-3 font-sans-semibold text-base transition-colors duration-200 border-0";
    
    switch (style) {
      case "yellow":
        return `${baseClasses} bg-koaYellow text-black hover:bg-koaYellowDark hover:text-black`;
      case "red":
        return `${baseClasses} bg-koaRed text-white hover:bg-[#b10021] hover:text-white`;
      case "blue":
        return `${baseClasses} bg-koaBlue text-white hover:bg-[#00569b] hover:text-white`;
      case "yellow-border":
        return `${baseClasses} bg-transparent text-white border-2 border-koaYellow hover:text-koaYellow`;
      case "transparent":
      default:
        return `${baseClasses} bg-transparent text-white hover:text-koaYellow`;
    }
  };

  return (
    <NavLink
      to={createPreviewLink(href, isPreview)}
      className={`${getButtonClasses()} ${className}`}
      style={{ fontFamily: '"Gibson SemiBold", Arial, sans-serif', borderRadius: 0 }}
    >
      {children}
    </NavLink>
  );
};

export default ButtonLink;
