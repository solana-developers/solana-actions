import { SupportedProtocols } from "@solana/actions-spec";
import { BLINKS_QUERY_PARAM } from "./constants.js";
import type { ActionRequestURLFields, BlinkURLFields } from "./types.js";

/**
 * Thrown when fields cannot be encoded as a blink or Solana Action URL.
 */
export class EncodeURLError extends Error {
  name = "EncodeURLError";
}

/**
 * Encode a Solana Action URL.
 *
 * @param fields Fields to encode in the URL.
 *
 * @throws {EncodeURLError}
 */
export function encodeURL(
  fields: ActionRequestURLFields | BlinkURLFields,
  protocol: SupportedProtocols = "solana-action:",
): URL {
  if ("blink" in fields) return encodeBlinkURL(fields, protocol);
  return encodeActionRequestURL(fields, protocol);
}

function encodeActionRequestURL(
  { link, label, message }: ActionRequestURLFields,
  protocol: SupportedProtocols = "solana-action:",
): URL {
  // Remove trailing slashes
  const pathname = link.search
    ? encodeURIComponent(String(link).replace(/\/\?/, "?"))
    : String(link).replace(/\/$/, "");

  const url = new URL(protocol + pathname);

  if (label) {
    url.searchParams.append("label", label);
  }

  if (message) {
    url.searchParams.append("message", message);
  }

  return url;
}

function encodeBlinkURL(
  { blink, action }: BlinkURLFields,
  protocol?: SupportedProtocols,
): URL {
  const url = new URL(blink);
  url.searchParams.set(
    BLINKS_QUERY_PARAM,
    encodeURIComponent(encodeActionRequestURL(action, protocol).toString()),
  );
  return url;
}
