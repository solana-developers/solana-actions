import {
  Commitment,
  ComputeBudgetInstruction,
  ComputeBudgetProgram,
  Connection,
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import { Transaction } from "@solana/web3.js";
import { toUint8Array } from "js-base64";
import { ActionPostResponse, Reference } from "./types";
import { MEMO_PROGRAM_ID } from "./constants";
import {
  createActionIdentifierInstruction,
  getActionIdentityFromEnv,
} from "./actionIdentity";

/**
 * Thrown when the Action POST response cannot be created.
 */
export class CreatePostResponseError extends Error {
  name = "CreatePostResponseError";
}

/**
 * Arguments to create a POST response payload
 */
export interface CreateActionPostResponseArgs {
  /** POST response fields per the Solana Actions spec. */
  fields: Omit<ActionPostResponse, "transaction"> & {
    /** Solana transaction to be base64 encoded. */
    transaction: Transaction;
  };
  /** Optional signers that will sign the transaction. */
  signers?: Signer[];
  /** Optional identity keypair used to aid in identifying an Action provider */
  actionIdentity?: Signer;
  /** Reference keys to be included in the transaction */
  reference?: Reference;
  /** Options for `getRecentBlockhash`. */
  options?: { commitment?: Commitment };
}

/**
 * Create the payload to be returned in an Action POST response,
 * including signing and base64 encoding the `transaction`
 *
 * @throws {CreatePostResponseError}
 */
export async function createPostResponse({
  fields,
  signers,
  reference,
  actionIdentity,
}: CreateActionPostResponseArgs): Promise<ActionPostResponse> {
  const { transaction } = fields;

  if (!transaction.recentBlockhash)
    transaction.recentBlockhash = "11111111111111111111111111111111";

  // Auto-magically detect the identity keypair
  if (!actionIdentity) {
    try {
      actionIdentity = getActionIdentityFromEnv();
    } catch (err) {
      // do nothing
    }
  }

  if (transaction.instructions.length <= 0) {
    throw new CreatePostResponseError("at least 1 instruction is required");
  }

  if (actionIdentity) {
    const { instruction, reference: finalReference } =
      createActionIdentifierInstruction(actionIdentity, reference);
    transaction.add(instruction);

    const memoId = new PublicKey(MEMO_PROGRAM_ID);
    const nonMemoIndex = transaction.instructions.findIndex(
      (ix) => ix.programId.toBase58() !== memoId.toBase58(),
    );
    if (nonMemoIndex == -1) {
      throw new CreatePostResponseError(
        "transaction requires at least 1 non-memo instruction",
      );
    }

    transaction.instructions[nonMemoIndex].keys.push({
      pubkey: actionIdentity.publicKey,
      isWritable: false,
      isSigner: false,
    });
    transaction.instructions[nonMemoIndex].keys.push({
      pubkey: finalReference,
      isWritable: false,
      isSigner: false,
    });
  }

  if (signers && signers.length) transaction.partialSign(...signers);

  return Object.assign(fields, {
    transaction: Buffer.from(
      transaction.serialize({ requireAllSignatures: false }),
    ).toString("base64"),
  });
}
