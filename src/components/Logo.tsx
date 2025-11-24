import { FC } from "react";
import { Link } from "react-router-dom";

const Logo: FC = () => (
  <Link to="/?preview=true" className="flex items-center">
    <img 
      src="/KOA_campgrounds_logo.svg.png"
      alt="KOA Campgrounds Logo"
      className="h-12 md:h-16 object-contain"
    />
  </Link>
);

export default Logo;