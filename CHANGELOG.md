# Changelog

All notable changes to this project are documented in this file.
## [v1.0.3] - 2026-09-30

### Fixed

- Use a `.invalid` TLD (RFC 2606) for `GUEST_EMBED_PROVIDER_SENTINEL_URI`,
  ensuring the sentinel can never accidentally resolve if a future upstream
  change ever fetches it
  ([7513962](https://github.com/lpicchi/metabase-custom-embed-js/commit/7513962e762c16ece35824f2f7bac5106782f639)).

## [v1.0.2] - 2026-09-30

### Fixed

- Inject `GUEST_EMBED_PROVIDER_SENTINEL_URI` into `window.metabaseConfig`
  when only `guestEmbedProvider` is configured, bypassing upstream SDK
  checks that require `guestEmbedProviderUri` to be truthy
  ([840f891](https://github.com/lpicchi/metabase-custom-embed-js/commit/840f891c355424cb3e0699f07bc191ed5fd90e16)).

  The mainstream SDK's `refreshGuestSession` guard
  `if (authConfig.isGuest && !authConfig.guestEmbedProviderUri)`
  rejects any guest embed config without a `guestEmbedProviderUri`
  and silently skips the provider when only the function form is set - 
  leaving the iframe to fail with *"Token Expired"* after initial token expires.

  Normalization now runs inside `embed.ts`'s config watcher, on both the
  initial read and every assignment to `window.metabaseConfig`, so itS
  applies to both entry points:

  - **npm package** — via `loadMetabaseEmbed()`, which evaluates `embed.ts`.
  - **script tag** — via `embed.js`, which installs the watcher on load.

  `_callGuestTokenProvider` still prefers `guestEmbedProvider` at call time,
  so the sentinel URI is never fetched.

[v1.0.2]: https://github.com/lpicchi/metabase-custom-embed-js/releases/tag/v1.0.2