# Solana Actions and Blockchain Links (Blinks)

![npm](https://img.shields.io/npm/dm/@solana/actions)

## Documentation

Access the full API documentation
[here](https://solana-developers.github.io/solana-actions/).

[Read the docs to get started](https://solana.com/docs/advanced/actions)

Watch this video tutorial on
[How to Build Solana Actions](https://youtu.be/kCht01Ycif0)

Find
[more resources for Solana Actions and blinks](https://solana.com/solutions/actions)

Find example code snippets on how to build several different Solana Actions:

- [Deployed sample code snippets](https://solana-actions.vercel.app/)
- [Source code for code snippets](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

Install the `@solana/actions` SDK into your application:

```shell
npm add @solana/actions
```

- `@solana/actions` SDK on NPM:
  - https://www.npmjs.com/package/@solana/actions
- Typedocs for the `@solana/actions` SDK:
  - https://solana-developers.github.io/solana-actions/

## Usage

### `createActionHeaders`

This function helps create headers for API calls by accepting key-value pairs as
input.

Example Code Snippet is just below!

```javascript
import { createActionHeaders } from "@solana/actions";

const headers = createActionHeaders({
  authorization: "Bearer YOUR_TOKEN",
  "content-type": "application/json",
});

console.log(headers); // Output: { authorization: 'Bearer YOUR_TOKEN','content-type': 'application/json' }
```

### `Creating a Typed actions.json Payload`

This function helps structure an actions.json payload with type safety, ensuring
parameters match the expected format. Check out the code snipets below!

```javascript
import { createTypedPayload } from "@solana/actions";

const actionsPayload = createTypedPayload({
  action: "transfer",
  params: {
    from: "source_wallet_address",
    to: "destination_wallet_address",
    amount: 10,
  },
});

console.log(actionsPayload);
```

### `Creating a Typed GET Request Payload`

This function simplifies creating typed GET request payloads for API calls. Code
snipets below!

```javascript
import { createGetRequest } from "@solana/actions";

const getRequestPayload = createGetRequest({
  endpoint: "/wallets",
  params: {
    walletId: "12345",
  },
});

console.log(getRequestPayload);
```

### `Creating a Typed POST Response Payload Using createPostResponse`

Use this function to create structured responses for POST requests with a
standardized format.

```javascript
import { createPostResponse } from '@solana/actions';

const postResponse = createPostResponse({
    success: true,
    data: {
        id: '12345',
        status: 'completed',
    },
});

console.log(postResponse);
``

## What are Solana Actions?

[Solana Actions](https://solana.com/docs/advanced/actions#actions) are
specification-compliant APIs that return transactions on the Solana blockchain
to be previewed, signed, and sent across a number of various contexts, including
QR codes, buttons + widgets, and websites across the internet. Actions make it
simple for developers to integrate the things you can do throughout the Solana
ecosystem right into your environment, allowing you to perform blockchain
transactions without needing to navigate away to a different app or webpage.

## What are blockchain links (blinks)?

[Blockchain links](https://solana.com/docs/advanced/actions#blinks) – or blinks
– turn any Solana Action into a shareable, metadata-rich link. Blinks allow
Action-aware clients (browser extension wallets, bots) to display additional
capabilities for the user. On a website, a blink might immediately trigger a
transaction preview in a wallet without going to a decentralized app; in
Discord, a bot might expand the blink into an interactive set of buttons. This
pushes the ability to interact on-chain to any web surface capable of displaying
a URL.

## License

The Solana Actions JavaScript SDK is open source and available under the Apache
License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.
```
