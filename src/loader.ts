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
 * Safe to call before or after loadMetabaseEmbed().
 */
export function configureMetabaseEmbed(
  config: Record<string, unknown>,
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { metabaseConfig?: Record<string, unknown> };
  w.metabaseConfig = { ...(w.metabaseConfig ?? {}), ...config };
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