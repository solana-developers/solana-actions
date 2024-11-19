# Solana Actions and Blockchain Links (Blinks)

# Solana Actions SDK

![npm](https://img.shields.io/npm/dw/@solana/actions)

The **Solana Actions SDK** simplifies the process of integrating typed action definitions into your Solana-related projects. With this SDK, you can create, validate, and handle typed payloads for GET and POST requests, ensuring type safety and consistent payload structures.

📚 **[Typedoc Documentation](https://solana-developers.github.io/solana-actions/)**  

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

## Usage Examples

Below are examples of some of the most common functions you can use with the Solana Actions SDK.

### 1. Create Action Headers

You can easily generate the headers required for your actions:

```javascript
import { createActionHeaders } from '@solana/actions';

const headers = createActionHeaders();

console.log(headers);
/*
{
  "x-api-key": "your-api-key",
  "x-user-token": "user-token",
  "Content-Type": "application/json"
}
*/
```

### 2. Create a Typed actions.json Payload

```javascript
import { ActionGetResponse } from "@solana/actions";

const payload: ActionGetResponse = {
  type: "action",
  title: "Transfer SOL Example",
  icon: "https://youricon.url/sol.png",
  description: "Send SOL to a specified wallet address",
  label: "Transfer SOL",
  links: {
    actions: [
      {
        label: "Send 1 SOL",
        href: "/api/transfer-sol?amount=1",
      },
      {
        label: "Send Custom Amount",
        href: "/api/transfer-sol?amount={amount}",
        parameters: [
          {
            name: "amount",
            label: "Enter the amount",
            required: true,
          },
        ],
      },
    ],
  },
};

```

### Create a Typed GET Request Payload
```javascript
import { ActionGetResponse } from "@solana/actions";

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    type: "action",
    title: "On-chain Memo Example",
    icon: "https://youricon.url/memo.png",
    description: "Send a memo to the blockchain",
    label: "Send Memo",
  };

  return new Response(JSON.stringify(payload), {
    headers: { "Content-Type": "application/json" },
  });
};

```
### Create a Typed POST Response Payload
```javascript
import { ActionPostResponse, createPostResponse } from "@solana/actions";

export const POST = async (req: Request) => {
  const responsePayload: ActionPostResponse = createPostResponse({
    status: "success",
    result: {
      message: "Transaction successful!",
      transactionId: "5tRfgh...",
    },
  });

  return new Response(JSON.stringify(responsePayload), {
    headers: { "Content-Type": "application/json" },
  });
};
```

## License

The Solana Actions JavaScript SDK is open source and available under the Apache
License, Version 2.0. See the [LICENSE](./LICENSE) file for more info.
