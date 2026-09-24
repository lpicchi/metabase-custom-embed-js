import MetabaseEmbedProvider from "./MetabaseEmbedProvider";
import MetabaseDashboard from "./MetabaseDashboard";
import type { GuestTokenProvider } from "custom-metabase-embed-js";

// Define outside the component so the reference is stable across renders.
const guestEmbedProvider: GuestTokenProvider = async ({
  entityType,
  entityId,
  customContext,
  expiredToken,
}) => {
  const res = await fetch("/api/metabase-guest-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ entityType, entityId, customContext, expiredToken }),
  });

  if (!res.ok) {
    throw new Error(`Guest token endpoint failed: ${res.status}`);
  }

  return res.json(); // { jwt: string }
};

export default function App() {
  return (
    <MetabaseEmbedProvider
      instanceUrl="https://metabase.example.com"
      guestEmbedProvider={guestEmbedProvider}
      theme={{ preset: "dark" }}
      locale="en"
    >
      <MetabaseDashboard
        dashboardId={42}
        withTitle
        withDownloads
        minHeight={720}
        customContext={{ tenant: "acme" }}
      />
    </MetabaseEmbedProvider>
  );
}