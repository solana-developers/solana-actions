import {
  ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
} from "@solana/actions";
import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { Buffer } from "node:buffer";

if (globalThis.Buffer === undefined) {
  globalThis.Buffer = Buffer;
}

// you should use a private RPC here
const connection = new Connection("https://api.mainnet-beta.solana.com");

const app = new Hono();

app.use(
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization", "Accept-Encoding"],
    allowMethods: ["GET", "POST", "PUT", "OPTIONS"],
  })
);

app.get("/", (c) => {
  const response: ActionGetResponse = {
    title: "Send me some SOL",
    description: "This is a simple action that allows to tip a creator",
    icon: "https://img.fotofolio.xyz/?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FSo11111111111111111111111111111111111111112%2Flogo.png",
    label: "Tip 0.1 SOL",
  };

  return c.json(response);
});

app.post("/", async (c) => {
  const req = await c.req.json<ActionPostRequest>();

  const transaction = await prepareTransaction(new PublicKey(req.account));

  const response: ActionPostResponse = {
    transaction: Buffer.from(transaction.serialize()).toString("base64"),
  };

  return c.json(response);
});

async function prepareTransaction(payer: PublicKey) {
  const transferIx = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: new PublicKey(PublicKey.default),
    lamports: 10000000, // 0.1 sol
  });

  const blockhash = await connection
    .getLatestBlockhash({ commitment: "max" })
    .then((res) => res.blockhash);
  const messageV0 = new TransactionMessage({
    payerKey: payer,
    recentBlockhash: blockhash,
    instructions: [transferIx],
  }).compileToV0Message();
  return new VersionedTransaction(messageV0);
}

export default app;
