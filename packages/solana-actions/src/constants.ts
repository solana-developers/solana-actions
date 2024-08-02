/** @internal */
export const HTTPS_PROTOCOL = "https:";

/** Program Id for the SPL Memo program */
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

/**
 * Specification declared URL query parameter to detect blinks via interstitial website URLs.
 *
 * Note: The `action` query parameter should begin with the `solana-action:` protocol identifier
 *
 * Example: `https://dial.to/?action=solana-action:https://jupiter.dial.to/swap/SOL-Bonk`
 */
export const BLINKS_QUERY_PARAM = "action";

/**
 * Blockchain IDs for Solana from CAIP
 *
 * @see https://namespaces.chainagnostic.org/solana/caip10
 */
export const BLOCKCHAIN_IDS = {
  mainnet: "solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp",
  devnet: "solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1",
  testnet: "solana:4uhcVJyU9pJkvQyS88uRDiswHXSCkY3z",
};

/**
 * Standard headers for use within frameworks that use the native `HeadersInit` (like NextJS)
 *
 * Note: `Access-Control-Allow-Origin=*` should ONLY be set on your Actions API routes and `actions.json`.
 * Setting "allow origin to any" on other routes on your server is bad practice and should be avoided.
 */
export const ACTIONS_CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding, X-Accept-Action-Version, X-Accept-Blockchain-Ids",
  "Access-Control-Expose-Headers": "X-Action-Version, X-Blockchain-Ids",
  "Content-Type": "application/json",
};

/**
 * Standard headers for use within frameworks that use middleware to handle CORS headers
 * (like Hono, Express, and Fastify)
 *
 * Note: `origin=*` should ONLY be set on your Actions API routes and `actions.json`.
 * Setting "allow origin to any" on other routes on your server is bad practice and should be avoided.
 */
export const ACTIONS_CORS_HEADERS_MIDDLEWARE = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Content-Encoding",
    "Accept-Encoding",
    "X-Accept-Action-Version",
    "X-Accept-Blockchain-Ids",
  ],
  exposedHeaders: [
    "X-Action-Version",
    "X-Blockchain-Ids",
  ],
};
