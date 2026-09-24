# Metabase Guest Embed

An independently maintained build of the Metabase Guest Embed web
components.

This project is based on source code from the Metabase open-source
project and is intended to provide a standalone, customizable build for
Metabase Guest Embeds.

## Components

The build provides two custom elements:

- `<metabase-dashboard>`
- `<metabase-question>`

They can be loaded either as an npm package (recommended) or as a
standalone `embed.js` script.

---

## Install

```bash
npm install custom-metabase-embed-js
# or
yarn add custom-metabase-embed-js
# or
pnpm add custom-metabase-embed-js
```

---

## Usage (npm package)

The package exposes two functions:

- `configureMetabaseEmbed(config)` — merges the given config into
  `window.metabaseConfig`. Safe to call before or after loading.
- `loadMetabaseEmbed()` — registers the `<metabase-dashboard>` and
  `<metabase-question>` custom elements. Idempotent and SSR-safe.

Call `configureMetabaseEmbed` first so the embed picks up your settings
when it initializes, then call `loadMetabaseEmbed`.

```ts
import {
  loadMetabaseEmbed,
  configureMetabaseEmbed,
} from "custom-metabase-embed-js";

configureMetabaseEmbed({
  instanceUrl: "https://metabase.example.com",
  guestEmbedProviderUri: "/api/metabase-guest-token",
});

loadMetabaseEmbed();
```

Then render the element anywhere in your app:

```html
<metabase-dashboard dashboard-id="42"></metabase-dashboard>
```

### React

Because the custom elements are registered globally, you can render them
directly once `loadMetabaseEmbed()` has run:

```tsx
import { useEffect } from "react";
import {
  loadMetabaseEmbed,
  configureMetabaseEmbed,
} from "custom-metabase-embed-js";

export function App() {
  useEffect(() => {
    configureMetabaseEmbed({
      instanceUrl: "https://metabase.example.com",
      guestEmbedProviderUri: "/api/metabase-guest-token",
    });
    loadMetabaseEmbed();
  }, []);

  return <metabase-dashboard dashboard-id="42" />;
}
```

For the JSX intrinsic element to type-check, add this once (e.g. in a
`global.d.ts`):

```ts
declare namespace React {
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
      "metabase-question": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        token?: string;
        "question-id"?: string;
        "with-title"?: string;
        "sql-parameters"?: string;
        "initial-sql-parameters"?: string;
        "custom-context"?: string;
      };
    }
  }
}
```

---

## Usage (script tag)

If you can't use a bundler, load the standalone bundle with a `<script>`
tag and configure the embed via `window.metabaseConfig`:

```html
<script defer src="https://unpkg.com/custom-metabase-embed-js/dist/metabase/embed.js"></script>

<script>
  window.metabaseConfig = {
    isGuest: true,
    instanceUrl: "https://metabase.example.com",
    guestEmbedProviderUri: "/api/metabase-guest-token",
  };
</script>

<metabase-dashboard dashboard-id="42"></metabase-dashboard>
```

> Do **not** load both the npm package and the `<script>` bundle on the
> same page — they both register the same custom elements and the browser
> will throw on the second registration.

---

## Configuration

```ts
export interface MetabaseGuestEmbedSettings {
  /** Base URL of the Metabase instance. */
  instanceUrl: string;

  /** UI theme preset. */
  theme?: { preset: "light" | "dark" };

  /** Locale for the embed UI. */
  locale?: string;

  /** Function used to fetch and refresh guest JWTs. Takes precedence over `guestEmbedProviderUri`. */
  guestEmbedProvider?: GuestTokenProvider;

  /** Endpoint used to fetch and refresh guest JWTs. */
  guestEmbedProviderUri?: string;

  /** Custom link handling, etc. */
  pluginsConfig?: {
    /** Return `{ handled: true }` to prevent default navigation. */
    handleLink?: (url: string) => { handled: boolean };
  };
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `instanceUrl` | `string` | yes | Base URL of the Metabase instance. |
| `theme` | `{ preset: "light" \| "dark" }` | no | UI theme preset. |
| `locale` | `string` | no | Locale for the embed UI. |
| `guestEmbedProviderUri` | `string` | no | Endpoint used to fetch and refresh guest JWTs. |
| `guestEmbedProvider` | `GuestTokenProvider` | no | Function used to fetch and refresh guest JWTs. Takes precedence over `guestEmbedProviderUri`. |
| `pluginsConfig` | `{ handleLink?: (url) => { handled: boolean } }` | no | Custom link handling. |

---

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

### `guestEmbedProvider`

`guestEmbedProvider` is a function that receives a single context object
and must return a promise resolving to `{ jwt: string }`:

```ts
export interface GuestTokenProviderContext {
  entityType: "dashboard" | "question";
  entityId?: number | string;
  customContext?: unknown;
  expiredToken?: string;
}

