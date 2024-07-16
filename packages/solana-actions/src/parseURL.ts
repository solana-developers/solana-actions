import type { SupportedProtocols } from "@solana/actions-spec";
import { BLINKS_QUERY_PARAM, HTTPS_PROTOCOL } from "./constants.js";
import type { ActionRequestURLFields, BlinkURLFields } from "./types.js";

/**
 * Thrown when a URL can't be parsed as a Solana Action URL.
 */
export class ParseURLError extends Error {
  name = "ParseURLError";
}

/**
 * Parse a Solana Action URL.
 *
 * @param url - URL to parse.
 *
 * @throws {ParseURLError}
 */
export function parseURL(
  url: string | URL,
): ActionRequestURLFields | BlinkURLFields {
  if (typeof url === "string") {
    if (url.length > 2048) throw new ParseURLError("length invalid");
    url = new URL(url);
  }

  if (/^https?/.test(url.protocol)) {
    return parseBlinkURL(url);
  }

  const protocol = url.protocol as SupportedProtocols;

  if (protocol !== "solana:" && protocol !== "solana-action:") {
    throw new ParseURLError("protocol invalid");
  }
  if (!url.pathname) throw new ParseURLError("pathname missing");
  if (/[:%]/.test(url.pathname) == false)
    throw new ParseURLError("pathname invalid");

  return parseActionRequestURL(url);
}

function parseActionRequestURL({
  pathname,
  searchParams,
}: URL): ActionRequestURLFields {
  const link = new URL(decodeURIComponent(pathname));
  if (link.protocol !== HTTPS_PROTOCOL) throw new ParseURLError("link invalid");

  const label = searchParams.get("label") || undefined;
  const message = searchParams.get("message") || undefined;

  return {
    link,
    label,
    message,
  };
}

function parseBlinkURL(blink: URL): BlinkURLFields {
  let link = blink.searchParams.get(BLINKS_QUERY_PARAM);
  if (!link) throw new ParseURLError("invalid blink url");

  return {
    blink,
    action: parseURL(new URL(link)) as ActionRequestURLFields,
  };
}
