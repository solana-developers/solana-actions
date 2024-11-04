import { ActionError } from "@solana/actions";
import { fromZodError } from "zod-validation-error";
import { ZodError } from "zod";
import { TransactionInstruction, VersionedTransaction } from "@solana/web3.js";
import { getConnection, hydrateTransactionMessage } from "./connection";
import { InsertionType } from "./validation";
import { fetchBlink } from "./fetch";

type ActionHandler<T> = (req: Request) => Promise<Response>;
type ActionHandlerFn<T> = (req: Request) => Promise<T>;

export type ActionRouteHandlers = {
  GET?: ActionHandlerFn<any>;
  POST?: ActionHandlerFn<any>;
};

/**
 * Creates a handler for OPTIONS requests, which is required for CORS preflight requests.
 * Returns an empty response with the appropriate CORS headers.
 */
export function createOptionsHandler(
  headers: HeadersInit,
): ActionHandler<null> {
  return async () => Response.json(null, { headers });
}

/**
 * Creates a set of route handlers for a Solana Action API endpoint.
 *
 * Features:
 * - Automatically adds OPTIONS handler for CORS support
 * - Wraps handlers with error handling
 * - Ensures consistent response format
 * - Handles common error types (Zod validation, strings, Error objects)
 *
 * @param handlers - Object containing GET and/or POST handler functions
 * @param headers - Headers to include in all responses (including CORS headers)
 * @returns Object containing wrapped route handlers
 */
export function createActionRoutes(
  handlers: ActionRouteHandlers,
  headers: HeadersInit,
) {
  const routes: Record<string, ActionHandler<any>> = {
    // Always include OPTIONS handler for CORS preflight requests
    OPTIONS: createOptionsHandler(headers),
  };

  if (handlers.GET) {
    routes.GET = createActionHandler(handlers.GET, headers);
  }

  if (handlers.POST) {
    routes.POST = createActionHandler(handlers.POST, headers);
  }

  return routes;
}

/**
 * Wraps a handler function with error handling and response formatting.
 *
 * Error handling:
 * - ZodError: Converts to user-friendly validation error message
 * - String: Uses directly as error message
 * - Error: Uses error.message
 * - Unknown: Falls back to generic error message
 *
 * All responses include the provided headers and are formatted as JSON.
 */
function createActionHandler(
  handler: ActionHandlerFn<any>,
  headers: HeadersInit,
): ActionHandler<any> {
  return async (req: Request) => {
    try {
      const result = await handler(req);
      return Response.json(result, { headers });
    } catch (err) {
      console.error(err);

      let actionError: ActionError = { message: "An unknown error occurred" };

      if (err instanceof ZodError) {
        actionError.message = fromZodError(err).message;
      } else if (typeof err === "string") {
        actionError.message = err;
      } else if (err instanceof Error) {
        actionError.message = err.message;
      }

      return Response.json(actionError, {
        status: 400,
        headers,
      });
    }
  };
}

export async function insertInstructionsInBlink(
  blink: string,
  insertion: InsertionType,
  account: string,
  instructions: TransactionInstruction[],
) {
  const txResponseBody = await fetchBlink(blink, account);

  const connection = getConnection();
  const tx = VersionedTransaction.deserialize(
    Buffer.from(txResponseBody.transaction, "base64"),
  );
  const txMessage = await hydrateTransactionMessage(tx, connection);
  if (insertion === "prepend") {
    txMessage.instructions.push(...instructions);
  } else {
    txMessage.instructions.unshift(...instructions);
  }
  return new VersionedTransaction(txMessage.compileToV0Message());
}
