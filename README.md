# Solana Actions and Blockchain Links (Blinks)

[![NPM Downloads](https://img.shields.io/npm/dm/@solana/actions.svg)](https://www.npmjs.com/package/@solana/actions)

[Read the docs to get started](https://solana.com/docs/advanced/actions)

Install the `@solana/actions` SDK into your application:

```bash
npm add @solana/actions
```

- **NPM Package**: [@solana/actions](https://www.npmjs.com/package/@solana/actions)
- **Typedocs Documentation**: [Explore the full API documentation](https://solana-developers.github.io/solana-actions/)

---

## Table of Contents

1. [Developer Resources](#developer-resources)
2. [What are Solana Actions?](#what-are-solana-actions)
3. [What are Blockchain Links (Blinks)?](#what-are-blockchain-links-blinks)
4. [Core Functions of the SDK](#core-functions-of-the-sdk)
   - [Creating Action Headers](#1-creating-action-headers)
   - [Creating a Typed `actions.json` Payload](#2-creating-a-typed-actionsjson-payload)
   - [Handling GET Requests](#3-handling-get-requests)
   - [Processing POST Responses](#4-processing-post-responses)
5. [License](#license)

---

## Developer Resources

- **Video Tutorial**: [How to Build Solana Actions](https://youtu.be/kCht01Ycif0)
- **More Resources**: [Solana Actions and Blinks Overview](https://solana.com/solutions/actions)
- **Example Code**:
  - [Deployed sample code snippets](https://solana-actions.vercel.app/)
  - [Source code for code snippets](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

---

## What are Solana Actions?

[Solana Actions](https://solana.com/docs/advanced/actions#actions) are specification-compliant APIs that return transactions on the Solana blockchain to be previewed, signed, and sent across a number of various contexts, including:

- QR codes
- Buttons and widgets
- Websites

Actions make it simple for developers to integrate Solana blockchain transactions into their environments, enabling users to perform actions without navigating to another app or webpage.

---

## What are Blockchain Links (Blinks)?

[Blockchain links](https://solana.com/docs/advanced/actions#blinks), or **blinks**, are metadata-rich URLs that turn any Solana Action into a shareable link. Blinks enable:

- **Enhanced Interactions**: Trigger transaction previews directly in wallets or bots.
- **Cross-Platform Functionality**: Enable actions across websites, Discord bots, and browser extension wallets.

---

## Core Functions of the SDK

### 1. Creating Action Headers

The `createActionHeaders` function generates standardized headers for Action APIs:

```typescript
import { createActionHeaders } from "@solana/actions";

// Basic headers
const basicHeaders = createActionHeaders();

// Headers with chain ID and version
const customHeaders = createActionHeaders({
  chainId: "mainnet-beta",
  actionVersion: "1",
  headers: {
    "Custom-Header": "value",
  },
});

// Headers structure
console.log(customHeaders);
/*
{
  'X-Blockchain-Ids': 'solana:mainnet-beta',
  'X-Action-Version': '1',
  'Custom-Header': 'value',
  // ...CORS headers
}
*/
```

---

### 2. Creating a Typed `actions.json` Payload

Define your Action's metadata and interface:

```typescript
import { ActionGetResponse } from "@solana/actions";

const actionsConfig: ActionGetResponse = {
  type: "action",
  title: "Token",
  icon: "https://example.com/icon.png",
  description: "Transfer tokens between wallets",
  label: "Transfer",
  links: {
    actions: [
      {
        label: "Send Tokens",
        href: "/api/transfer?amount={amount}&token={tokenMint}",
        parameters: [
          {
            name: "amount",
            label: "Amount to send",
            required: true,
            type: "number",
          },
          {
            name: "tokenMint",
            label: "Token Address",
            required: true,
            type: "string",
          },
        ],
      },
    ],
  },
};
```

---

### 3. Handling GET Requests

Create typed GET request handlers for your Actions:

```typescript
import { ActionGetResponse } from "@solana/actions";

export async function GET(req: Request) {
  // Extract and validate query parameters
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get("amount");
  const tokenMint = searchParams.get("tokenMint");

  const response: ActionGetResponse = {
    type: "action",
    title: `Transfer ${amount} Tokens`,
    description: `Send ${amount} tokens to another wallet`,
    label: "Confirm Transfer",
    // Additional metadata...
  };

  return new Response(JSON.stringify(response), {
    headers: createActionHeaders(),
  });
}
```

---

### 4. Processing POST Responses

Handle transaction creation and responses:

```typescript
import { ActionPostResponse, createPostResponse } from "@solana/actions";

export async function POST(req: Request) {
  // Create and sign your transaction
  const transaction = await createTransferTransaction(/* ... */);

  // Generate typed response with signed transaction
  const response = await createPostResponse({
    fields: {
      transaction,
      // Optional: Add more response fields
      meta: {
        label: "Transfer Complete",
        message: "Tokens transferred successfully"
      }
    }
  });

  return new Response(JSON.stringify(response), {
    headers: createActionHeaders()
  });
}
```

---

## License

The Solana Actions JavaScript SDK is open source and available under the Apache License, Version 2.0. See the [LICENSE](./LICENSE) file for more information.