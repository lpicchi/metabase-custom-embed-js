# Changelog

All notable changes to this project are documented in this file.

## [v1.0.2] - 2026-09-30

### Fixed

- Inject `GUEST_EMBED_PROVIDER_SENTINEL_URI` into `window.metabaseConfig`
  when only `guestEmbedProvider` is configured, bypassing upstream SDK
  checks that require `guestEmbedProviderUri` to be truthy
  ([840f891](https://github.com/lpicchi/metabase-custom-embed-js/commit/840f891c355424cb3e0699f07bc191ed5fd90e16)).

  The SDK's `refreshGuestSession` guard rejects any guest embed config
  without a `guestEmbedProviderUri`, and `embed.js`'s initial-fetch trigger
  (`if (guestEmbedProviderUri && !token)`) silently skips the provider when
  only the function form is set — leaving the iframe to fail with
  *"This component does not support guest embeds"*.

  Normalization now runs inside `embed.ts`'s config watcher, on both the
  initial read and every assignment to `window.metabaseConfig`, so it
  applies to both entry points:

  - **npm package** — via `loadMetabaseEmbed()`, which evaluates `embed.ts`.
  - **script tag** — via `embed.js`, which installs the watcher on load.

  `_callGuestTokenProvider` still prefers `guestEmbedProvider` at call time,
  so the sentinel URI is never fetched. The sentinel uses the reserved
  `.invalid` TLD (RFC 2606) so any accidental request fails fast instead of
  resolving to something unexpected.

[v1.0.2]: https://github.com/lpicchi/metabase-custom-embed-js/releases/tag/v1.0.2