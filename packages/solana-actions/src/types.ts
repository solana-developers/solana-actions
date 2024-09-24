import type { PublicKey } from "@solana/web3.js";

// re-export all types from the Actions spec
export type {
  ActionError,
  ActionGetRequest,
  ActionsJson,
  ActionGetResponse,
  LinkedAction,
  ActionPostRequest,
  ActionPostResponse,
  ActionParameter,
  ActionRuleObject,
  SupportedProtocols,
  SOLANA_PAY_PROTOCOL,
  SOLANA_ACTIONS_PROTOCOL,
  NextActionPostRequest,
  Action,
  ActionParameterType,
  ActionParameterSelectable,
  ActionType,
  CompletedAction,
  NextAction,
  NextActionLink,
  PostNextActionLink,
  InlineNextActionLink,
} from "@solana/actions-spec";

/** `reference` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
export type Reference = PublicKey;

/** `memo` in the [Solana Pay spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
export type Memo = string;

/**
 * Fields of a Solana Action transaction request URL.
 */
export interface ActionRequestURLFields {
  /** `link` in the Solana Action spec */
  link: URL;
  /** `label` in the Solana Action spec */
  label?: string;
  /** `message` in the Solana Action spec  */
  message?: string;
}

/**
 * Fields of a blink URL to support a Solana Action.
 */
export interface BlinkURLFields {
  /** base URL for the `blink` in the Solana Action spec */
  blink: URL;
  /** `action` passed via the blink `action` query param */
  action: ActionRequestURLFields;
}
