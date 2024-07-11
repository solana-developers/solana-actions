/** @internal */
export const SOLANA_PAY_PROTOCOL = "solana:";

/** @internal */
export const SOLANA_ACTIONS_PROTOCOL = "solana-action:";

/** @internal */
export const SOLANA_ACTIONS_PROTOCOL_PLURAL = "solana-actions:";

/** @internal */
export const HTTPS_PROTOCOL = "https:";

/** Program Id for the SPL Memo program */
export const MEMO_PROGRAM_ID = "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr";

/**  */
export const BLINKS_QUERY_PARAM = "action";

/**
 * Standard headers
 */
export const ACTIONS_CORS_HEADERS: HeadersInit = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,PUT,OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, Content-Encoding, Accept-Encoding",
  "Content-Type": "application/json",
};
