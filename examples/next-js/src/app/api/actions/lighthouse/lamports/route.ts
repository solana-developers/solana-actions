import {
  createLighthouseProgram,
  IntegerOperator,
  assertAccountDelta,
  memoryWrite,
  findMemoryPda,
  AccountInfoField,
  LogLevel,
  memoryClose,
} from "lighthouse-sdk-legacy";

import {
  publicKey,
  createNoopSigner,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import { toWeb3JsInstruction } from "@metaplex-foundation/umi-web3js-adapters";
import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
  createPostResponse,
} from "@solana/actions";
import { createActionRoutes } from "@/app/api/utils/action-handler";
import { GenericTransactionExtensionSchema } from "../../paymaster/schema";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  getConnection,
  hydrateTransactionMessage,
} from "@/app/api/utils/connection";
import { createQueryParser } from "@/app/api/utils/validation";
import { LamportsSchema } from "./schema";
import { fetchBlink } from "@/app/api/utils/fetch";

const umi = createUmi("https://api.mainnet-beta.solana.com");
umi.programs.add(createLighthouseProgram());

// stub out the GET & POST handlers
async function handleGet(req: Request): Promise<ActionGetResponse> {
  const requestUrl = new URL(req.url);
  const baseHref = new URL(
    `/api/actions/lighthouse/lamports`,
    requestUrl.origin,
  ).toString();

  return {
    type: "action",
    title: "Lighthouse Lamports",
    icon: new URL("/solana_devs.jpg", requestUrl.origin).toString(),
    description: "Add or remove lamports from a user's account",
    label: "Lamports",
    links: {
      actions: [
        {
          label: "Assert Lamport Spend",
          href: `${baseHref}?protectAccount={protectAccount}&solSpend={solSpend}&blink={blink}&`,
          parameters: [
            {
              type: "url",
              //   type: "blink",
              name: "blink",
              label: "Blink",
              required: true,
            },
            {
              type: "text",
              name: "protectAccount",
              label: "Account to Protect",
              required: true,
            },
            {
              type: "number",
              name: "solSpend",
              label: "Max Sol Spend",
              required: true,
            },
          ],
        },
      ],
    },
  };
}

const parseQueryParams = createQueryParser(LamportsSchema);

// localhost:3000/api/actions/lighthouse/lamports?protectAccount=<paymaster>&solSpend=0.001&blink=
// http://localhost:3000/api/actions/transfer-sol?amount=0.01&to=<account>
async function handlePost(req: Request): Promise<ActionPostResponse> {
  const requestUrl = new URL(req.url);
  const { blink, protectAccount, solSpend } = parseQueryParams(requestUrl);

  const connection = getConnection();
  const body: ActionPostRequest = await req.json();
  const blinkResponse = await fetchBlink(blink, body.account);
  if (!blinkResponse.message) {
    throw new Error("No message found in blink response");
  }
  const tx = VersionedTransaction.deserialize(
    Buffer.from(blinkResponse.transaction, "base64"),
  );

  umi.use(signerIdentity(createNoopSigner(publicKey(protectAccount))));

  const txMessage = await hydrateTransactionMessage(tx, connection);

  let [memory, memoryBump] = findMemoryPda({
    payer: new PublicKey(protectAccount),
    memoryId: 0,
  });

  const preInstruction = toWeb3JsInstruction(
    memoryWrite(umi, {
      memory: publicKey(memory),
      sourceAccount: publicKey(protectAccount),
      writeType: {
        __kind: "AccountInfoField",
        fields: [AccountInfoField.Lamports],
      },
      memoryId: 0,
      writeOffset: 0,
      memoryBump,
    }).getInstructions()[0],
  );

  const postInstructions = [
    toWeb3JsInstruction(
      assertAccountDelta(umi, {
        accountA: publicKey(memory),
        accountB: publicKey(protectAccount),
        logLevel: LogLevel.PlaintextMessage,
        assertion: {
          __kind: "AccountInfo",
          aOffset: 0,
          assertion: {
            __kind: "Lamports",
            value: -solSpend * LAMPORTS_PER_SOL,
            operator: IntegerOperator.GreaterThanOrEqual,
          },
        },
      }).getInstructions()[0],
    ),
    // Close instruction when I want the Sol back haha
    // toWeb3JsInstruction(
    //   memoryClose(umi, {
    //     memory: publicKey(memory),
    //     memoryId: 0,
    //     memoryBump,
    //   }).getInstructions()[0],
    // ),
  ];

  txMessage.instructions = [
    preInstruction,
    ...txMessage.instructions,
    ...postInstructions,
  ];
  txMessage.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  const finalTx = new VersionedTransaction(txMessage.compileToV0Message());

  return createPostResponse({
    fields: {
      transaction: finalTx,
      message: `Added lamport check of -${solSpend} to ${protectAccount}`,
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
