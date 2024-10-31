/**
 * Solana Actions Example
 */

import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
  createActionHeaders,
} from "@solana/actions";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { createQueryParser } from "../../utils/validation";
import { TransferSolQuerySchema } from "./schema";
import { createActionRoutes } from "../../utils/action-handler";
import { getConnection } from "../../utils/connection";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

const parseQueryParams = createQueryParser(TransferSolQuerySchema);

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const baseHref = new URL(
    `/api/actions/transfer-sol?`,
    requestUrl.origin,
  ).toString();

  return {
    type: "action",
    title: "Actions Example - Transfer Native SOL",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Transfer SOL to another Solana wallet",
    label: "Transfer",
    links: {
      actions: [
        {
          label: "Send SOL",
          href: `${baseHref}&amount={amount}&to={to}`,
          parameters: [
            {
              name: "amount",
              label: "Enter the amount of SOL to send",
              required: true,
            },
            {
              name: "to",
              label: "Enter the address to send SOL",
              required: true,
            },
          ],
        },
      ],
    },
  };
}

async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const { to: toPubkey, amount } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const connection = getConnection();

  // ensure the receiving account will be rent exempt
  const minimumBalance = await connection.getMinimumBalanceForRentExemption(0);
  if (amount * LAMPORTS_PER_SOL < minimumBalance) {
    throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
  }

  const transferSolInstruction = SystemProgram.transfer({
    fromPubkey: account,
    toPubkey: toPubkey,
    lamports: amount * LAMPORTS_PER_SOL,
  });

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  }).add(transferSolInstruction);

  return createPostResponse({
    fields: {
      transaction,
      message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
    },
  });
}

export const { GET, POST, OPTIONS } = createActionRoutes(
  {
    GET: handleGet,
    POST: handlePost,
  },
  headers,
);
