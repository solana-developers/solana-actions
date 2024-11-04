import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import {
  createActionRoutes,
  createOptionsHandler,
  insertInstructionsInBlink,
} from "../../utils/action-handler";
import { PublicKey, Transaction } from "@solana/web3.js";
import { getConnection } from "../../utils/connection";
import { VersionedTransaction } from "@solana/web3.js";
import { createQueryParser } from "../../utils/validation";
import { TransferCnftQuerySchema } from "./schema";
import { dasApi } from "@metaplex-foundation/digital-asset-standard-api";
import {
  getAssetWithProof,
  mplBubblegum,
  transfer,
} from "@metaplex-foundation/mpl-bubblegum";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  publicKey,
  signerIdentity,
  createNoopSigner,
} from "@metaplex-foundation/umi";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const baseHref = new URL(
    `/api/actions/transfer-cnft?`,
    requestUrl.origin,
  ).toString();

  return {
    type: "action",
    title: "Actions Example - Transfer cNFT",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Transfer cNFT to another Solana wallet",
    label: "Transfer cNFT",
    links: {
      actions: [
        {
          label: "Transfer cNFT",
          href: `${baseHref}&asset={asset}&to={to}`,
          //   href: `${baseHref}&asset={asset}&to={to}&blink={blink}&insertion={insertion}`,
          parameters: [
            {
              name: "asset",
              label: "Enter the asset ID (mint address) to transfer",
              required: true,
            },
            {
              name: "to",
              label: "Enter the recipient's address",
              required: true,
            },
            // {
            //   type: "url",
            //   name: "blink",
            //   label: "",
            //   required: false,
            // },
            // {
            //   type: "radio",
            //   name: "insertion",
            //   label: "",
            //   required: false,
            //   options: [
            //     { label: "Prepend", value: "prepend" },
            //     { label: "Append", value: "append" },
            //   ],
            // },
          ],
        },
      ],
    },
  };
}

const parseQueryParams = createQueryParser(TransferCnftQuerySchema);

async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const {
    to: toPubkey,
    asset,
    blink,
    insertion,
  } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();
  const account = new PublicKey(body.account);

  const connection = getConnection();

  const umi = createUmi(connection.rpcEndpoint)
    .use(mplBubblegum())
    .use(dasApi())
    .use(signerIdentity(createNoopSigner(publicKey(account))));

  const assetWithProof = await getAssetWithProof(umi as any, publicKey(asset), {
    truncateCanopy: true,
  });

  const transferCnftIx = toWeb3JsInstruction(
    transfer(umi, {
      ...assetWithProof,
      leafOwner: publicKey(account),
      newLeafOwner: publicKey(toPubkey),
    }).getInstructions()[0],
  );

  if (blink) {
    return createPostResponse({
      fields: {
        transaction: await insertInstructionsInBlink(
          blink,
          insertion ?? "prepend",
          body.account,
          [transferCnftIx],
        ),
        message: `Transfer cNFT to ${toPubkey.toBase58()}`,
      },
    });
  }

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: account,
    blockhash,
    lastValidBlockHeight,
  }).add(transferCnftIx);

  return createPostResponse({
    fields: {
      message: "Transfer cNFT",
      transaction,
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
