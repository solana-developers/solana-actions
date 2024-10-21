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
 *
 * note: `type` is optional for backwards compatibility
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
 * Type of action to determine client side handling
 */
export type LinkedActionType =
  | "transaction"
  | "message"
  | "post"
  | "external-link";

/**
 * Related action on a single endpoint
 */
export interface LinkedAction {
  /** Type of action to be performed by user */
  type: LinkedActionType;
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

/** Type of action to determine client side handling */
export type PostActionType = LinkedActionType;

/**
 * Response body payload sent via the Action POST Request
 */
export interface ActionPostRequest<T = string> {
  type?: PostActionType;
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
 * Generic response from an Action API request
 */
export interface ActionResponse {
  type?: PostActionType;
  message?: string;
  links?: {
    next: NextActionLink;
  };
}

/**
 * Response body payload returned from the Action POST Request if the action is a transaction
 */
export interface TransactionResponse extends ActionResponse {
  type: Extract<PostActionType, "transaction">;
  transaction: string;
}

/**
 * Response body payload returned from the Action POST Request if the action is a POST request
 */
export interface PostResponse extends ActionResponse {
  type: Extract<PostActionType, "post">;
}

/**
 * Response body payload returned from the Action POST Request if the action is an External Link
 */
export interface ExternalLinkResponse extends ActionResponse {
  type: Extract<PostActionType, "external-link">;
  externalLink: string;
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
export interface NextActionPostRequest extends Omit<ActionPostRequest, "type"> {
  /** signature produced from the previous action (either a transaction id or message signature) */
  signature?: string;
  /** unedited `state` value initially provided by the Action API, relayed back to the Action API */
  state?: string;
}

/**
 * Structured data that the user was requested to sign
 */
export type SignMessageData = {
  /** domain requesting the user to sign the message */
  domain: string;
  /** base58 string of the Solana address requested to sign this message */
  address: string;
  /** human readable string message to the user */
  statement: string;
  /**
   * a random alpha-numeric string at least 8 characters. this value is
   * generated by the Action API, should only be used once, and is used
   *  to prevent replay attacks
   */
  nonce: string;
  /** ISO-8601 datetime string. This represents the time at which the sign request was issued by the action api. */
  issuedAt: string;
  /**
   * Chain ID compatible with CAIPs, defaults to Solana mainnet-beta in clients.
   * If not provided, the blink client should not include chain id in the message to be signed by the user.
   */
  chainId?: string;
};

export interface SignMessageResponse extends ActionResponse {
  type: Extract<PostActionType, "message">;
  /** data for the user to sign */
  data: string | SignMessageData;
  /**
   * normally a [Message Authentication Code](https://en.wikipedia.org/wiki/Message_authentication_code) (MAC)
   * or JWT created using a secret stored on the Action API server (allowing the server to verify this value)
   */
  state?: string;
  /** `links.next` is required for sign message to validate the signature created */
  links: {
    next: PostNextActionLink;
  };
}

/**
 * Response body payload returned from the Action POST Request
 */
export type ActionPostResponse =
  | TransactionResponse
  | PostResponse
  | ExternalLinkResponse
  | SignMessageResponse;

/**
 * Request body payload sent via POST request (after performing a "sign message" action)
 * to obtain the next action in a successive chain of actions
 *
 * @see {@link NextAction} should be returned as the POST response
 */
export interface MessageNextActionPostRequest
  extends Omit<NextActionPostRequest, "data"> {
  /** signature produced from the previous action's message signing request */
  signature: string;
  /** unedited `data` value initially provided by the Action API, relayed back to the Action API */
  data: SignMessageResponse["data"];
  /** unedited `state` value initially provided by the Action API, relayed back to the Action API */
  state?: SignMessageResponse["state"];
}

/**
 * Error message that can be returned from an Actions API
 */
export interface ActionError {
  /** simple error message to be displayed to the user */
  message: string;
}
