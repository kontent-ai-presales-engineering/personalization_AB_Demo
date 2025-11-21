import { useSuspenseQuery } from "@tanstack/react-query";
import { createContext, FC, PropsWithChildren, useContext } from "react";
import { useParams } from "react-router-dom";

type AppContext = {
  environmentId: string;
  apiKey: string;
  collection: string;
};

const defaultAppContext: AppContext = {
  environmentId: import.meta.env.VITE_ENVIRONMENT_ID!,
  apiKey: import.meta.env.VITE_DELIVERY_API_KEY!,
  collection: import.meta.env.VITE_COLLECTION!,
};

// Debug logging to verify environment variables are loaded correctly
if (typeof window !== 'undefined') {
  console.log('🔍 AppContext Environment Variables:', {
    environmentId: import.meta.env.VITE_ENVIRONMENT_ID,
    hasApiKey: !!import.meta.env.VITE_DELIVERY_API_KEY,
    collection: import.meta.env.VITE_COLLECTION,
    mode: import.meta.env.MODE,
    allEnvVars: Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')),
  });
}

const AppContext = createContext<AppContext>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppContextComponent: FC<PropsWithChildren> = ({ children }) => {
  const { envId } = useParams();

  const contextData = useSuspenseQuery({
    queryKey: [`env-data${envId ? `-${envId}` : ""}`],
    queryFn: () => {
      const context = !envId ? defaultAppContext : {
        environmentId: envId,
        apiKey: import.meta.env.VITE_DELIVERY_API_KEY!,
        collection: import.meta.env.VITE_COLLECTION!,
      };
      
      // Debug logging
      if (typeof window !== 'undefined') {
        console.log('🔍 AppContext Data:', {
          environmentId: context.environmentId,
          collection: context.collection,
          hasApiKey: !!context.apiKey,
          source: envId ? 'URL param' : 'default',
        });
      }
      
      return context;
    },
  });

  return (
    <AppContext.Provider value={contextData.data}>
      {children}
    </AppContext.Provider>
  );
};
