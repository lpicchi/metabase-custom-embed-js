import {
  createElement,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useMetabaseEmbed } from "./MetabaseEmbedProvider";


/* --------------------------- Constants --------------------------- */

const DEFAULT_MIN_HEIGHT = 600;

const PROVIDER_MISSING_ERROR = new Error(
  "MetabaseDashboard must be rendered inside <MetabaseEmbedProvider>. " +
    "Wrap your component tree with the provider.",
);

/* ----------------------------- Props ----------------------------- */

export interface MetabaseDashboardProps {
  dashboardId?: number | string;
  token?: string;
  initialParameters?: Record<string, unknown>;
  parameters?: Record<string, unknown>;
  customContext?: string | Record<string, unknown>;
  withTitle?: boolean;
  withDownloads?: boolean;
  autoRefreshInterval?: number;
  minHeight?: number | string;
  className?: string;
  style?: CSSProperties;
  loadingFallback?: ReactNode;
  errorFallback?: (error: Error) => ReactNode;
}

/* ---------------------------- Helpers ---------------------------- */

const containerBaseStyle: CSSProperties = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

function Spinner() {
  return (
    <svg width={32} height={32} viewBox="0 0 32 32" role="status" aria-label="Loading">
      <circle cx={16} cy={16} r={14} fill="none" stroke="#e0e0e0" strokeWidth={3} />
      <path
        d="M16 2 a14 14 0 0 1 14 14"
        fill="none"
        stroke="#1976d2"
        strokeWidth={3}
        strokeLinecap="round"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 16 16"
          to="360 16 16"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

function SkeletonBar({ width }: { width: string }) {
  return (
    <div
      style={{
        width,
        height: 8,
        borderRadius: 4,
        background: "#e0e0e0",
      }}
    />
  );
}

function ErrorShell({
  error,
  minHeight,
  style,
  className,
  errorFallback,
}: {
  error: Error;
  minHeight: number | string;
  style?: CSSProperties;
  className?: string;
  errorFallback?: (error: Error) => ReactNode;
}) {
  return (
    <div
      className={className}
      style={{
        ...containerBaseStyle,
        minHeight,
        padding: 16,
        ...style,
      }}
    >
      {errorFallback ? (
        errorFallback(error)
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 4,
          }}
        >
          <span style={{ color: "#d32f2f", fontWeight: 600 }}>
            Failed to load Metabase
          </span>
          <span style={{ color: "#666", fontSize: 14 }}>{error.message}</span>
        </div>
      )}
    </div>
  );
}

/* --------------------------- Component --------------------------- */

export function MetabaseDashboard({
  dashboardId,
  token,
  initialParameters,
  parameters,
  customContext,
  withTitle = false,
  withDownloads = false,
  autoRefreshInterval,
  minHeight = DEFAULT_MIN_HEIGHT,
  className,
  style,
  loadingFallback,
  errorFallback,
}: MetabaseDashboardProps) {
  const embed = useMetabaseEmbed();

  // Provider missing → misconfiguration.
  if (embed === null) {
    console.error(PROVIDER_MISSING_ERROR.message);
    return (
      <ErrorShell
        error={PROVIDER_MISSING_ERROR}
        minHeight={minHeight}
        style={style}
        className={className}
        errorFallback={errorFallback}
      />
    );
  }

  if (embed.status === "error" && embed.error) {
    return (
      <ErrorShell
        error={embed.error}
        minHeight={minHeight}
        style={style}
        className={className}
        errorFallback={errorFallback}
      />
    );
  }

  if (embed.status === "loading") {
    return (
      <div
        className={className}
        style={{
          ...containerBaseStyle,
          minHeight,
          ...style,
        }}
      >
        {loadingFallback ?? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              width: "100%",
              maxWidth: 480,
            }}
          >
            <Spinner />
            <SkeletonBar width="100%" />
            <SkeletonBar width="80%" />
          </div>
        )}
      </div>
    );
  }

  // Ready → render the custom element.
  const initialParametersJson = initialParameters
    ? JSON.stringify(initialParameters)
    : undefined;

  const parametersJson = parameters ? JSON.stringify(parameters) : undefined;

  const customContextValue =
    typeof customContext === "string"
      ? customContext
      : customContext
        ? JSON.stringify(customContext)
        : undefined;

  const attrs: Record<string, unknown> = {
    "with-title": String(withTitle),
    "with-downloads": String(withDownloads),
  };

  if (dashboardId !== undefined && dashboardId !== null && dashboardId !== "") {
    attrs["dashboard-id"] = String(dashboardId);
  }
  if (token) attrs["token"] = token;
  if (autoRefreshInterval !== undefined) attrs["auto-refresh-interval"] = autoRefreshInterval;
  if (initialParametersJson) attrs["initial-parameters"] = initialParametersJson;
  if (parametersJson) attrs["parameters"] = parametersJson;
  if (customContextValue) attrs["custom-context"] = customContextValue;

  return (
    <div
      className={className}
      style={{
        width: "100%",
        minHeight,
        ...style,
      }}
    >
      {createElement("metabase-dashboard", {
        ...attrs,
        style: {
          display: "block",
          width: "100%",
          height: "100%",
        },
      })}
    </div>
  );
}

export default MetabaseDashboard;