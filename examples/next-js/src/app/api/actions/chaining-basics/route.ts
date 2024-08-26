/**
 * Solana Action chaining example
 */

import {
  ActionPostResponse,
  createPostResponse,
  MEMO_PROGRAM_ID,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
  ActionError,
} from "@solana/actions";
import {
  clusterApiUrl,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

export const GET = async (req: Request) => {
  const payload: ActionGetResponse = {
    title: "Simple Action Chaining Example",
    icon: new URL("/solana_devs.jpg", new URL(req.url).origin).toString(),
    description: "Perform a simple action chain",
    label: "Send Memo",
    links: {
      actions: [
        {
          href: "/api/actions/chaining-basics",
          label: "Send Memo",
          parameters: [
            {
              patternDescription: "Short message here",
              name: "memo",
              label: "Send a message on-chain using a Memo",
              type: "textarea",
            },
          ],
        },
      ],
    },
  };

  return Response.json(payload, {
    headers,
  });
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async () => Response.json(null, { headers });

export const POST = async (req: Request) => {
  try {
    /**
     * we can type the `body.data` to what fields we expect from the GET response above
     *
     * NOTE: there is currently a bug in the blinks sdk that will
     * result in the body data being passed in `body.data` OR `body.params`
     * (it should always be `body.data`). so we are handling that scenario here
     *
     * todo: remove this workaround when that bug is fixed and rolled out to wallets
     */
    const body: ActionPostRequest<{ memo: string }> & {
      params: ActionPostRequest<{ memo: string }>["data"];
    } = await req.json();

    // body will contain the user's `account` and `memo` input from the user
    console.log("body:", body);

    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      throw 'Invalid "account" provided';
    }

    // read in the user input `memo` value
    // todo: see note above on `body`
    const memoMessage = (body.params?.memo || body.data?.memo) as
      | string
      | undefined;

    // todo: for simplicity, we are not doing any much validation on this user input
    if (!memoMessage) {
      throw 'Invalid "memo" provided';
    }

    const connection = new Connection(
      process.env.SOLANA_RPC! || clusterApiUrl("devnet"),
    );

    const transaction = new Transaction().add(
      // note: `createPostResponse` requires at least 1 non-memo instruction
      ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1000,
      }),
      new TransactionInstruction({
        programId: new PublicKey(MEMO_PROGRAM_ID),
        data: Buffer.from(memoMessage, "utf8"),
        keys: [],
      }),
    );

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Post this memo on-chain",
        links: {
          /**
           * this `href` will receive a POST request (callback)
           * with the confirmed `signature`
           *
           * you could also use query params to track whatever step you are on
           */
          next: {
            type: "post",
            href: "/api/actions/chaining-basics/next-action",
          },
        },
      },
      // no additional signers are required for this transaction
      // signers: [],
    });

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
