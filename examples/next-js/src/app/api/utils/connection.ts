import {
  Connection,
  Commitment,
  clusterApiUrl,
  TransactionMessage,
  AddressLookupTableAccount,
  VersionedTransaction,
} from "@solana/web3.js";

/**
 * Connection configuration options
 * @property endpoint - RPC endpoint URL (defaults to env.SOLANA_RPC or devnet)
 * @property commitment - Commitment level for the connection
 * @property confirmTransactionInitialTimeout - How long to wait for transaction confirmation
 */
export type ConnectionConfig = {
  endpoint?: string;
  commitment?: Commitment;
  confirmTransactionInitialTimeout?: number;
};

/**
 * Creates a Solana Connection instance with consistent configuration
 *
 * Features:
 * 1. Uses environment variables for RPC endpoint
 * 2. Falls back to devnet if no RPC is configured
 * 3. Configurable commitment level and timeouts
 * 4. Consistent settings across all API routes
 *
 * @param config - Optional configuration options
 * @returns Connection - Configured Solana Connection instance
 *
 * Usage:
 * const connection = getConnection({ commitment: 'confirmed' });
 */
export function getConnection(config: ConnectionConfig = {}): Connection {
  const endpoint =
    config.endpoint || process.env.SOLANA_RPC || clusterApiUrl("mainnet-beta");

  return new Connection(endpoint, {
    commitment: config.commitment || "confirmed",
    confirmTransactionInitialTimeout:
      config.confirmTransactionInitialTimeout || 60000, // Default 60 seconds
  });
}

export async function hydrateTransactionMessage(
  tx: VersionedTransaction,
  connection: Connection,
): Promise<TransactionMessage> {
  // hydrate the message's instructions using the static account keys and lookup tables
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

  return TransactionMessage.decompile(tx.message, {
    addressLookupTableAccounts: LUTs,
  });
}
