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
import {
  AddressLookupTableAccount,
  Message,
  MessageV0,
  Transaction,
  TransactionMessage,
  VersionedMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { getConnection } from "../../utils/connection";

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

async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const paymaster = loadPaymasterKeypair();
  const { blink } = parseQueryParams(requestUrl);

  const body: ActionPostRequest = await req.json();

  const txResponse = await fetch(blink, {
    method: "POST",
    body: JSON.stringify({ account: body.account }),
  });

  const txResponseBody: ActionPostResponse = await txResponse.json();
  const tx = VersionedTransaction.deserialize(
    Buffer.from(txResponseBody.transaction, "base64"),
  );

  // hydrate the message's instructions using the static account keys and lookup tables
  const connection = getConnection();
  const LUTs = (
    await Promise.all(
      tx.message.addressTableLookups.map((acc) =>
        connection.getAddressLookupTable(acc.accountKey),
      ),
    )
  )
    .map((lut) => lut.value)
    .filter((val) => val !== null) as AddressLookupTableAccount[];

  // if we need to get all accounts
  // const allAccs = tx.message.getAccountKeys({ addressLookupTableAccounts: LUTs })
  //   .keySegments().reduce((acc, cur) => acc.concat(cur), []);

  const txMessage = TransactionMessage.decompile(tx.message, {
    addressLookupTableAccounts: LUTs,
  });

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
