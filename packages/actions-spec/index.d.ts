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
 * Type of action to determine client side handling
 */
export type ActionType = "action" | "completed";

/**
 * Response body payload returned from the initial Action GET Request
 */
export interface ActionGetResponse extends Omit<Action, "type"> {
  type?: "action";
}

/**
 * A single Solana Action
 */
export interface Action<T extends ActionType = "action"> {
  /** type of Action to present to the user */
  type: T;
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
  /**
   * Parameters used to accept user input within an action
   * @see {ActionParameter}
   * @see {ActionParameterSelectable}
   */
  parameters?: Array<TypedActionParameter>;
}

export type TypedActionParameter<
  T extends ActionParameterType = ActionParameterType,
> = T extends SelectableParameterType
  ? ActionParameterSelectable<T>
  : ActionParameter<T>;

/**
 * Parameter to accept user input within an action
 */
export interface ActionParameter<T extends ActionParameterType, M = MinMax<T>> {
  /** input field type */
  type?: T;
  /** parameter name in url */
  name: string;
  /** placeholder text for the user input field */
  label?: string;
  /** declare if this field is required (defaults to `false`) */
  required?: boolean;
  /** regular expression pattern to validate user input client side */
  pattern?: string;
  /** human-readable description of the `type` and/or `pattern`, represents a caption and error, if value doesn't match */
  patternDescription?: string;
  /** the minimum value allowed based on the `type` */
  min?: M;
  /** the maximum value allowed based on the `type` */
  max?: M;
}

type MinMax<T extends ActionParameterType> = T extends "date" | "datetime-local"
  ? string
  : T extends "radio" | "select"
  ? never
  : number;

type GeneralParameterType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "datetime-local"
  | "textarea";

type SelectableParameterType = "select" | "radio" | "checkbox";

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
  extends Omit<ActionParameter<T>, "pattern"> {
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
export interface ActionPostRequest<T = string> {
  /** base58-encoded public key of an account that may sign the transaction */
  account: string;
  /**
   * Key-value map of parameter values from user's input
   * - key - parameter name
   * - value - input value (by default type of `string`, if multi-option, type of `Array<string>`
   */
  data?: Record<keyof T, string | Array<string>>;
}

/**
 * Response body payload returned from the Action POST Request
 */
export interface ActionPostResponse<T extends ActionType = ActionType> {
  /** base64 encoded serialized transaction */
  transaction: string;
  /** describes the nature of the transaction */
  message?: string;
  links?: {
    /**
     * The next action in a successive chain of actions to be obtained after
     * the previous was successful.
     */
    next: NextActionLink;
  };
}

/**
 * Represents a link to the next action to be performed.
 * The next action can be either a POST request to a callback URL or an inline action.
 *
 * @see {@link PostNextActionLink}
 * @see {@link InlineNextActionLink}
 */
export type NextActionLink = PostNextActionLink | InlineNextActionLink;

/**
 * Represents a POST request link to the next action.
 *
 * This is a same origin callback URL used to fetch the next action in the chain.
 * - This callback URL will receive a POST request with a body of `NextActionPostRequest`.
 * - It should respond with a `NextAction`.
 *
 * @see {@link NextAction}
 * @see {@link NextActionPostRequest}
 */
export interface PostNextActionLink {
  /** Indicates the type of the link. */
  type: "post";
  /** Relative or same origin URL to which the POST request should be made. */
  href: string;
}

/**
 * Represents an inline next action embedded within the current context.
 */
export interface InlineNextActionLink {
  /** Indicates the type of the link. */
  type: "inline";
  /** The next action to be performed */
  action: NextAction;
}

/** The completed action, used to declare the "completed" state within action chaining. */
export type CompletedAction = Omit<Action<"completed">, "links">;

/** The next action to be performed */
export type NextAction = Action<"action"> | CompletedAction;

/**
 * Response body payload sent via POST request to obtain the next action
 * in a successive chain of actions
 *
 * @see {@link NextAction} should be returned as the POST response
 */
export interface NextActionPostRequest extends ActionPostRequest {
  /** signature produced from the previous action (either a transaction id or message signature) */
  signature: string;
}

/**
 * Error message that can be returned from an Actions API
 */
export interface ActionError {
  /** simple error message to be displayed to the user */
  message: string;
}
