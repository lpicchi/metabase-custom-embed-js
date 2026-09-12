import { createContext, useContext, useEffect, useState } from "react";

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "metabase-dashboard": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          token?: string;
          "dashboard-id"?: string;
          "with-title"?: string;
          "with-downloads"?: string;
          "auto-refresh-interval"?: number;
          "initial-parameters"?: string;
          parameters?: string;
          "custom-context"?: string;
        };
      }
    }
  }
}

declare global {
  interface Window {
    metabaseConfig?: {
      isGuest: boolean;
      instanceUrl: string;
      guestEmbedProviderUri?: string;
      locale?: string;
    };
  }
}

export type GuestTokenProviderResponse = { jwt: string };

export type GuestTokenProvider = (context: {
  entityType: "dashboard" | "question";
  entityId?: number;
  customContext?: unknown;
  expiredToken?: string;
}) => Promise<GuestTokenProviderResponse>;

export type MetabaseEmbedState =
  | { status: "loading" }
  | { status: "ready" }
  | { status: "error"; error: Error };

// `null` means "no provider in the tree".
const MetabaseEmbedContext = createContext<MetabaseEmbedState | null>(null);

export function useMetabaseEmbed(): MetabaseEmbedState | null {
  return useContext(MetabaseEmbedContext);
}

const METABASE_INSTANCE_URL = 'https://your-metabase-instance.com';
// URL to the custom Metabase Guest embed.js script, falls back to the default instance URL if not provided.
const METABASE_CUSTOM_EMBED_JS_URL = 'https://your-custom-cdn.com/metabase/embed.js';

/**
 * Strict variant — throws if used outside the provider.
 * Useful for components that must not render without embed config.
 */
export function useMetabaseEmbedOrThrow(): MetabaseEmbedState {
  const value = useContext(MetabaseEmbedContext);
  if (value === null) {
    throw new Error(
      "useMetabaseEmbedOrThrow must be used inside <ComarbMetabaseEmbedProvider>."
    );
  }
  return value;
}

let embedScriptPromise: Promise<void> | null = null;

function loadMetabaseEmbedScript() {
  if (embedScriptPromise) return embedScriptPromise;

  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  embedScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      "metabase-embed-script"
    ) as HTMLScriptElement | null;

    if (existing) {
      if (window.customElements?.get("metabase-dashboard")) {
        resolve();
        return;
      }

      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Metabase embed script")),
        { once: true }
      );
      return;
    }

    const script = document.createElement("script");
    script.id = "metabase-embed-script";
    script.src = METABASE_CUSTOM_EMBED_JS_URL ?? `${METABASE_INSTANCE_URL}/app/embed.js`;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error("Failed to load Metabase embed script"));

    document.head.appendChild(script);
  });

  return embedScriptPromise;
}

export interface MetabaseEmbedProviderProps {
  children: React.ReactNode;

  /**
   * Only works when providing a proper custom `embed.js` using `METABASE_CUSTOM_EMBED_JS_URL`
   */
  guestEmbedProvider?: GuestTokenProvider;
  guestEmbedProviderUri?: string;
}

function MetabaseEmbedProvider({
  children,
  guestEmbedProvider,
  guestEmbedProviderUri,
}: MetabaseEmbedProviderProps) {
  const [state, setState] = useState<MetabaseEmbedState>({
    status: "loading",
  });

  useEffect(() => {
    let cancelled = false;

    loadMetabaseEmbedScript()
      .then(() => {
        if (cancelled) return;

        window.metabaseConfig = {
          ...(window.metabaseConfig ?? {}),
          isGuest: true,
          instanceUrl: METABASE_INSTANCE_URL,
          ...(guestEmbedProviderUri ? { guestEmbedProviderUri } : {}),
          ...(METABASE_CUSTOM_EMBED_JS_URL && guestEmbedProvider
            ? { guestEmbedProvider }
            : {}),
        };

        setState({ status: "ready" });
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setState({ status: "error", error });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [guestEmbedProvider, guestEmbedProviderUri]);

  return (
    <MetabaseEmbedContext.Provider value={state}>
      {children}
    </MetabaseEmbedContext.Provider>
  );
}

export default MetabaseEmbedProvider;
