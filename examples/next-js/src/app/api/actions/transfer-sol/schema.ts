import { z } from "zod";
import { PublicKey } from "@solana/web3.js";
import { DEFAULT_SOL_AMOUNT } from "./const";
import { numberFromStringSchema, publicKeySchema } from "../../utils/validation";

// Define the input type (what comes from URL params)
export const TransferSolQuerySchema = z.object({
  to: publicKeySchema,
  amount: numberFromStringSchema({ min: 0 }),
});

// Type representing the parsed and transformed data
export type TransferSolQuery = z.infer<typeof TransferSolQuerySchema>;