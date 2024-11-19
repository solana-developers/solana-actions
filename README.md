# Solana Actions and Blockchain Links (Blinks)

[![npm](https://img.shields.io/npm/dw/@solana/actions)](https://www.npmjs.com/package/@solana/actions)

## Quick Start

- [Read the docs to get started](https://solana.com/docs/advanced/actions)
- Watch this video tutorial on
  [How to Build Solana Actions](https://youtu.be/kCht01Ycif0)
- Find
  [more resources for Solana Actions and blinks](https://solana.com/solutions/actions)

## Example Code Snippets

Explore several example Solana Actions:

- [Deployed sample code snippets](https://solana-actions.vercel.app/)
- [Source code for code snippets](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

## Installation

Install the `@solana/actions` SDK into your application:

```shell
npm add @solana/actions
```

- @solana/actions SDK on NPM:  
  [https://www.npmjs.com/package/@solana/actions](https://www.npmjs.com/package/@solana/actions)

- Typedocs for the @solana/actions SDK:  
  [https://solana-developers.github.io/solana-actions/](https://solana-developers.github.io/solana-actions/)

## What are Solana Actions?

[Solana Actions](https://solana.com/docs/advanced/actions#actions) are
specification-compliant APIs that return transactions on the Solana blockchain
to be previewed, signed, and sent across various contexts, including QR codes,
widgets, and websites. Actions make it easy for developers to integrate
blockchain functionality directly into their environment, allowing transactions
to occur without navigating away from the current app or webpage.

## What are Blockchain Links (Blinks)?

[Blockchain links](https://solana.com/docs/advanced/actions#blinks), or blinks,
turn any Solana Action into a shareable, metadata-rich link. Blinks allow
Action-aware clients, such as browser extension wallets and bots, to display
enhanced capabilities. On a website, a blink can trigger a transaction preview
in a wallet without visiting a decentralized app; in Discord, a bot might expand
the blink into an interactive button set, making on-chain interactions possible
on any URL-capable surface.

## Usage Examples

Here are some example snippets for common functions in the `@solana/actions`
SDK.

### 1. Creating Action Headers

The `createActionHeaders` function helps set up headers for Solana Actions:

```javascript
import { createActionHeaders } from "@solana/actions";

const headers = createActionHeaders({
  authorization: "Bearer YOUR_TOKEN",
  contentType: "application/json",
});

console.log(headers);
```

### 2. Creating a Typed `actions.json` Payload

To create a typed payload for the `actions.json` file:

```javascript
import { createTypedActionsPayload } from "@solana/actions";

const payload = createTypedActionsPayload({
  action: "ACTION_NAME",
  parameters: {
    key1: "value1",
    key2: "value2",
  },
});

console.log(payload);
```

### 3. Creating a Typed `GET` Request Payload

Create a payload for a typed `GET` request:

```javascript
import { createGetRequestPayload } from "@solana/actions";

const getRequestPayload = createGetRequestPayload({
  endpoint: "/api/v1/resource",
  params: {
    id: "123",
  },
});

console.log(getRequestPayload);
```

### 4. Creating a Typed `POST` Response Payload

The `createPostResponse` function generates a payload for a typed `POST`
response:

```javascript
import { createPostResponse } from "@solana/actions";

const postResponsePayload = createPostResponse({
  status: "success",
  data: {
    message: "Action completed successfully",
  },
});

console.log(postResponsePayload);
```

## License

The Solana Actions JavaScript SDK is open source and available under the Apache
License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.
