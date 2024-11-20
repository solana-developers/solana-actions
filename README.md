# Solana Actions and Blockchain Links (Blinks)

[![npm version](https://img.shields.io/npm/v/@solana/actions)](https://www.npmjs.com/package/@solana/actions)  
[![npm downloads](https://img.shields.io/npm/dm/@solana/actions)](https://www.npmjs.com/package/@solana/actions)

## Overview

The `@solana/actions` SDK provides specification-compliant APIs to simplify blockchain transactions on the Solana network. This SDK enables developers to preview, sign, and send transactions across various contexts, such as QR codes, buttons, widgets, and websites, without navigating to separate apps or web pages.

### Key Features
- **Solana Actions**: Integrate Solana transactions effortlessly into your app with standardized APIs.
- **Blockchain Links (Blinks)**: Shareable, metadata-rich links that work seamlessly across browsers, wallets, and bots.
- **Cross-Platform Compatibility**: Use in web apps, Discord bots, or any web environment capable of displaying URLs.

For detailed documentation, visit the [Typedoc Docs](https://solana-developers.github.io/solana-actions/).

---

## Installation

To integrate `@solana/actions` into your project, use npm:

```bash
npm add @solana/actions
```

For additional details, check the [@solana/actions SDK on NPM](https://www.npmjs.com/package/@solana/actions).

---

## Getting Started

### Example Code Snippets

Here are examples of the most common functionalities provided by the `@solana/actions` SDK:

#### 1. **Creating Action Headers**

```javascript
import { createActionHeaders } from '@solana/actions';

const headers = createActionHeaders({
  apiKey: 'your-api-key',
  userAgent: 'YourApp/1.0',
});

console.log(headers);
```

#### 2. **Creating a Typed `actions.json` Payload**

```javascript
import { ActionPayload } from '@solana/actions';

const payload: ActionPayload = {
  name: 'transfer-sol',
  version: '1.0.0',
  metadata: { description: 'A simple transfer action' },
  instructions: [
    {
      programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
      accounts: [
        { pubkey: 'SourceAccountPublicKey', isSigner: true, isWritable: true },
        { pubkey: 'DestinationAccountPublicKey', isSigner: false, isWritable: true },
      ],
      data: 'TransactionDataInBase58',
    },
  ],
};

console.log(payload);
```

#### 3. **Creating a Typed `GET` Request Payload**

```javascript
import { createGetRequest } from '@solana/actions';

const getRequest = createGetRequest({
  endpoint: '/api/v1/action',
  query: { actionId: 'example-action-id' },
});

console.log(getRequest);
```

#### 4. **Creating a Typed `POST` Response Payload**

```javascript
import { createPostResponse } from '@solana/actions';

const postResponse = createPostResponse({
  status: 200,
  body: {
    success: true,
    message: 'Action completed successfully!',
  },
});

console.log(postResponse);
```

---

## Additional Resources

- **Documentation**: [Typedoc Docs](https://solana-developers.github.io/solana-actions/)
- **Video Tutorial**: [How to Build Solana Actions](https://youtu.be/kCht01Ycif0)
- **Deployed Code Snippets**: [Solana Actions Examples](https://solana-actions.vercel.app/)
- **Source Code**: [Solana Actions on GitHub](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

---

## What Are Solana Actions?

[Solana Actions](https://solana.com/docs/advanced/actions#actions) are standardized APIs that enable developers to perform blockchain transactions on Solana. These APIs allow transactions to be previewed, signed, and sent directly from applications, making it easy to integrate blockchain functionality without requiring users to navigate away from the current page.

---

## What Are Blockchain Links (Blinks)?

[Blockchain links](https://solana.com/docs/advanced/actions#blinks), or **blinks**, transform Solana Actions into shareable, metadata-rich links. These links can be used in wallets, bots, and other platforms to enhance user interactions. For example:
- On a website: Blinks trigger transaction previews in wallets.
- In Discord: Bots expand blinks into interactive buttons.

---

## License

The Solana Actions SDK is open-source and available under the Apache License, Version 2.0. For more details, see the [LICENSE](./LICENSE) file.

---
