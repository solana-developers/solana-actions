/**
 * Solana Actions and blinks specification - v2.0
 */

/**
 * Protocol identifier for the Solana Actions protocol
 */
export type SOLANA_ACTIONS_PROTOCOL = "solana-action:";

/**
 * @internal
 * Protocol identifier for the Solana Pay protocol
 */
export type SOLANA_PAY_PROTOCOL = "solana:";

/** @internal */
export type SupportedProtocols = SOLANA_ACTIONS_PROTOCOL | SOLANA_PAY_PROTOCOL;

/**
 * The `actions.json` instruct clients on what website URLs support
 * Solana Actions and provide the mapping rules for blink urls to reach their Actions API.
 */
export interface ActionsJson {
  rules: ActionRuleObject[];
}

/**
 * Rule configuration to map a website's URL (`pathPattern`) to an Actions API endpoint (`apiPath`)
 */
export interface ActionRuleObject {
  /** relative (preferred) or absolute path to perform the rule mapping from */
  pathPattern: string;
  /** relative (preferred) or absolute path that supports Action requests */
  apiPath: string;
}

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
  parameters?: TypedParameter[];
}

export type TypedParameter<
  T extends ActionParameterType = ActionParameterType,
> = T extends SelectableParameterType
  ? ActionParameterSelectable<T>
  : ActionParameter<T>;

/**
 * Parameter to accept user input within an action
 */
export interface ActionParameter<T extends ActionParameterType> {
  /** input field type */
  type?: T;
  /** regular expression pattern to validate user input client side */
  pattern?: string;
  /** human readable description of the `pattern` */
  patternDescription?: string;
  /** parameter name in url */
  name: string;
  /** placeholder text for the user input field */
  label?: string;
  /** declare if this field is required (defaults to `false`) */
  required?: boolean;
}

export type GeneralParameterType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "datetime-local"
  | "textarea";

export type SelectableParameterType = "select" | "radio" | "checkbox";

/**
 * Input field type to present to the user. Normally resembling the respective
 * [HTML `input` types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input)
 * or standard HTML element (e.g. `select`) for the platform being used (web, mobile, etc).
 * @default `text`
 */
export type ActionParameterType =
  | GeneralParameterType
  | SelectableParameterType;

export interface ActionParameterSelectable<T extends ActionParameterType>
  extends Omit<ActionParameter<T>, "pattern" | "patternDescription"> {
  /**
   * Listing of the options the user should be able to select from
   */
  options: Array<{
    /** displayed UI label of this selectable option */
    label: string;
    /** value of this selectable option */
    value: string;
    /** whether this option should be selected by default */
    selected?: boolean;
  }>;
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
 * Error message that can be returned from an Actions API
 */
export interface ActionError {
  /** non-fatal error message to be displayed to the user */
  message: string;
}
