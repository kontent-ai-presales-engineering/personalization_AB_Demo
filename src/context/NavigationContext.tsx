import { createContext, FC, PropsWithChildren, useContext, useState, useCallback } from "react";

export type NavigationItem = {
  name: string;
  link: string;
};

type NavigationContextType = {
  navigationItems: NavigationItem[] | null;
  setNavigationItems: (items: NavigationItem[] | null) => void;
};

const NavigationContext = createContext<NavigationContextType>({
  navigationItems: null,
  setNavigationItems: () => {},
});

export const useNavigationContext = () => useContext(NavigationContext);

export const NavigationContextComponent: FC<PropsWithChildren> = ({ children }) => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[] | null>(null);

  const handleSetNavigationItems = useCallback((items: NavigationItem[] | null) => {
    setNavigationItems(items);
  }, []);

  return (
    <NavigationContext.Provider
      value={{
        navigationItems,
        setNavigationItems: handleSetNavigationItems,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

