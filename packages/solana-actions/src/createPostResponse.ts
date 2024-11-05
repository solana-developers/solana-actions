import {
  Commitment,
  PublicKey,
  Signer,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
  Transaction,
} from "@solana/web3.js";
import type { Reference } from "./types.js";
import { MEMO_PROGRAM_ID } from "./constants.js";
import {
  createActionIdentifierInstruction,
  getActionIdentityFromEnv,
} from "./actionIdentity.js";
import { ActionPostResponse, TransactionResponse } from "@solana/actions-spec";

/**
 * Thrown when the Action POST response cannot be created.
 */
export class CreatePostResponseError extends Error {
  name = "CreatePostResponseError";
}

/**
 * Arguments to create a POST response payload
 */
export interface CreateActionPostResponseArgs<
  TransactionType = Transaction | VersionedTransaction,
> {
  /** POST response fields per the Solana Actions spec. */
  fields: Omit<TransactionResponse, "transaction"> & {
    /** Solana transaction to be base64 encoded. */
    transaction: TransactionType;
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
export async function createPostResponse(
  args: CreateActionPostResponseArgs,
): Promise<ActionPostResponse> {
  // Auto-magically detect the identity keypair from the env
  if (!args.actionIdentity) {
    try {
      args.actionIdentity = getActionIdentityFromEnv();
    } catch (err) {
      // do nothing
    }
  }

  if (isVersionedTransaction(args.fields.transaction)) {
    return prepareVersionedTransaction(
      args as CreateActionPostResponseArgs<VersionedTransaction>,
    );
  } else {
    return prepareLegacyTransaction(
      args as CreateActionPostResponseArgs<Transaction>,
    );
  }
}

/**
 * Prepare a `VersionedTransaction` to be sent as the ActionPostResponse
 */
async function prepareVersionedTransaction({
  fields,
  signers,
  reference,
  actionIdentity,
}: CreateActionPostResponseArgs<VersionedTransaction>): Promise<ActionPostResponse> {
  if (fields.transaction.message.compiledInstructions.length <= 0) {
    throw new CreatePostResponseError("at least 1 instruction is required");
  }

  if (actionIdentity) {
    let message = TransactionMessage.decompile(fields.transaction.message);

    const { instruction, reference: finalReference } =
      createActionIdentifierInstruction(actionIdentity, reference);

    message.instructions.push(instruction);
    message.instructions = injectReferencesToInstructions(
      message.instructions,
      actionIdentity.publicKey,
      finalReference,
    );

    // recompile the message correctly based on the original version
    if (fields.transaction.version == "legacy") {
      fields.transaction.message = message.compileToLegacyMessage();
    } else {
      fields.transaction.message = message.compileToV0Message();
    }
  }

  if (signers && signers.length) fields.transaction.sign(signers);

  return Object.assign(fields, {
    transaction: Buffer.from(fields.transaction.serialize()).toString("base64"),
  });
}

/**
 * Prepare a legacy `Transaction` to be sent as the `ActionPostResponse`
 */
async function prepareLegacyTransaction({
  fields,
  signers,
  reference,
  actionIdentity,
}: CreateActionPostResponseArgs<Transaction>): Promise<ActionPostResponse> {
  if (fields.transaction.instructions.length <= 0) {
    throw new CreatePostResponseError("at least 1 instruction is required");
  }

  if (actionIdentity) {
    const { instruction, reference: finalReference } =
      createActionIdentifierInstruction(actionIdentity, reference);

    fields.transaction.add(instruction);
    fields.transaction.instructions = injectReferencesToInstructions(
      fields.transaction.instructions,
      actionIdentity.publicKey,
      finalReference,
    );
  }

  if (signers && signers.length) fields.transaction.partialSign(...signers);

  return Object.assign(fields, {
    transaction: Buffer.from(
      fields.transaction.serialize({ requireAllSignatures: false }),
    ).toString("base64"),
  });
}

function injectReferencesToInstructions(
  instructions: TransactionInstruction[],
  actionIdentity: PublicKey,
  reference: PublicKey,
): TransactionInstruction[] {
  // locate a non-memo instruction
  const memoId = new PublicKey(MEMO_PROGRAM_ID);
  const nonMemoIndex = instructions.findIndex(
    (ix) => ix.programId.toBase58() !== memoId.toBase58(),
  );

  if (nonMemoIndex == -1) {
    throw new CreatePostResponseError(
      "transaction requires at least 1 non-memo instruction",
    );
  }

  // insert the 2 reference keys as non signers
  instructions[nonMemoIndex].keys.push({
    pubkey: actionIdentity,
    isWritable: false,
    isSigner: false,
  });
  instructions[nonMemoIndex].keys.push({
    pubkey: reference,
    isWritable: false,
    isSigner: false,
  });

  return instructions;
}

function isVersionedTransaction(
  transaction: Transaction | VersionedTransaction,
): transaction is VersionedTransaction {
  return "version" in transaction;
}
