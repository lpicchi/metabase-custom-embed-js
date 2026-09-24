import { createContext, useContext, useEffect, useState } from "react";
import {
  loadMetabaseEmbed,
  configureMetabaseEmbed,
  type MetabaseGuestEmbedSettings,
} from "custom-metabase-embed-js";

export type MetabaseEmbedState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; error: Error };

const MetabaseEmbedContext = createContext<MetabaseEmbedState | null>(null);

export function useMetabaseEmbed(): MetabaseEmbedState | null {
  return useContext(MetabaseEmbedContext);
}

export interface MetabaseEmbedProviderProps extends Omit<MetabaseGuestEmbedSettings, "isGuest"> {
  children: React.ReactNode;
}

function MetabaseEmbedProvider({
  children,
  instanceUrl,
  theme,
  locale,
  guestEmbedProvider,
  guestEmbedProviderUri,
  pluginsConfig,
}: MetabaseEmbedProviderProps) {
  const [state, setState] = useState<MetabaseEmbedState>({ status: "loading" });

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      configureMetabaseEmbed({
        instanceUrl,
        ...(theme ? { theme } : {}),
        ...(locale ? { locale } : {}),
        ...(guestEmbedProviderUri ? { guestEmbedProviderUri } : {}),
        ...(guestEmbedProvider ? { guestEmbedProvider } : {}),
        ...(pluginsConfig ? { pluginsConfig } : {}),
      });

      loadMetabaseEmbed();

      setState({ status: "ready" });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [
    instanceUrl,
    theme,
    locale,
    guestEmbedProvider,
    guestEmbedProviderUri,
    pluginsConfig,
  ]);

  return (
    <MetabaseEmbedContext.Provider value={state}>
      {children}
    </MetabaseEmbedContext.Provider>
  );
}

export default MetabaseEmbedProvider;