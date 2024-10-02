import {
  ActionPostRequest,
  ActionPostResponse,
  TransactionResponse,
} from "@solana/actions-spec";
import { Commitment, Connection, PublicKey } from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import fetch from "cross-fetch";
import { toUint8Array } from "js-base64";
import nacl from "tweetnacl";

/**
 * Thrown when a transaction response can't be fetched.
 */
export class FetchActionError extends Error {
  name = "FetchTransactionError";
}

/**
 * POST response payload that contains the base-64 encoded serialized `transaction` ready to be sent to the client
 */
export interface ActionPostResponseWithSerializedTransaction
  extends Omit<ActionPostResponse, "transaction"> {
  /** serialized Solana transaction */
  transaction: Transaction;
}

/**
 * Fetch the action payload from a Solana Action request link.
 *
 * @param connection - A connection to the cluster.
 * @param account - Account that may sign the transaction.
 * @param link - `link` in the Solana Action spec.
 * @param options - Options for `getRecentBlockhash`.
 *
 * @throws {FetchActionError}
 */
export async function fetchTransaction(
  connection: Connection,
  link: string | URL,
  fields: ActionPostRequest,
  options: { commitment?: Commitment } = {},
): Promise<ActionPostResponseWithSerializedTransaction> {
  const response = await fetch(String(link), {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "omit",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });

  const json = (await response.json()) as TransactionResponse;
  if (!json?.transaction) throw new FetchActionError("missing transaction");
  if (typeof json.transaction !== "string")
    throw new FetchActionError("invalid transaction");

  const transaction = await serializeTransaction(
    connection,
    fields.account,
    json.transaction,
    options,
  );

  return Object.assign(json, {
    transaction,
  });
}

/**
 * Thrown when the base64 encoded action `transaction` cannot be serialized
 */
export class SerializeTransactionError extends Error {
  name = "SerializeTransactionError";
}

/**
 * Serialize a base64 encoded transaction into a web3.js `Transaction`.
 *
 * @param connection - A connection to the cluster.
 * @param account - Account that may sign the transaction.
 * @param base64Transaction - `transaction` in the Solana Action spec.
 * @param options - Options for `getRecentBlockhash`.
 *
 * @throws {SerializeTransactionError}
 */
export async function serializeTransaction(
  connection: Connection,
  account: string | PublicKey,
  base64Transaction: string,
  { commitment }: { commitment?: Commitment } = {},
): Promise<Transaction> {
  if (typeof account === "string") account = new PublicKey(account);

  const transaction = Transaction.from(toUint8Array(base64Transaction));
  const { signatures, feePayer, recentBlockhash } = transaction;

  if (signatures.length) {
    if (!feePayer) throw new SerializeTransactionError("missing fee payer");
    if (!feePayer.equals(signatures[0].publicKey))
      throw new SerializeTransactionError("invalid fee payer");
    if (!recentBlockhash)
      throw new SerializeTransactionError("missing recent blockhash");

    // A valid signature for everything except `account` must be provided.
    const message = transaction.serializeMessage();
    for (const { signature, publicKey } of signatures) {
      if (signature) {
        if (
          !nacl.sign.detached.verify(message, signature, publicKey.toBuffer())
        )
          throw new SerializeTransactionError("invalid signature");
      } else if (publicKey.equals(account)) {
        // If the only signature expected is for `account`, ignore the recent blockhash in the transaction.
        if (signatures.length === 1) {
          transaction.recentBlockhash = (
            await connection.getRecentBlockhash(commitment)
          ).blockhash;
        }
      } else {
        throw new SerializeTransactionError("missing signature");
      }
    }
  } else {
    // Ignore the fee payer and recent blockhash in the transaction and initialize them.
    transaction.feePayer = account;
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash(commitment)
    ).blockhash;
  }

  return transaction;
}
