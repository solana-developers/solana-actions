import { z } from "zod";
import {
  publicKeySchema,
  numberFromStringSchema,
} from "../../utils/validation";

export const PayMeQuerySchema = z.object({
  blink: z.string(),
  amountUsd: numberFromStringSchema(),
  mint: publicKeySchema.default(
    // USDC
    "EPjFWdd5AufqSSqeM2gEi2U9jFw27yN25g8yLWkxfV8rauYU",
  ),
  payer: publicKeySchema,
  recipient: publicKeySchema,
});

export type PayMeQuery = z.infer<typeof PayMeQuerySchema>;
