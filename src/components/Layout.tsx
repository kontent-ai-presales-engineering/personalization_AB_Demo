import { FC, PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";
import { Outlet, ScrollRestoration } from "react-router-dom";
import { SmartLinkContextComponent } from "../context/SmartLinkContext";
import { AppContextComponent } from "../context/AppContext";
import PersonalizationDebug from "./PersonalizationDebug";
import PersonaSelector from "./PersonaSelector";

const Layout: FC<PropsWithChildren> = () => (
  <AppContextComponent>
    <SmartLinkContextComponent>
      <div className="flex flex-col min-h-screen bg-darkGreen">
        <ScrollRestoration getKey={location => location.pathname} />
        <Header />
        <Outlet />
        <Footer />
        <PersonalizationDebug />
        <PersonaSelector />
      </div>
    </SmartLinkContextComponent>
  </AppContextComponent>
);

export default Layout;