export type GuestTokenProvider = (
  ctx: GuestTokenProviderContext,
) => Promise<{ jwt: string }>;
```

- `entityType` — derived from the component (`metabase-dashboard` →
  `"dashboard"`, anything else → `"question"`).
- `entityId` — the `dashboard-id` / `question-id` attribute when set,
  otherwise the resource ID decoded from `expiredToken`.
- `customContext` — the element's `custom-context` attribute, parsed as
  JSON if it's a stringified value. Also settable via the
  `custom-context` JS property.
- `expiredToken` — only present on refresh calls.

### Example — npm package

```ts
import {
  loadMetabaseEmbed,
  configureMetabaseEmbed,
  type GuestTokenProvider,
} from "custom-metabase-embed-js";

const guestEmbedProvider: GuestTokenProvider = async ({
  entityType,
  entityId,
  customContext,
  expiredToken,
}) => {
  const response = await fetch("/api/metabase-guest-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType, entityId, customContext, expiredToken }),
  });
  return response.json(); // { jwt: "..." }
};

configureMetabaseEmbed({
  instanceUrl: "https://metabase.example.com",
  guestEmbedProvider,
});

loadMetabaseEmbed();
```

```html
<metabase-dashboard
  dashboard-id="42"
  custom-context='{"tenant":"acme"}'
></metabase-dashboard>
```

### Example — script tag

```html
<script defer src="https://unpkg.com/custom-metabase-embed-js/dist/metabase/embed.js"></script>

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

In both setups you don't need to set a `token` attribute — the embed
fetches an initial token automatically, and refreshes it as it expires.

### Error handling

If the provider fails or returns an invalid response, the embed reports
an authentication error to the iframe and mounts the component without a
token so the error can be displayed.

---

## API

### `configureMetabaseEmbed(config)`

Merges the given config into `window.metabaseConfig`. Does not replace
existing keys. Safe to call before or after `loadMetabaseEmbed()`.

### `loadMetabaseEmbed()`

Registers the `<metabase-dashboard>` and `<metabase-question>` custom
elements. Idempotent — calling it multiple times is a no-op. SSR-safe —
no-op on the server.

### Component attributes

`<metabase-dashboard>`:

| Attribute | Description |
|---|---|
| `dashboard-id` | Metabase dashboard ID. Required unless a `token` is provided. |
| `token` | Static JWT. Optional when a guest token provider is configured. |
| `with-title` | Show the dashboard title. `"true"` / `"false"`. |
| `with-downloads` | Enable downloads. `"true"` / `"false"`. |
| `auto-refresh-interval` | Auto-refresh interval in seconds. |
| `initial-parameters` | JSON string of initial parameter values. |
| `parameters` | JSON string of controlled parameter values. |
| `custom-context` | JSON string forwarded to the guest token provider. |

`<metabase-question>`:

| Attribute | Description |
|---|---|
| `question-id` | Metabase question ID. Required unless a `token` is provided. |
| `token` | Static JWT. Optional when a guest token provider is configured. |
| `with-title` | Show the question title. `"true"` / `"false"`. |
| `with-downloads` | Enable downloads. `"true"` / `"false"`. |
| `initial-sql-parameters` | JSON string of initial SQL parameter values. |
| `sql-parameters` | JSON string of controlled SQL parameter values. |
| `custom-context` | JSON string forwarded to the guest token provider. |

---
