import { z } from "zod";
import {
  blinkSchema,
  insertionTypeSchema,
  publicKeySchema,
} from "../../utils/validation";

// Define the input type (what comes from URL params)
export const TransferCnftQuerySchema = z.object({
  to: publicKeySchema,
  asset: publicKeySchema,
  blink: blinkSchema.optional(),
  // insertion one of "prepend", "append"
  insertion: insertionTypeSchema.optional(),
});

// Type representing the parsed and transformed data
export type TransferSolQuery = z.infer<typeof TransferCnftQuerySchema>;
