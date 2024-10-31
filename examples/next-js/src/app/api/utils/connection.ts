import { Connection, Commitment, clusterApiUrl } from "@solana/web3.js";

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
  const endpoint = config.endpoint || process.env.SOLANA_RPC || clusterApiUrl("mainnet-beta");
  
  return new Connection(endpoint, {
    commitment: config.commitment || 'confirmed',
    confirmTransactionInitialTimeout: 
      config.confirmTransactionInitialTimeout || 
      60000, // Default 60 seconds
  });
} 