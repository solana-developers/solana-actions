/**
 * Solana Actions Example
 */

import {
  ActionPostResponse,
  createPostResponse,
  ActionGetResponse,
  createActionHeaders,
  Action,
  ActionPostRequest,
} from "@solana/actions";
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { createActionRoutes } from "../../utils/action-handler";
import { getConnection } from "../../utils/connection";
import { MemoQuerySchema } from "./schema";

// Create memo program instruction
import { createMemoInstruction } from "./instruction";

import { createQueryParser } from "../../utils/validation";

const headers = createActionHeaders();

const parseQueryParams = createQueryParser(MemoQuerySchema);

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const baseHref = new URL("/api/actions/memo", requestUrl.origin).toString();

  return {
    type: "action",
    title: "Actions Example - Write Memo",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Write a message to the Solana network",
    label: "Write",
    links: {
      actions: [
        {
          label: "Write Message",
          href: `${baseHref}?message={message}`,
          parameters: [
            {
              type: "textarea",
              name: "message",
              label: "Enter your message",
              required: true,
              min: 1,
              max: 256,
            },
          ],
        },
      ],
    },
  };
}

async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const { message } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const connection = getConnection();
  const { blockhash } = await connection.getLatestBlockhash();

  // Create the memo instruction
  const memoInstruction = createMemoInstruction(message, [account]);

  // Create a versioned transaction
  const messageV0 = new TransactionMessage({
    payerKey: account,
    recentBlockhash: blockhash,
    instructions: [memoInstruction],
  }).compileToV0Message();

  const transaction = new VersionedTransaction(messageV0);

  return createPostResponse({
    fields: {
      transaction,
      message: `Write memo: "${message}"`,
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
