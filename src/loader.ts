export type MetabaseGuestEmbedSettings = {
  instanceUrl: string;
  theme?: { preset: "light" | "dark" };
  locale?: string;

  /**
   * Function to get guest embed JWT tokens (iframe only, not applicable for SDK's guest mode).
   * Supports both token refresh on expiry and initial token fetch when no static token is provided.
   * In both cases, this works with guest embed components (metabase-dashboard and metabase-question).
   * It has precedence over guestEmbedProviderUri
   */
  guestEmbedProvider?: GuestTokenProvider;

  /**
   * URL endpoint for fetching and refreshing guest embed JWT tokens (iframe only, not applicable for SDK's guest mode).
   * Supports both token refresh on expiry and initial token fetch when no static token is provided.
   * In both cases, this works with guest embed components (metabase-dashboard and metabase-question).
   * The endpoint should return { jwt: string } with the new token.
   */
  guestEmbedProviderUri?: string;

  pluginsConfig?: {
    /** Callback to handle link clicks. Return { handled: true } to prevent default navigation. */
    handleLink?: (url: string) => { handled: boolean };
  };
};

/**
 * Internal shape of `window.metabaseConfig`. Adds the fields the loader
 * always sets on behalf of the caller, so they don't need to be part of
 * the public config surface. This lib is meant to be used with iframe guest embeds only.
 * Modifications of the paid SDK are not allowed by Metabase.
 */
type InternalMetabaseConfig = MetabaseGuestEmbedSettings & {
  isGuest: true;
};

let loaded = false;

/**
 * Registers the <metabase-dashboard> and <metabase-question> custom elements.
 * Idempotent and SSR-safe: no-op on the server or on subsequent calls.
 *
 * Call this once before rendering any embed element.
 */
export function loadMetabaseEmbed(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;

  // Side-effect import: registers the custom elements and installs the
  // window.metabaseConfig watcher.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require("./frontend/src/metabase/embedding/embedding-iframe-sdk/embed");
}

/**
 * Merges the given config into `window.metabaseConfig` instead of replacing it.
 * Safe to call before or after `loadMetabaseEmbed()`.
 *
 * Always sets `isGuest: true` — this package only supports guest embeds,
 * so the caller never has to (and cannot) opt out.
 */
export function configureMetabaseEmbed(
  config: MetabaseGuestEmbedSettings,
): void {
  if (typeof window === "undefined") return;

  const w = window as unknown as { metabaseConfig?: InternalMetabaseConfig };

  w.metabaseConfig = {
    ...(w.metabaseConfig ?? {}),
    ...config,
    isGuest: true,
  } as InternalMetabaseConfig;
}

export interface GuestTokenProviderContext {
  entityType: "dashboard" | "question";
  entityId?: number | string;
  customContext?: unknown;
  expiredToken?: string;
}

export type GuestTokenProvider = (
  ctx: GuestTokenProviderContext,
) => Promise<{ jwt: string }>;