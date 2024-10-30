import { TransactionInstruction, PublicKey } from "@solana/web3.js";

/**
 * Memo Program ID on Solana
 * This is a system program that allows writing arbitrary data to the blockchain
 */
export const MEMO_PROGRAM_ID = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");

/**
 * Creates an instruction to write a memo to the Solana blockchain
 * 
 * @param message - The message to write to the blockchain
 * @param signers - Array of public keys that need to sign this instruction
 * @returns TransactionInstruction for the memo program
 * 
 * Usage:
 * const instruction = createMemoInstruction("Hello Solana!", [signer.publicKey]);
 */
export function createMemoInstruction(
  message: string,
  signers: PublicKey[] = []
): TransactionInstruction {
  return new TransactionInstruction({
    programId: MEMO_PROGRAM_ID,
    keys: signers.map((pubkey) => ({
      pubkey,
      isSigner: true,
      isWritable: false,
    })),
    data: Buffer.from(message, "utf-8"),
  });
} 