import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import { createActionRoutes } from "../../utils/action-handler";
import { loadPaymasterKeypair } from "../../utils/keypair";
import { createQueryParser } from "../../utils/validation";
import { GenericTransactionExtensionSchema } from "./schema";
import { VersionedTransaction } from "@solana/web3.js";
import {
  getConnection,
  hydrateTransactionMessage,
} from "../../utils/connection";
import { fetchBlink } from "../../utils/fetch";

const headers = createActionHeaders();

async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const paymaster = loadPaymasterKeypair();

  const baseHref = new URL(
    `/api/actions/paymaster`,
    requestUrl.origin,
  ).toString();

  return {
    type: "action",
    title: "Actions Example - Paymaster",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: `Have ${paymaster.publicKey.toBase58()} cover the tx fee`,
    label: "Paymaster",
    links: {
      actions: [
        {
          label: "Cover Fee",
          href: `${baseHref}?blink={blink}`,
          parameters: [
            {
              type: "url",
              name: "blink",
              label: "Blink URL",
              required: true,
            },
          ],
        },
      ],
    },
  };
}

const parseQueryParams = createQueryParser(GenericTransactionExtensionSchema);

// http://localhost:3000/api/actions/transfer-sol?amount=0.01&to=<account>
// http://localhost:3000/api/actions/transfer-sol?amount=0.001&to=<account>
// http://localhost:3000/api/actions/transfer-spl?&amount=1&to=<account>&mint=<mint>

// http://localhost:3000/api/actions/lighthouse/lamports?protectAccount=6Le7uLy8Y2JvCq5x5huvF3pSQBvP1Y6W325wNpFz4s4u&solSpend=0.001&blink=
// http%3A%2F%2Flocalhost%3A3000%2Fapi%2Factions%2Ftransfer-sol%3Famount%3D0.01%26to%3D67ZiM1TRqPFR5s2Jz1z4d6noHHBRRzt1Te6xbWmPgYF7
// localhost:3000/api/actions/transfer-sol?amount=0.01&to=67ZiM1TRqPFR5s2Jz1z4d6noHHBRRzt1Te6xbWmPgYF7

async function handlePost(req: Request): Promise<ActionPostResponse> {
  console.log("Request", req);
  const requestUrl = new URL(req.url);
  console.log("Request URL", requestUrl);
  const paymaster = loadPaymasterKeypair();
  const { blink } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();

  const txResponseBody = await fetchBlink(blink, body.account);

  const connection = getConnection();
  const tx = VersionedTransaction.deserialize(
    Buffer.from(txResponseBody.transaction, "base64"),
  );

  const txMessage = await hydrateTransactionMessage(tx, connection);

  // Modify the message to use the paymaster as the payer
  txMessage.payerKey = paymaster.publicKey;
  txMessage.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const finalTx = new VersionedTransaction(txMessage.compileToV0Message());
  finalTx.sign([paymaster]);

  return createPostResponse({
    fields: {
      transaction: finalTx,
      message: `Covered fee for "${Buffer.from(tx.serialize()).toString(
        "base64",
      )}"`,
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
