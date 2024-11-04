import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import { createActionRoutes } from "../../utils/action-handler";
import { PayMeQuerySchema } from "./schema";
import { createQueryParser } from "../../utils/validation";
import { VersionedTransaction } from "@solana/web3.js";
import { fetchBlink } from "../../utils/fetch";
import {
  getConnection,
  hydrateTransactionMessage,
} from "../../utils/connection";
import { createTransferInstruction } from "@solana/spl-token";

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const baseHref = new URL("/api/actions/memo", requestUrl.origin).toString();

  return {
    type: "action",
    title: "Actions Example - Pay Me",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Append a payment instruction to a recipient",
    label: "Write",
    links: {
      actions: [
        {
          label: "Pay Me",
          href: `${baseHref}?mint={mint}&recipient={recipient}&amountUsd={amountUsd}&blink={blink}`,
          parameters: [
            {
              type: "text",
              name: "mint",
              label: "Mint",
              required: false,
            },
            {
              type: "text",
              name: "recipient",
              label: "Recipient",
              required: true,
            },
            {
              type: "number",
              name: "amountUsd",
              label: "Amount USD",
              required: true,
            },
          ],
        },
      ],
    },
  };
}

const parseQueryParams = createQueryParser(PayMeQuerySchema);

async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const { blink, amountUsd, mint, payer, recipient } =
    parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();

  // get a quote for the amount in USD
  const jupPrice: { data: { [key: string]: { price: number } } } = await (
    await fetch(`https://api.jup.ag/price/v2?ids=${mint.toBase58()}`)
  ).json();

  const amountInMint = Math.ceil(
    jupPrice.data[mint.toBase58()].price * amountUsd,
  );

  const txResponseBody = await fetchBlink(blink, body.account);
  const connection = getConnection();
  const tx = VersionedTransaction.deserialize(
    Buffer.from(txResponseBody.transaction, "base64"),
  );
  const txMessage = await hydrateTransactionMessage(tx, connection);

  const finalTx = new VersionedTransaction(txMessage.compileToV0Message());

  return createPostResponse({
    fields: {
      transaction: finalTx,
      message: `Payed ${amountUsd} in ${mint.toBase58()} to ${recipient.toBase58()}"`,
    },
  });
}

export const { GET, POST, OPTIONS } = createActionRoutes(
  {
    GET: handleGet,
    POST: handlePost,
  },
  createActionHeaders(),
);
