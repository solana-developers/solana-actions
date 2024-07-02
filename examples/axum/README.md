# Solana Action: Transfer SOL

This example includes a Solana Action built in Rust using the Axum framework. It
provides an API endpoint for transferring SOL.

Navigate to `./examples/axum` and start the application:

```
cargo run
```

The server will start running on http://localhost:8080.

The endpoint for the Action is: http://localhost:8080/api/actions/transfer-sol

You can test the Action on devenet as a Blink at https://dial.to/devnet:
https://www.dial.to/devnet?action=solana-action%3Ahttp%3A%2F%2Flocalhost%3A8080%2Fapi%2Factions%2Ftransfer-sol

Alternatively, you can use the [Znap](https://github.com/heavy-duty/znap)
framework to build Action in Rust.
