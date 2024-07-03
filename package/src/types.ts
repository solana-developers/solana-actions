import type { PublicKey } from "@solana/web3.js";
import {
  SOLANA_ACTIONS_PROTOCOL,
  SOLANA_ACTIONS_PROTOCOL_PLURAL,
  SOLANA_PAY_PROTOCOL,
} from "./constants.js";

/** `reference` in the [Solana Actions spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#reference). */
export type Reference = PublicKey;

/** `memo` in the [Solana Actions spec](https://github.com/solana-labs/solana-pay/blob/master/SPEC.md#memo). */
export type Memo = string;

/** @internal */
export type SupportedProtocols =
  | typeof SOLANA_ACTIONS_PROTOCOL
  | typeof SOLANA_PAY_PROTOCOL
  | typeof SOLANA_ACTIONS_PROTOCOL_PLURAL;

/**
 *
 */
export interface ActionsJson {
  rules: ActionRuleObject[];
}

/**
 *
 */
export interface ActionRuleObject {
  /** relative (preferred) or absolute path to perform the rule mapping from */
  pathPattern: string;
  /** relative (preferred) or absolute path that supports Action requests */
  apiPath: string;
}

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

/**  */

/**
 * # Reserved for future use
 *
 * Response body payload sent via the Action GET Request
 */
export interface ActionGetRequest {}

/**
 * Response body payload returned from the Action GET Request
 */
export interface ActionGetResponse {
  /** image url that represents the source of the action request */
  icon: string;
  /** describes the source of the action request */
  title: string;
  /** brief summary of the action to be performed */
  description: string;
  /** button text rendered to the user */
  label: string;
  /** UI state for the button being rendered to the user */
  disabled?: boolean;
  /**  */
  links?: {
    /** list of related Actions a user could perform */
    actions: LinkedAction[];
  };
  /** non-fatal error message to be displayed to the user */
  error?: ActionError;
}

/**
 * Related action on a single endpoint
 */
export interface LinkedAction {
  /** URL endpoint for an action */
  href: string;
  /** button text rendered to the user */
  label: string;
  /** parameters used to accept user input within an action */
  parameters?: ActionParameter[];
}

/**
 * Parameter to accept user input within an action
 */
export interface ActionParameter {
  /** parameter name in url */
  name: string;
  /** placeholder text for the user input field */
  label?: string;
  /** declare if this field is required (defaults to `false`) */
  required?: boolean;
}

/**
 * Response body payload sent via the Action POST Request
 */
export interface ActionPostRequest {
  /** base58-encoded public key of an account that may sign the transaction */
  account: string;
}

/**
 * Response body payload returned from the Action POST Request
 */
export interface ActionPostResponse {
  /** base64 encoded serialized transaction */
  transaction: string;
  /** describes the nature of the transaction */
  message?: string;
}

/**
 *
 */
export interface ActionError {
  /** non-fatal error message to be displayed to the user */
  message: string;
}
