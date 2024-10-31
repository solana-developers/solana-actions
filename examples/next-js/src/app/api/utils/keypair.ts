import { Keypair } from "@solana/web3.js";
import { Buffer } from "buffer";

/**
 * Loads a Keypair from a base58 or byte array secret key string
 * 
 * @param secretKeyString - Either a base58 string or a comma-separated byte array string
 * @returns Keypair instance
 * 
 * Usage:
 * const kp = loadKeypairFromString(process.env.SOME_SECRET_KEY)
 */
export function loadKeypairFromString(secretKeyString: string): Keypair {
  try {
    // First try parsing as a byte array
    if (secretKeyString.includes(',')) {
      const bytes = secretKeyString.substring(1, secretKeyString.length - 1).split(',').map(s => parseInt(s));
      return Keypair.fromSecretKey(new Uint8Array(bytes));
    }
    
    // Then try as base64
    return Keypair.fromSecretKey(
      Buffer.from(secretKeyString, 'base64')
    );
  } catch (err) {
    throw new Error('Invalid secret key format. Must be base58 or byte array.');
  }
}

/**
 * Loads the paymaster keypair from environment variables
 * 
 * @returns Keypair for the paymaster account
 * @throws Error if PAYMASTER_SECRET_KEY is not set
 */
export function loadPaymasterKeypair(): Keypair {
  const secretKey = process.env.PAYMASTER_SECRET_KEY;
  if (!secretKey) {
    throw new Error('PAYMASTER_SECRET_KEY environment variable is not set');
  }
  
  return loadKeypairFromString(secretKey);
} 