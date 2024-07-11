# Solana Actions and Blockchain Links (Blinks)

[Read the docs to get started](https://solana.com/docs/advanced/actions)

Install the `@solana/actions` SDK into your application:

```shell
npm add @solana/actions
```

- `@solana/actions` SDK on NPM:
  - https://www.npmjs.com/package/@solana/actions
- Typedocs for the `@solana/actions` SDK:
  - https://solana-developers.github.io/solana-actions/

## Developer resources

Watch this video tutorial on
[How to Build Solana Actions](https://youtu.be/kCht01Ycif0)

Find
[more resources for Solana Actions and blinks](https://solana.com/solutions/actions)

Find example code snippets on how to build several different Solana Actions:

- [Deployed sample code snippets](https://solana-actions.vercel.app/)
- [Source code for code snippets](https://github.com/solana-developers/solana-actions/tree/main/examples/next-js)

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
