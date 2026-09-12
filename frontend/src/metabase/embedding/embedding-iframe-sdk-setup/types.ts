import type {
  DashboardEmbedOptions,
  QuestionEmbedOptions,
} from "metabase/embedding/embedding-iframe-sdk/types/embed";

export type SdkIframeDashboardEmbedSettings = DashboardEmbedOptions & {
  lockedParameters?: string[];
};

export type SdkIframeQuestionEmbedSettings = QuestionEmbedOptions & {
  lockedParameters?: string[];
};