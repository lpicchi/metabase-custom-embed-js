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

        "metabase-question": React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement>,
          HTMLElement
        > & {
          token?: string;
          "question-id"?: string;
          "with-title"?: string;
          "with-downloads"?: string;
          "with-alerts"?: string;
          "initial-sql-parameters"?: string;
          "sql-parameters"?: string;
          "custom-context"?: string;
        };
      }
    }
  }
}

export {};