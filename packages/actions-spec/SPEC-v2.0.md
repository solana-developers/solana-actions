# Solana Actions and Blockchain Links (Blinks)

[Read the docs to get started](https://solana.com/docs/advanced/actions)

Solana Actions are specification-compliant APIs that return transactions on the
Solana blockchain to be previewed, signed, and sent across a number of various
contexts, including QR codes, buttons + widgets, and websites across the
internet. Actions make it simple for developers to integrate the things you can
do throughout the Solana ecosystem right into your environment, allowing you to
perform blockchain transactions without needing to navigate away to a different
app or webpage.

Blockchain links – or blinks – turn any Solana Action into a shareable,
metadata-rich link. Blinks allow Action-aware clients (browser extension
wallets, bots) to display additional capabilities for the user. On a website, a
blink might immediately trigger a transaction preview in a wallet without going
to a decentralized app; in Discord, a bot might expand the blink into an
interactive set of buttons. This pushes the ability to interact on-chain to any
web surface capable of displaying a URL.

## Contributing

If you would like to propose an update the Solana Actions specification, please
publish a proposal on the official Solana forum under the Solana Request for
Comments (sRFC) section: https://forum.solana.com/c/srfc/6

## Specification

The Solana Actions specification consists of key sections that are part of a
request/response interaction flow:

- Solana Action [URL scheme](#url-scheme) providing an Action URL
- [OPTIONS response](#options-response) to an Action URL to pass CORS
  requirements
- [GET request](#get-request) to an Action URL
- [GET response](#get-response) from the server
- [POST request](#post-request) to an Action URL
- [POST response](#post-response) from the server

Each of these requests are made by the _Action client_ (e.g. wallet app, browser
extension, dApp, website, etc) to gather specific metadata for rich user
interfaces and to facilitate user input to the Actions API.

Each of the responses are crafted by an application (e.g. website, server
backend, etc) and returned to the _Action client_. Ultimately, providing a
signable transaction or message for a wallet to prompt the user to approve,
sign, and send to the blockchain.

### URL Scheme

A Solana Action URL describes an interactive request for a signable Solana
transaction or message using the `solana-action` protocol.

The request is interactive because the parameters in the URL are used by a
client to make a series of standardized HTTP requests to compose a signable
transaction or message for the user to sign with their wallet.

```text
solana-action:<link>
```

- A single `link` field is required as the pathname. The value must be a
  conditionally
  [URL-encoded](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent)
  absolute HTTPS URL.

- If the URL contains query parameters, it must be URL-encoded. URL-encoding the
  value prevents conflicting with any Actions protocol parameters, which may be
  added via the protocol specification.

- If the URL does not contain query parameters, it should not be URL-encoded.
  This produces a shorter URL and a less dense QR code.

In either case, clients must
[URL-decode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURIComponent)
the value. This has no effect if the value isn't URL-encoded. If the decoded
value is not an absolute HTTPS URL, the wallet must reject it as **malformed**.

### OPTIONS response

In order to allow Cross-Origin Resource Sharing
([CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)) within Actions
clients (including blinks), all Action endpoints should respond to HTTP requests
for the `OPTIONS` method with valid headers that will allow clients to pass CORS
checks for all subsequent requests from their same origin domain.

An Actions client may perform
"[preflight](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS#preflighted_requests)"
requests to the Action URL endpoint in order check if the subsequent GET request
to the Action URL will pass all CORS checks. These CORS preflight checks are
made using the `OPTIONS` HTTP method and should respond with all required HTTP
headers that will allow Action clients (like blinks) to properly make all
subsequent requests from their origin domain.

At a minimum, the required HTTP headers include:

- `Access-Control-Allow-Origin` with a value of `*`
  - this ensures all Action clients can safely pass CORS checks in order to make
    all required requests
- `Access-Control-Allow-Methods` with a value of `GET,POST,PUT,OPTIONS`
  - ensures all required HTTP request methods are supported for Actions
- `Access-Control-Allow-Headers` with a minimum value of
  `Content-Type, Authorization, Content-Encoding, Accept-Encoding`

For simplicity, developers should consider returning the same response and
headers to `OPTIONS` requests as their [`GET` response](#get-response).

> The `actions.json` file response must also return valid Cross-Origin headers
> for `GET` and `OPTIONS` requests, specifically the
> `Access-Control-Allow-Origin` header value of `*`.
>
> See [actions.json](#actionsjson) below for more details.

### GET Request

The Action client (e.g. wallet, browser extension, etc) should make an HTTP
`GET` JSON request to the Action's URL endpoint.

- The request should not identify the wallet or the user.
- The client should make the request with an
  [`Accept-Encoding` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding).
- The client should display the domain of the URL as the request is being made.

### GET Response

The Action's URL endpoint (e.g. application or server backend) should respond
with an HTTP `OK` JSON response (with a valid payload in the body) or an
appropriate HTTP error.

- The client must handle HTTP
  [client errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses),
  [server errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses),
  and
  [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages).
- The endpoint should respond with a
  [`Content-Encoding` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)
  for HTTP compression.
- The endpoint should respond with a
  [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
  of `application/json`.

- The client should not cache the response except as instructed by
  [HTTP caching](https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching#controlling_caching)
  response headers.
- The client should display the `title` and render the `icon` image to user.

Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON
response body following `ActionError` to present a helpful error message to
users. See [Action Errors](#action-errors).

#### GET Response Body

A `GET` response with an HTTP `OK` JSON response should include a body payload
that follows the interface specification:

```ts filename="ActionGetResponse"
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
  links?: {
    /** list of related Actions a user could perform */
    actions: LinkedAction[];
  };
  /** non-fatal error message to be displayed to the user */
  error?: ActionError;
}
```

- `icon` - The value must be an absolute HTTP or HTTPS URL of an icon image. The
  file must be an SVG, PNG, or WebP image, or the client/wallet must reject it
  as **malformed**.

- `title` - The value must be a UTF-8 string that represents the source of the
  action request. For example, this might be the name of a brand, store,
  application, or person making the request.

- `description` - The value must be a UTF-8 string that provides information on
  the action. The description should be displayed to the user.

- `label` - The value must be a UTF-8 string that will be rendered on a button
  for the user to click. All labels should not exceed 5 word phrases and should
  start with a verb to solidify the action you want the user to take. For
  example, "Mint NFT", "Vote Yes", or "Stake 1 SOL".

- `disabled` - The value must be boolean to represent the disabled state of the
  rendered button (which displays the `label` string). If no value is provided,
  `disabled` should default to `false` (i.e. enabled by default). For example,
  if the action endpoint is for a governance vote that has closed, set
  `disabled=true` and the `label` could be "Vote Closed".

- `error` - An optional error indication for non-fatal errors. If present, the
  client should display it to the user. If set, it should not prevent the client
  from interpreting the action or displaying it to the user (see
  [Action Errors](#action-errors)). For example, the error can be used together
  with `disabled` to display a reason like business constraints, authorization,
  the state, or an error of external resource.

- `links.actions` - An optional array of related actions for the endpoint. Users
  should be displayed UI for each of the listed actions and expected to only
  perform one. For example, a governance vote action endpoint may return three
  options for the user: "Vote Yes", "Vote No", and "Abstain from Vote".

  - If no `links.actions` is provided, the client should render a single button
    using the root `label` string and make the POST request to the same action
    URL endpoint as the initial GET request.

  - If any `links.actions` are provided, the client should only render buttons
    and input fields based on the items listed in the `links.actions` field. The
    client should not render a button for the contents of the root `label`.

```ts filename="LinkedAction"
export interface LinkedAction {
  /** URL endpoint for an action */
  href: string;
  /** button text rendered to the user */
  label: string;
  /** Parameter to accept user input within an action */
  parameters?: [ActionParameter];
}

/** Parameter to accept user input within an action */
export interface ActionParameter {
  /** parameter name in url */
  name: string;
  /** placeholder text for the user input field */
  label?: string;
  /** declare if this field is required (defaults to `false`) */
  required?: boolean;
}
```

### POST Request

The client must make an HTTP `POST` JSON request to the action URL with a body
payload of:

```json
{
  "account": "<account>"
}
```

- `account` - The value must be the base58-encoded public key of an account that
  may sign the transaction.

The client should make the request with an
[Accept-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Accept-Encoding)
and the application may respond with a
[Content-Encoding header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Encoding)
for HTTP compression.

The client should display the domain of the action URL as the request is being
made. If a `GET` request was made, the client should also display the `title`
and render the `icon` image from that GET response.

### POST Response

The Action's `POST` endpoint should respond with an HTTP `OK` JSON response
(with a valid payload in the body) or an appropriate HTTP error.

- The client must handle HTTP
  [client errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses),
  [server errors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses),
  and
  [redirect responses](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#redirection_messages).
- The endpoint should respond with a
  [`Content-Type` header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Type)
  of `application/json`.

Error responses (i.e. HTTP 4xx and 5xx status codes) should return a JSON
response body following `ActionError` to present a helpful error message to
users. See [Action Errors](#action-errors).

#### POST Response Body

A `POST` response with an HTTP `OK` JSON response should include a body payload
of:

```ts filename="ActionPostResponse"
export interface ActionPostResponse {
  /** base64 encoded serialized transaction */
  transaction: string;
  /** describes the nature of the transaction */
  message?: string;
}
```

- `transaction` - The value must be a base64-encoded
  [serialized transaction](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#serialize).
  The client must base64-decode the transaction and
  [deserialize it](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#from).

- `message` - The value must be a UTF-8 string that describes the nature of the
  transaction included in the response. The client should display this value to
  the user. For example, this might be the name of an item being purchased, a
  discount applied to a purchase, or a thank you note.

- The client and application should allow additional fields in the request body
  and response body, which may be added by future specification updates.

> The application may respond with a partially or fully signed transaction. The
> client and wallet must validate the transaction as **untrusted**.

#### POST Response - Transaction

If the transaction
[`signatures`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#signatures)
are empty or the transaction has NOT been partially signed:

- The client must ignore the
  [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer)
  in the transaction and set the `feePayer` to the `account` in the request.
- The client must ignore the
  [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash)
  in the transaction and set the `recentBlockhash` to the
  [latest blockhash](https://solana-labs.github.io/solana-web3.js/classes/Connection.html#getLatestBlockhash).
- The client must serialize and deserialize the transaction before signing it.
  This ensures consistent ordering of the account keys, as a workaround for
  [this issue](https://github.com/solana-labs/solana/issues/21722).

If the transaction has been partially signed:

- The client must NOT alter the
  [`feePayer`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#feePayer)
  or
  [`recentBlockhash`](https://solana-labs.github.io/solana-web3.js/classes/Transaction.html#recentBlockhash)
  as this would invalidate any existing signatures.
- The client must verify existing signatures, and if any are invalid, the client
  must reject the transaction as **malformed**.

The client must only sign the transaction with the `account` in the request, and
must do so only if a signature for the `account` in the request is expected.

If any signature except a signature for the `account` in the request is
expected, the client must reject the transaction as **malicious**.

### Action Errors

Actions APIs should return errors using `ActionError` in order to present
helpful error messages to the user. Depending on the context, this error could
be fatal or non-fatal.

```ts filename="ActionError"
export interface ActionError {
  /** simple error message to be displayed to the user */
  message: string;
}
```

When an Actions API responds with an HTTP error status code (i.e. 4xx and 5xx),
the response body should be a JSON payload following `ActionError`. The error is
considered fatal and the included `message` should be presented to the user.

For API responses that support the optional `error` attribute (like
[`ActionGetResponse`](#get-response)), the error is considered non-fatal and the
included `message` should be presented to the user.

### actions.json

The purpose of the [`actions.json` file](#actionsjson) allows an application to
instruct clients on what website URLs support Solana Actions and provide a
mapping that can be used to perform [GET requests](#get-request) to an Actions
API server.

> The `actions.json` file response must also return valid Cross-Origin headers
> for `GET` and `OPTIONS` requests, specifically the
> `Access-Control-Allow-Origin` header value of `*`.
>
> See [OPTIONS response](#options-response) above for more details.

The `actions.json` file should be stored and universally accessible at the root
of the domain.

For example, if your web application is deployed to `my-site.com` then the
`actions.json` file should be accessible at `https://my-site.com/actions.json`.
This file should also be Cross-Origin accessible via any browser by having a
`Access-Control-Allow-Origin` header value of `*`.

### Rules

The `rules` field allows the application to map a set of a website's relative
route paths to a set of other paths.

**Type:** `Array` of `ActionRuleObject`.

```ts filename="ActionRuleObject"
interface ActionRuleObject {
  /** relative (preferred) or absolute path to perform the rule mapping from */
  pathPattern: string;
  /** relative (preferred) or absolute path that supports Action requests */
  apiPath: string;
}
```

- [`pathPattern`](#rules-pathpattern) - A pattern that matches each incoming
  pathname.

- [`apiPath`](#rules-apipath) - A location destination defined as an absolute
  pathname or external URL.

#### Rules - pathPattern

A pattern that matches each incoming pathname. It can be an absolute or relative
path and supports the following formats:

- **Exact Match**: Matches the exact URL path.

  - Example: `/exact-path`
  - Example: `https://website.com/exact-path`

- **Wildcard Match**: Uses wildcards to match any sequence of characters in the
  URL path. This can match single (using `*`) or multiple segments (using `**`).
  (see [Path Matching](#rules-path-matching) below).

  - Example: `/trade/*` will match `/trade/123` and `/trade/abc`, capturing only
    the first segment after `/trade/`.
  - Example: `/category/*/item/**` will match `/category/123/item/456` and
    `/category/abc/item/def`.
  - Example: `/api/actions/trade/*/confirm` will match
    `/api/actions/trade/123/confirm`.

#### Rules - apiPath

The destination path for the action request. It can be defined as an absolute
pathname or an external URL.

- Example: `/api/exact-path`
- Example: `https://api.example.com/v1/donate/*`
- Example: `/api/category/*/item/*`
- Example: `/api/swap/**`

#### Rules - Query Parameters

Query parameters from the original URL are always preserved and appended to the
mapped URL.

#### Rules - Path Matching

The following table outlines the syntax for path matching patterns:

| Operator | Matches                                                                                                                                                                                  |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `*`      | A single path segment, not including the surrounding path separator / characters.                                                                                                        |
| `**`     | Matches zero or more characters, including any path separator / characters between multiple path segments. If other operators are included, the `**` operator must be the last operator. |
| `?`      | Unsupported pattern.                                                                                                                                                                     |

## License

The Solana Actions JavaScript SDK is open source and available under the Apache
License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.
