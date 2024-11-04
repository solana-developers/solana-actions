import { z } from "zod";
import {
  blinkSchema,
  insertionTypeSchema,
  numberFromStringSchema,
  publicKeySchema,
} from "../../utils/validation";

// Define the input type (what comes from URL params)
export const TransferSolQuerySchema = z.object({
  to: publicKeySchema,
  amount: numberFromStringSchema({ min: 0 }),
  blink: blinkSchema,
  // insertion one of "prepend", "append"
  insertion: insertionTypeSchema,
});

// Type representing the parsed and transformed data
export type TransferSolQuery = z.infer<typeof TransferSolQuerySchema>;
