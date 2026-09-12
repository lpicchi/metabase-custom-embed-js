# Metabase Guest Embed

An independently maintained build of the Metabase Guest Embed web
components.

This project is based on source code from the Metabase open-source
project and is intended to provide a standalone, customizable
`embed.js` build for Metabase Guest Embeds.

## Components

The generated `embed.js` provides:

- `<metabase-dashboard>`
- `<metabase-question>`

## Usage

```html
<script defer src="https://example.com/embed.js"></script>

<script>
  window.metabaseConfig = {
    isGuest: true,
    instanceUrl: "https://metabase.example.com"
  };
</script>

<metabase-dashboard
  token="..."
></metabase-dashboard>
```

## Guest token providers

Guest embeds authenticate with a signed JWT. Instead of hardcoding a
`token` attribute, you can configure the embed to fetch (and refresh)
tokens dynamically. Two options are supported, and they work for both
`<metabase-dashboard>` and `<metabase-question>`:

- `guestEmbedProviderUri` — POST to an endpoint that returns `{ jwt }`.
- `guestEmbedProvider` — a JS function that returns `Promise<{ jwt }>`.

Both cover the same two flows:

1. **Initial token fetch** — used when no static `token` attribute is
   set on the element. The embed calls the provider once the iframe is
   ready, then passes the returned token to the iframe.
2. **Token refresh** — when the current guest token expires, the embed
   calls the provider again so you can issue a replacement.

If both are set, `guestEmbedProvider` takes precedence over
`guestEmbedProviderUri`.

### `guestEmbedProviderUri`

`guestEmbedProviderUri` is resolved relative to `window.location.origin`
and receives a `POST` request with a JSON body:

```json
{
  "entityType": "dashboard",
  "entityId": 42,
  "customContext": { "tenant": "acme" }
}
```

`entityId` is omitted if the resource ID isn't known (for example, when
the token is refreshed and no `dashboard-id` / `question-id` attribute
is set — the embed falls back to decoding the expired token). The
`customContext` field is only included when a value is present.

The endpoint must respond with:

```json
{ "jwt": "eyJhbGciOi..." }
```

The request is sent with `credentials: "include"`, and the query
parameter `response=json` is appended to the URL.

### `guestEmbedProvider` (NEW)

`guestEmbedProvider` is a function you define on
`window.metabaseConfig`. It receives a single context object and must
return a promise resolving to `{ jwt: string }`:

```ts
type GuestTokenProvider = (context: {
  entityType: "dashboard" | "question";
  entityId?: number;
  customContext?: unknown;
  expiredToken?: string;
}) => Promise<{ jwt: string }>;
```

- `entityType` — derived from the component (`metabase-dashboard` →
  `"dashboard"`, anything else → `"question"`).
- `entityId` — the `dashboard-id` / `question-id` attribute when set,
  otherwise the resource ID decoded from `expiredToken`.
- `customContext` — the element's `custom-context` attribute, parsed as
  JSON if it's a stringified value. Also settable via the
  `custom-context` JS property.
- `expiredToken` — only present on refresh calls.

### Example

```html
<script defer src="https://example.com/embed.js"></script>

<script>
  window.metabaseConfig = {
    isGuest: true,
    instanceUrl: "https://metabase.example.com",
    guestEmbedProvider: async ({ entityType, entityId, customContext, expiredToken }) => {
      const response = await fetch("/api/metabase-guest-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entityType, entityId, customContext, expiredToken }),
      });
      return response.json(); // { jwt: "..." }
    },
  };
</script>

<metabase-dashboard
  dashboard-id="42"
  custom-context='{"tenant":"acme"}'
></metabase-dashboard>
```

In this setup you don't need to set a `token` attribute — the embed
fetches an initial token automatically, and refreshes it as it expires.

### Error handling

If the provider fails or returns an invalid response, the embed reports
an authentication error to the iframe and mounts the component without a
token so the error can be displayed.