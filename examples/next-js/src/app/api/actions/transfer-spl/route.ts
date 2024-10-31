import { ActionGetResponse, ActionPostRequest, ActionPostResponse, createActionHeaders, createPostResponse } from "@solana/actions";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getConnection } from "../../utils/connection";
import { createActionRoutes } from "../../utils/action-handler";
import { TransferSplQuerySchema } from "./schema";
import { createQueryParser } from "../../utils/validation";
import { createTransferInstruction, getAssociatedTokenAddressSync, getMint } from "@solana/spl-token";

// create the standard headers for this route (including CORS)
const headers = createActionHeaders();

const parseQueryParams = createQueryParser(TransferSplQuerySchema);

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
    const result = TransferSplQuerySchema.safeParse(
      Object.fromEntries(requestUrl.searchParams)
    );

  const baseHref = new URL(
    `/api/actions/transfer-spl?`,
    requestUrl.origin,
  ).toString();

  return {
    type: "action",
    title: "Actions Example - Transfer SPL Token",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Transfer SOL to another Solana wallet",
    label: "Transfer",
    links: {
      actions: [
        {
          label: "Send SPL Token",
          href: `${baseHref}&amount={amount}&to={to}&mint={mint}`,
          parameters: [
            {
              name: "amount",
              label: "Enter the amount of SPL tokens to send",
              required: true,
            },
            {
              name: "to",
              label: "Enter the address to send SPL tokens",
              required: true,
            },
            {
              name: "mint",
              label: "Enter the SPL token mint address",
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
  const { to: toPubkey, mint, amount } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const connection = getConnection();
  // get ATAs
  const mintInfo = await getMint(connection, mint, "confirmed");
  const sourceAta = getAssociatedTokenAddressSync(mint, account);
  const destinationAta = getAssociatedTokenAddressSync(mint, toPubkey);
  // get the true amount of tokens to transfer
  const amountToTransfer = BigInt(amount) * BigInt(10 ** mintInfo.decimals);
  const transferSplInstruction = createTransferInstruction(sourceAta, destinationAta, account, amountToTransfer);

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  }).add(transferSplInstruction);

  return createPostResponse({
    fields: {
      transaction,
      message: `Send ${amount} ${mint.toBase58()} to ${toPubkey.toBase58()}`,
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
