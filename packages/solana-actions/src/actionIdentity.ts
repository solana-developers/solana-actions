import {
  ConfirmedSignatureInfo,
  Connection,
  Keypair,
  PublicKey,
  Signer,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";
import nacl from "tweetnacl";
import type { Reference } from "./types.js";
import { MEMO_PROGRAM_ID } from "./constants.js";
import { findReference } from "./findReference.js";
import { SOLANA_ACTIONS_PROTOCOL } from "@solana/actions-spec";

const ACTIONS_IDENTITY_SCHEMA = {
  separator: ":",
  protocol: ("solana-action:" as SOLANA_ACTIONS_PROTOCOL).replace(":", ""),
  /** avoids magic numbers */
  scheme: {
    protocol: 0, // should always be zero
    identity: 1,
    reference: 2, // reference
    signature: 3,
  },
};

export function createActionIdentifierMemo(
  identity: Signer,
  reference: Reference,
) {
  const signature = nacl.sign.detached(reference.toBytes(), identity.secretKey);

  const identifier = new Array(
    Object.keys(ACTIONS_IDENTITY_SCHEMA.scheme).length,
  );
  identifier[ACTIONS_IDENTITY_SCHEMA.scheme.protocol] =
    ACTIONS_IDENTITY_SCHEMA.protocol;
  identifier[ACTIONS_IDENTITY_SCHEMA.scheme.identity] =
    identity.publicKey.toBase58();
  identifier[ACTIONS_IDENTITY_SCHEMA.scheme.reference] = reference.toBase58();
  identifier[ACTIONS_IDENTITY_SCHEMA.scheme.signature] = bs58.encode(signature);

  // todo: we should likely have a test to make sure this never exceeds the memo instruction limit
  // "up to 566 bytes" per https://spl.solana.com/memo#compute-limits
  // these are normally < 200 bytes
  // console.log('length:', Buffer.from(memo, 'utf-8').length);

  return identifier.join(ACTIONS_IDENTITY_SCHEMA.separator);
}

/**
 * Thrown when the Action POST response cannot be created.
 */
export class ActionIdentifierError extends Error {
  name = "CreatePostResponseError";
}

export function validateActionIdentifierMemo(
  identity: PublicKey,
  memos: string | string[] | null,
): false | { verified: true; reference: string } {
  if (!memos) return false;
  // web3js SignatureResultInfo can have multiple memos in the response
  // each memo is semi-colon separated
  if (typeof memos == "string") memos = memos.split(";");

  for (let i = 0; i < memos.length; i++) {
    try {
      let memo = memos[i].trim();
      // Remove the Memo program's byte count prefix
      if (/^\[\d+\] /.test(memo)) {
        memo = memo.match(/^\[\d+\] (.*)/)?.[1].trim() || memo;
      }

      if (/^([\w\d\-]+:){2,}/g.test(memo) == false) {
        throw new ActionIdentifierError("invalid memo formatting");
      }

      const identifier = memo.split(ACTIONS_IDENTITY_SCHEMA.separator);
      if (
        identifier.length !== Object.keys(ACTIONS_IDENTITY_SCHEMA.scheme).length
      ) {
        throw new ActionIdentifierError("invalid memo length");
      }

      // todo: ? verify the identifier protocol matches the desired one (i.e. ACTIONS_IDENTITY_SCHEMA.protocol)
      // const protocol = identifier[ACTIONS_IDENTITY_SCHEMA.scheme.protocol];
      let memoIdentity: PublicKey;
      try {
        memoIdentity = new PublicKey(
          identifier[ACTIONS_IDENTITY_SCHEMA.scheme.identity],
        );
      } catch (err) {
        throw new ActionIdentifierError("malformed memo identity");
      }

      if (!memoIdentity)
        throw new ActionIdentifierError("invalid memo identity");
      if (memoIdentity.toBase58() !== identity.toBase58()) {
        throw new ActionIdentifierError("identity mismatch");
      }

      const verified = nacl.sign.detached.verify(
        bs58.decode(identifier[ACTIONS_IDENTITY_SCHEMA.scheme.reference]),
        bs58.decode(identifier[ACTIONS_IDENTITY_SCHEMA.scheme.signature]),
        identity.toBytes(),
      );

      if (verified) {
        return {
          verified: true,
          reference: identifier[ACTIONS_IDENTITY_SCHEMA.scheme.reference],
        };
      }
    } catch (err) {
      // do nothing
    }
  }
  return false;
}

export async function verifySignatureInfoForIdentity(
  connection: Connection,
  identity: Signer,
  sigInfo: ConfirmedSignatureInfo,
): Promise<boolean> {
  try {
    const validated = validateActionIdentifierMemo(
      identity.publicKey,
      sigInfo.memo,
    );
    if (!validated) return false;

    const confirmedSigInfo = await findReference(
      connection,
      new PublicKey(validated.reference),
    );

    if (confirmedSigInfo.signature === sigInfo.signature) return true;
  } catch (err) {
    //do nothing
  }
  return false;
}

/**
 *
 */
export function createActionIdentifierInstruction(
  identity: Signer,
  reference: PublicKey = new Keypair().publicKey,
): {
  memo: string;
  instruction: TransactionInstruction;
  reference: Reference;
} {
  const memo = createActionIdentifierMemo(identity, reference);

  return {
    memo,
    reference,
    instruction: new TransactionInstruction({
      programId: new PublicKey(MEMO_PROGRAM_ID),
      data: Buffer.from(memo, "utf8"),
      // Adding any keys will trigger the memo instruction to require they sign
      // which would implicitly result in a transaction failure since they are not signing
      keys: [],
    }),
  };
}

export function getActionIdentityFromEnv(envKey = "ACTION_IDENTITY_SECRET") {
  try {
    if (!process.env[envKey]) throw Error("missing env key");
    // todo: maybe add in some error checks
    return Keypair.fromSecretKey(
      Buffer.from(JSON.parse(process.env[envKey] as string)),
    );
  } catch (err) {
    throw new Error(`invalid identity in env variable: '${envKey}'`);
  }
}
