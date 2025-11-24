import { FC } from "react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import Divider from "./Divider";

const Footer: FC = () => (
  <footer className="w-full bg-koaGray-dark text-white">
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
      <div className="flex flex-col items-center gap-10 mb-10">
        <Logo />
        <Navigation variant="footer" />
      </div>
      <Divider variant="dark" />
      <div className="text-center py-8">
        <p className="text-sm text-koaGray-light font-sans" style={{ fontFamily: '"Gibson Regular", Arial, sans-serif' }}>
          This is a demo site built with Kontent.ai and React.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
