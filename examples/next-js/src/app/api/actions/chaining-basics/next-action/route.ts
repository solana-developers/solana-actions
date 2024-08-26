/**
 * Solana Action chaining example
 */

import {
  createActionHeaders,
  NextActionPostRequest,
  ActionError,
  CompletedAction,
} from "@solana/actions";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

/**
 * since this endpoint is only meant to handle the callback request
 * for the action chaining, it does not accept or process GET requests
 */
export const GET = async (req: Request) => {
  return Response.json({ message: "Method not supported" } as ActionError, {
    status: 403,
    headers,
  });
};

/**
 * Responding to OPTIONS request is still required even though we ignore GET requests
 *
 * DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
 * THIS WILL ENSURE CORS WORKS FOR BLINKS
 */
export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    const url = new URL(req.url);

    /**
     * we can type the `body.data` to what fields we expect from the GET response above
     */
    const body: NextActionPostRequest = await req.json();

    // body will contain the user's `account` and `memo` input from the user
    console.log("body:", body);

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw 'Invalid "account" provided';
    }

    let signature: string;
    try {
      signature = body.signature;
      if (!signature) throw "Invalid signature";
    } catch (err) {
      throw 'Invalid "signature" provided';
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
    );

    /**
     * todo: do we need to manually re-confirm the transaction?
     * todo: do we need to perform multiple confirmation attempts
     */

    try {
      let status = await connection.getSignatureStatus(signature);

      console.log("signature status:", status);

      if (!status) throw "Unknown signature status";

      // only accept `confirmed` and `finalized` transactions
      if (status.value?.confirmationStatus) {
        if (
          status.value.confirmationStatus != "confirmed" &&
          status.value.confirmationStatus != "finalized"
        ) {
          throw "Unable to confirm the transaction";
        }
      }

      // todo: check for a specific confirmation status if desired
      // if (status.value?.confirmationStatus != "confirmed")
    } catch (err) {
      if (typeof err == "string") throw err;
      throw "Unable to confirm the provided signature";
    }

    /**
     * !TAKE CAUTION!
     *
     * since any client side request can access this public endpoint,
     * a malicious actor could provide a valid signature that does NOT
     * perform the previous action's transaction.
     *
     * todo: validate this transaction is what you expected the user to perform in the previous step
     */

    // manually get the transaction to process and verify it
    const transaction = await connection.getParsedTransaction(
      signature,
      "confirmed",
    );

    console.log("transaction: ", transaction);

    /**
     * returning a `CompletedAction` allows you to update the
     * blink metadata but not allow the user to perform any
     * follow on actions or user input
     *
     * you can update any of these details
     */
    const payload: CompletedAction = {
      type: "completed",
      title: "Chaining was successful!",
      icon: new URL("/solana_devs.jpg", new URL(req.url).origin).toString(),
      label: "Complete!",
      description:
        `You have now completed an action chain! ` +
        `Here was the signature from the last action's transaction: ${signature} `,
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let actionError: ActionError = { message: "An unknown error occurred" };
    if (typeof err == "string") actionError.message = err;
    return Response.json(actionError, {
      status: 400,
      headers,
    });
  }
};
