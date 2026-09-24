import type { ParameterValues } from "metabase/embedding-sdk/types/dashboard";

/**
 * Source of a parameter-change event:
 * - `initial-state` - first applied snapshot, fired once per dashboard load.
 * - `manual-change` - user edited parameters in UI.
 * - `auto-change` - in the case of auto-updates, e.g. to pass normalized values back to parent.
 *
 * @category Dashboard
 */
export type ParameterChangeSource =
  | "initial-state"
  | "manual-change"
  | "auto-change";

/**
 * Payload passed to `onParametersChange` callback
 *
 * @category Dashboard
 */
export type ParameterChangePayload = {
  source: ParameterChangeSource;
  parameters: ParameterValues;
  defaultParameters: ParameterValues;
  lastUsedParameters: ParameterValues;
};
