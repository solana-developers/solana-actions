# Solana Actions and Blockchain Links (Blinks)

[![npm](https://img.shields.io/npm/dw/@solana/actions)](https://www.npmjs.com/package/@solana/actions)
[![npm version](https://img.shields.io/npm/v/@solana/actions.svg)](https://www.npmjs.com/package/@solana/actions)
[![TypeDoc](https://img.shields.io/badge/documentation-TypeDoc-blue)](https://solana-developers.github.io/solana-actions/)

## Quick Links

- 📚 [TypeDoc Documentation](https://solana-developers.github.io/solana-actions/)
- 📖 [Getting Started Guide](https://solana.com/docs/advanced/actions)
- 🎥 [Video Tutorial: Building Solana Actions](https://youtu.be/kCht01Ycif0)
- 🔨 [Example Projects](https://solana-actions.vercel.app/)
- 💻 [Source Code Examples](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

## Installation

```bash
npm install @solana/actions
# or
yarn add @solana/actions
# or
pnpm add @solana/actions
```

## What are Solana Actions?

Solana Actions are specification-compliant APIs that enable blockchain transactions to be previewed, signed, and sent across various contexts:
- 🔗 QR codes
- 🖱️ [Buttons and widgets](https://x.com/degenghosty/status/1838281665979838523)
- 🌐 [Websites and applications](https://dial.to/)

Actions allow developers to seamlessly integrate Solana blockchain functionality directly into their applications without requiring users to navigate away to different apps or webpages.

## What are Blockchain Links (Blinks)?

Blockchain links (blinks) transform Solana Actions into shareable, metadata-rich URLs that enhance user interaction:
- 🔌 Browser extension wallets can instantly preview transactions
- 🤖 Discord bots can expand links into interactive buttons
- 🌍 Any platform capable of displaying URLs becomes blockchain-enabled

## Core SDK Functions

### 1. Creating Action Headers

The `createActionHeaders` function generates standardized headers for Action APIs:

```typescript
import { createActionHeaders } from '@solana/actions';

// Basic headers
const basicHeaders = createActionHeaders();

// Headers with chain ID and version
const customHeaders = createActionHeaders({
  chainId: 'mainnet-beta',
  actionVersion: '1',
  headers: {
    'Custom-Header': 'value'
  }
});

// Headers structure
{
  'X-Blockchain-Ids': 'solana:mainnet-beta',
  'X-Action-Version': '1',
  'Custom-Header': 'value',
  // ...CORS headers
}
```

### 2. Creating a Typed actions.json Payload

Define your Action's metadata and interface:

```typescript
import { ActionGetResponse } from "@solana/actions";

const actionsConfig: ActionGetResponse = {
  type: "action",
  title: "Token Transfer",
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
            type: "number"
          },
          {
            name: "tokenMint",
            label: "Token Address",
            required: true,
            type: "string"
          }
        ]
      }
    ]
  }
};
```

### 3. Handling GET Requests

Create typed GET request handlers for your Actions:

```typescript
import { ActionGetResponse } from "@solana/actions";

export async function GET(req: Request) {
  // Extract and validate query parameters
  const { searchParams } = new URL(req.url);
  const amount = searchParams.get('amount');
  const tokenMint = searchParams.get('tokenMint');

  const response: ActionGetResponse = {
    type: "action",
    title: `Transfer ${amount} Tokens`,
    description: `Send ${amount} tokens to another wallet`,
    label: "Confirm Transfer",
    // Additional metadata...
  };

  return new Response(JSON.stringify(response), {
    headers: createActionHeaders()
  });
}
```

### 4. Processing POST Responses

Handle transaction creation and responses:

```typescript
import { 
  ActionPostResponse, 
  createPostResponse 
} from "@solana/actions";

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

## Type Safety

The SDK provides comprehensive TypeScript definitions for:
- Request/Response payloads
- Action configurations
- Transaction metadata
- Parameter validation

## Best Practices

1. **Always Use TypeScript**: Leverage type checking for safer implementations
2. **Validate Parameters**: Check all user inputs before processing
3. **Handle Errors Gracefully**: Provide clear error messages in responses
4. **Use Environment Variables**: Secure sensitive data (private keys, API tokens)
5. **Test Actions**: Verify behavior across different wallets and clients


## Examples

Find complete working examples:
- [Express Transfer SOL](https://github.com/solana-developers/solana-actions/tree/main/examples/express)
- [Next-JS Project](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)
- [Rust's Axum Framework - Transfer SOL](https://github.com/solana-developers/solana-actions/tree/main/examples/axum)
- [CloudFare workers](https://github.com/solana-developers/solana-actions/tree/main/examples/cloudflare-workers)


## License

The Solana Actions Node SDK is open source and available under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for more info.
