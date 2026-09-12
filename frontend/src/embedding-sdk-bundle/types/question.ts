import type { ParameterValues } from "metabase/embedding-sdk/types/dashboard";

export type EntityTypeFilterKeys = "table" | "model";

export type SqlParameterValues = Record<
  string,
  | string
  | number
  | boolean
  | Array<string | number | boolean | null>
  | null
  | undefined
>;

/**
 * Source of a sql-parameter-change event:
 * - `initial-state` - first applied state, fired once per question load.
 * - `manual-change` - user edited parameters in UI.
 * - `auto-change` - in the case of auto-updates, e.g. to pass normalized values back to parent.
 *
 * @category InteractiveQuestion
 */
export type SqlParameterChangeSource =
  | "initial-state"
  | "manual-change"
  | "auto-change";

/**
 * Payload passed to `onSqlParametersChange` callback
 *
 * @category InteractiveQuestion
 */
export type SqlParameterChangePayload = {
  source: SqlParameterChangeSource;
  parameters: ParameterValues;
  defaultParameters: ParameterValues;
};
